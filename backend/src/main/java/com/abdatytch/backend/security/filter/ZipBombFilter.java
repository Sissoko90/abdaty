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
 * Filtre pour protéger contre les Zip bombs.
 * Détecte et bloque les fichiers ZIP malveillants qui pourraient exploser lors de la décompression.
 */
@Component
@Order(4)
public class ZipBombFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(ZipBombFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String contentType = exchange.getRequest().getHeaders().getFirst("Content-Type");
        
        // Vérification si le contenu est un fichier ZIP
        if (contentType != null && contentType.contains(MediaType.APPLICATION_OCTET_STREAM_VALUE)) {
            String filename = exchange.getRequest().getHeaders().getFirst("Content-Disposition");
            
            if (filename != null && (filename.toLowerCase().contains(".zip") || 
                                      filename.toLowerCase().contains(".jar") || 
                                      filename.toLowerCase().contains(".war"))) {
                logger.warn("Tentative d'upload de fichier ZIP détectée: {}", filename);
                // En production, ajouter une validation plus approfondie du fichier ZIP
                return Mono.error(new RuntimeException("Upload de fichiers ZIP non autorisé"));
            }
        }

        return chain.filter(exchange);
    }
}
