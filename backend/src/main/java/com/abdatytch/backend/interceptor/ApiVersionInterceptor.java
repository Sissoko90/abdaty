package com.abdatytch.backend.interceptor;

import com.abdatytch.backend.service.IApiVersionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Interceptor pour injecter automatiquement la version de l'API dans chaque requête.
 * Ajoute l'en-tête X-API-Version et le contexte de version dans l'échange.
 */
@Component
public class ApiVersionInterceptor implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(ApiVersionInterceptor.class);
    private static final String API_VERSION_HEADER = "X-API-Version";
    private static final String API_VERSION_CONTEXT_KEY = "apiVersion";

    private final IApiVersionService apiVersionService;

    public ApiVersionInterceptor(IApiVersionService apiVersionService) {
        this.apiVersionService = apiVersionService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String currentVersion = apiVersionService.getCurrentVersion();
        
        logger.debug("Injection de la version API: {} dans la requête", currentVersion);
        
        // Ajouter l'en-tête de version
        exchange.getRequest().mutate()
            .header(API_VERSION_HEADER, currentVersion)
            .build();
        
        // Ajouter la version au contexte
        exchange.getAttributes().put(API_VERSION_CONTEXT_KEY, currentVersion);
        
        return chain.filter(exchange);
    }
}
