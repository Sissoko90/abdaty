package com.abdatytch.backend.security.filter;

import com.abdatytch.backend.repository.SuspiciousIPRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.regex.Pattern;

/**
 * Filtre de sécurité pour protéger contre les attaques courantes.
 * Implémente la protection contre XSS, SQL injection, path traversal, etc.
 */
@Component
@Order(1)
public class SecurityFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(SecurityFilter.class);

    // Patterns pour détecter les attaques
    private static final Pattern XSS_PATTERN = Pattern.compile("<script.*?>.*?</script>|<.*?on\\w+.*?>.*?</.*?>", Pattern.CASE_INSENSITIVE);
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile("(?i)(union\\s+select|drop\\s+table|delete\\s+from|insert\\s+into|update\\s+.+\\s+set|exec\\s*\\()");
    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile("\\.\\./|\\.\\.\\\\|%2e%2e%2f|%2e%2e%5c", Pattern.CASE_INSENSITIVE);

    @Value("${app.security.ip-blacklist.enabled:true}")
    private boolean ipBlacklistEnabled;

    @Value("${app.security.ip-blacklist.check-enabled:true}")
    private boolean ipBlacklistCheckEnabled;

    private final SuspiciousIPRepository suspiciousIPRepository;

    @Autowired
    public SecurityFilter(SuspiciousIPRepository suspiciousIPRepository) {
        this.suspiciousIPRepository = suspiciousIPRepository;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String clientIp = exchange.getRequest().getRemoteAddress() != null 
            ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() 
            : "unknown";
        
        // Vérification de l'IP blacklist dynamique
        if (ipBlacklistEnabled && ipBlacklistCheckEnabled) {
            return suspiciousIPRepository.findByIpAddress(clientIp)
                .flatMap(suspiciousIP -> {
                    if (suspiciousIP != null && "BLOCKED".equals(suspiciousIP.getBlockStatus())) {
                        logger.warn("IP blacklistée bloquée: {} - Raison: {}", clientIp, suspiciousIP.getSuspicionReason());
                        return Mono.error(new RuntimeException("IP bloquée"));
                    }
                    return performSecurityChecks(exchange, chain, clientIp);
                })
                .switchIfEmpty(performSecurityChecks(exchange, chain, clientIp));
        }
        
        return performSecurityChecks(exchange, chain, clientIp);
    }

    private Mono<Void> performSecurityChecks(ServerWebExchange exchange, WebFilterChain chain, String clientIp) {
        // Vérification du path traversal
        String path = exchange.getRequest().getPath().value();
        if (hasPathTraversal(path)) {
            logger.warn("Tentative de path traversal détectée de l'IP: {} - Path: {}", clientIp, path);
            return Mono.error(new RuntimeException("Path traversal détecté"));
        }

        // Vérification des paramètres de requête
        exchange.getRequest().getQueryParams().forEach((key, values) -> {
            for (String value : values) {
                if (hasXSS(value)) {
                    logger.warn("Tentative XSS détectée de l'IP: {} dans le paramètre: {}", clientIp, key);
                    throw new RuntimeException("XSS détecté");
                }
                if (hasSQLInjection(value)) {
                    logger.warn("Tentative SQL injection détectée de l'IP: {} dans le paramètre: {}", clientIp, key);
                    throw new RuntimeException("SQL injection détecté");
                }
            }
        });

        return chain.filter(exchange);
    }

    /**
     * Vérifie si une chaîne contient une tentative de path traversal.
     * @param input la chaîne à vérifier
     * @return true si path traversal détecté
     */
    private boolean hasPathTraversal(String input) {
        return PATH_TRAVERSAL_PATTERN.matcher(input).find();
    }

    /**
     * Vérifie si une chaîne contient une tentative XSS.
     * @param input la chaîne à vérifier
     * @return true si XSS détecté
     */
    private boolean hasXSS(String input) {
        return XSS_PATTERN.matcher(input).find();
    }

    /**
     * Vérifie si une chaîne contient une tentative SQL injection.
     * @param input la chaîne à vérifier
     * @return true si SQL injection détecté
     */
    private boolean hasSQLInjection(String input) {
        return SQL_INJECTION_PATTERN.matcher(input).find();
    }
}
