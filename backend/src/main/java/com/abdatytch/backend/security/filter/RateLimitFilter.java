package com.abdatytch.backend.security.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Filtre de rate limiting pour limiter les requêtes par IP.
 * Utilise Redis pour stocker les compteurs de requêtes avec expiration automatique.
 */
@Component
@Order(3)
public class RateLimitFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    @Value("${app.security.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.security.rate-limit.requests-per-minute:100}")
    private int requestsPerMinute;

    @Value("${app.security.rate-limit.requests-per-hour:1000}")
    private int requestsPerHour;

    private final ReactiveRedisTemplate<String, Long> redisTemplate;

    @Autowired
    public RateLimitFilter(ReactiveRedisTemplate<String, Long> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!rateLimitEnabled) {
            return chain.filter(exchange);
        }

        String clientIp = getClientIp(exchange);
        String minuteKey = "rate_limit:" + clientIp + ":minute";
        String hourKey = "rate_limit:" + clientIp + ":hour";

        return checkRateLimit(minuteKey, requestsPerMinute, Duration.ofMinutes(1), clientIp)
            .flatMap(withinMinuteLimit -> {
                if (!(Boolean) withinMinuteLimit) {
                    logger.warn("Rate limit dépassé (minute) pour l'IP: {}", clientIp);
                    exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                    return exchange.getResponse().setComplete();
                }
                return checkRateLimit(hourKey, requestsPerHour, Duration.ofHours(1), clientIp);
            })
            .flatMap(withinHourLimit -> {
                if (!(Boolean) withinHourLimit) {
                    logger.warn("Rate limit dépassé (heure) pour l'IP: {}", clientIp);
                    exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                    return exchange.getResponse().setComplete();
                }
                return chain.filter(exchange);
            });
    }

    /**
     * Vérifie le rate limit pour une clé donnée.
     * 
     * @param key la clé Redis
     * @param maxRequests le nombre maximum de requêtes
     * @param expiration la durée d'expiration
     * @param ip l'adresse IP
     * @return true si dans les limites
     */
    private Mono<Boolean> checkRateLimit(String key, int maxRequests, Duration expiration, String ip) {
        return redisTemplate.opsForValue()
            .increment(key)
            .flatMap(count -> {
                if (count == 1) {
                    // Première requête, définir l'expiration
                    return redisTemplate.expire(key, expiration)
                        .thenReturn(count);
                }
                return Mono.just(count);
            })
            .map(count -> count.longValue() <= maxRequests)
            .onErrorResume(e -> {
                // Redis indisponible (ou autre erreur) : on n'inonde pas les logs
                // avec la stack trace à chaque requête. Avertissement concis et
                // « fail-open » : la requête est autorisée (le rate limiting est
                // une protection, pas un point de défaillance bloquant).
                logger.warn("Rate limiting ignoré (backend indisponible) pour l'IP {} : {}",
                        ip, e.getMessage());
                return Mono.just(true);
            });
    }

    /**
     * Extrait l'adresse IP de la requête.
     * 
     * @param exchange l'échange
     * @return l'adresse IP
     */
    private String getClientIp(ServerWebExchange exchange) {
        return exchange.getRequest().getRemoteAddress() != null 
            ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() 
            : "unknown";
    }
}
