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
 * Filtre pour ajouter les headers de sécurité dans toutes les réponses HTTP.
 * Ajoute HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, CSP, etc.
 */
@Component
@Order(4)
public class SecurityHeadersFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(SecurityHeadersFilter.class);

    @Value("${app.security.headers.enabled:true}")
    private boolean securityHeadersEnabled;

    @Value("${app.security.headers.hsts-enabled:true}")
    private boolean hstsEnabled;

    @Value("${app.security.headers.hsts-max-age:31536000}")
    private long hstsMaxAge;

    @Value("${app.security.headers.x-frame-options:DENY}")
    private String xFrameOptions;

    @Value("${app.security.headers.x-content-type-options:NOSNIFF}")
    private String xContentTypeOptions;

    @Value("${app.security.headers.x-xss-protection:1; mode=block}")
    private String xXssProtection;

    @Value("${app.security.headers.content-security-policy:default-src 'self'}")
    private String contentSecurityPolicy;

    @Value("${app.security.headers.referrer-policy:no-referrer}")
    private String referrerPolicy;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!securityHeadersEnabled) {
            return chain.filter(exchange);
        }

        // Ajouter les headers de sécurité
        exchange.getResponse().getHeaders().add("X-Content-Type-Options", xContentTypeOptions);
        exchange.getResponse().getHeaders().add("X-Frame-Options", xFrameOptions);
        exchange.getResponse().getHeaders().add("X-XSS-Protection", xXssProtection);
        exchange.getResponse().getHeaders().add("Referrer-Policy", referrerPolicy);
        exchange.getResponse().getHeaders().add("Content-Security-Policy", contentSecurityPolicy);

        // HSTS (HTTP Strict Transport Security)
        if (hstsEnabled) {
            exchange.getResponse().getHeaders().add("Strict-Transport-Security", 
                "max-age=" + hstsMaxAge + "; includeSubDomains; preload");
        }

        // Autres headers de sécurité
        exchange.getResponse().getHeaders().add("Permissions-Policy", 
            "geolocation=(), microphone=(), camera=(), payment=()");
        exchange.getResponse().getHeaders().add("X-Download-Options", "noopen");
        exchange.getResponse().getHeaders().add("X-Robots-Tag", "noindex, nofollow");

        logger.debug("Headers de sécurité ajoutés à la réponse");

        return chain.filter(exchange);
    }
}
