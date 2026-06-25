package com.abdatytch.backend.security.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Filtre de validation d'input structurée.
 * Valide la taille et le format des entrées pour prévenir les attaques.
 */
@Component
@Order(5)
public class InputValidationFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(InputValidationFilter.class);

    @Value("${app.security.input-validation.enabled:true}")
    private boolean inputValidationEnabled;

    @Value("${app.security.input-validation.max-length:10000}")
    private int maxLength;

    @Value("${app.security.input-validation.sanitize-enabled:true}")
    private boolean sanitizeEnabled;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!inputValidationEnabled) {
            return chain.filter(exchange);
        }

        try {
            // Valider les paramètres de requête
            exchange.getRequest().getQueryParams().forEach((key, values) -> {
                for (String value : values) {
                    validateInput(key, value);
                }
            });

            // Valider les headers
            exchange.getRequest().getHeaders().forEach((key, values) -> {
                for (String value : values) {
                    validateInput(key, value);
                }
            });

            return chain.filter(exchange);
        } catch (IllegalArgumentException e) {
            logger.warn("Validation d'input échouée: {}", e.getMessage());
            return Mono.error(e);
        }
    }

    /**
     * Valide une entrée.
     * 
     * @param key la clé
     * @param value la valeur
     * @throws IllegalArgumentException si l'entrée est invalide
     */
    private void validateInput(String key, String value) {
        if (value == null) {
            return;
        }

        // Vérifier la longueur
        if (value.length() > maxLength) {
            throw new IllegalArgumentException("Input trop long pour: " + key);
        }

        // Vérifier les caractères null byte
        if (value.contains("\0")) {
            throw new IllegalArgumentException("Caractère null byte détecté dans: " + key);
        }

        // Vérifier les caractères de contrôle
        if (hasControlCharacters(value)) {
            throw new IllegalArgumentException("Caractères de contrôle détectés dans: " + key);
        }

        // Sanitization si activée
        if (sanitizeEnabled) {
            String sanitized = sanitizeInput(value);
            if (!sanitized.equals(value)) {
                logger.warn("Input sanitisé pour: {}", key);
            }
        }
    }

    /**
     * Vérifie si une chaîne contient des caractères de contrôle.
     * 
     * @param input la chaîne
     * @return true si elle contient des caractères de contrôle
     */
    private boolean hasControlCharacters(String input) {
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (Character.isISOControl(c) && c != '\n' && c != '\r' && c != '\t') {
                return true;
            }
        }
        return false;
    }

    /**
     * Sanitize une entrée.
     * 
     * @param input l'entrée
     * @return l'entrée sanitizée
     */
    private String sanitizeInput(String input) {
        // Supprimer les caractères de contrôle sauf newline, carriage return, tab
        return input.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "");
    }
}
