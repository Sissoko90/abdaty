package com.abdatytch.backend.security.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Filtre CSRF pour protéger contre les attaques Cross-Site Request Forgery.
 * Vérifie l'origine et le referer des requêtes pour les méthodes non sécurisées.
 * Ce filtre est désactivé par défaut car CSRF est géré par Spring Security.
 */
@Component
@Order(2)
public class CsrfFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(CsrfFilter.class);

    @Value("${app.security.csrf.enabled:false}")
    private boolean csrfEnabled;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        // Si CSRF est désactivé, passer au filtre suivant
        if (!csrfEnabled) {
            return chain.filter(exchange);
        }

        HttpMethod method = exchange.getRequest().getMethod();
        
        // Les méthodes sécurisées ne nécessitent pas de vérification CSRF
        if (method == HttpMethod.GET || method == HttpMethod.HEAD || method == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        // Vérification de l'origine et du referer pour les méthodes POST, PUT, DELETE, PATCH
        String origin = exchange.getRequest().getHeaders().getFirst("Origin");
        String referer = exchange.getRequest().getHeaders().getFirst("Referer");

        if (origin == null && referer == null) {
            logger.warn("Requête sans Origin ni Referer - méthode: {}", method);
            return Mono.error(new RuntimeException("Origin ou Referer manquant"));
        }

        // Vérification que l'origine est autorisée
        if (origin != null && !isOriginAllowed(origin)) {
            logger.warn("Origin non autorisée: {}", origin);
            return Mono.error(new RuntimeException("Origin non autorisée"));
        }

        return chain.filter(exchange);
    }

    /**
     * Vérifie si l'origine est autorisée.
     * @param origin l'origine à vérifier
     * @return true si l'origine est autorisée
     */
    private boolean isOriginAllowed(String origin) {
        // En production, configurer les origines autorisées
        return origin != null && !origin.isEmpty();
    }
}
