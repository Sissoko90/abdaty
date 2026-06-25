package com.abdatytch.backend.security.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Filtre pour valider les corps de requête.
 * Vérifie la taille et le type de contenu des requêtes.
 */
@Component
@Order(3)
public class BodyFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(BodyFilter.class);
    private static final long MAX_BODY_SIZE = 10 * 1024 * 1024; // 10 MB

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        long contentLength = exchange.getRequest().getHeaders().getContentLength();
        
        // Vérification de la taille du corps
        if (contentLength > MAX_BODY_SIZE) {
            logger.warn("Corps de requête trop volumineux: {} bytes", contentLength);
            return Mono.error(new RuntimeException("Corps de requête trop volumineux"));
        }

        // Vérification du type de contenu
        String contentType = exchange.getRequest().getHeaders().getFirst("Content-Type");
        if (contentType != null && !isContentTypeAllowed(contentType)) {
            logger.warn("Type de contenu non autorisé: {}", contentType);
            return Mono.error(new RuntimeException("Type de contenu non autorisé"));
        }

        return chain.filter(exchange);
    }

    /**
     * Vérifie si le type de contenu est autorisé.
     * @param contentType le type de contenu à vérifier
     * @return true si le type de contenu est autorisé
     */
    private boolean isContentTypeAllowed(String contentType) {
        return contentType.startsWith(MediaType.APPLICATION_JSON_VALUE) ||
               contentType.startsWith(MediaType.APPLICATION_FORM_URLENCODED_VALUE) ||
               contentType.startsWith(MediaType.MULTIPART_FORM_DATA_VALUE);
    }
}
