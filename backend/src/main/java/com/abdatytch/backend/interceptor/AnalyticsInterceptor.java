package com.abdatytch.backend.interceptor;

import com.abdatytch.backend.service.IAnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Interceptor pour capturer les informations d'analytics lors des requêtes.
 * Collecte les informations géographiques et d'appareil pour chaque requête.
 */
@Component
public class AnalyticsInterceptor implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsInterceptor.class);
    private static final String X_REAL_IP = "X-Real-IP";
    private static final String X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String USER_AGENT = "User-Agent";
    private static final String REFERER = "Referer";

    private final IAnalyticsService analyticsService;

    @Autowired
    public AnalyticsInterceptor(IAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        // Extraire l'adresse IP
        String ipAddress = extractIpAddress(exchange);
        
        // Extraire le User-Agent
        String userAgent = exchange.getRequest().getHeaders().getFirst(USER_AGENT);
        
        // Extraire le référent
        String referer = exchange.getRequest().getHeaders().getFirst(REFERER);
        
        // Extraire le chemin et la méthode
        String requestPath = exchange.getRequest().getPath().value();
        String requestMethod = exchange.getRequest().getMethod().name();
        
        // Extraire l'ID utilisateur s'il existe (dans les headers ou dans le contexte)
        String userId = extractUserId(exchange);
        
        // Collecter et stocker les analytics de manière asynchrone (non bloquante)
        analyticsService.collectAndStoreAnalytics(
                ipAddress,
                userAgent,
                requestPath,
                requestMethod,
                referer,
                userId
        ).subscribe(
                result -> logger.debug("Analytics collectés pour IP: {}", ipAddress),
                error -> logger.warn("Erreur lors de la collecte des analytics pour IP: {}", ipAddress, error)
        );
        
        // Continuer la chaîne de traitement
        return chain.filter(exchange);
    }

    /**
     * Extrait l'adresse IP de la requête.
     * Prend en compte les proxies et load balancers.
     * 
     * @param exchange l'échange serveur
     * @return l'adresse IP
     */
    private String extractIpAddress(ServerWebExchange exchange) {
        String ip = exchange.getRequest().getHeaders().getFirst(X_FORWARDED_FOR);
        
        if (ip == null || ip.isEmpty()) {
            ip = exchange.getRequest().getHeaders().getFirst(X_REAL_IP);
        }
        
        if (ip == null || ip.isEmpty()) {
            ip = exchange.getRequest().getRemoteAddress() != null 
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() 
                    : "unknown";
        } else {
            // X-Forwarded-For peut contenir plusieurs IPs, prendre la première
            String[] ips = ip.split(",");
            ip = ips[0].trim();
        }
        
        return ip;
    }

    /**
     * Extrait l'ID utilisateur de la requête.
     * Cherche dans les headers d'authentification ou dans le contexte de l'échange.
     * 
     * @param exchange l'échange serveur
     * @return l'ID utilisateur ou null
     */
    private String extractUserId(ServerWebExchange exchange) {
        // Chercher dans les headers (ex: X-User-Id)
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
        
        if (userId == null || userId.isEmpty()) {
            // Chercher dans les attributs de l'échange
            Object userIdObj = exchange.getAttributes().get("userId");
            if (userIdObj != null) {
                userId = userIdObj.toString();
            }
        }
        
        return userId;
    }
}
