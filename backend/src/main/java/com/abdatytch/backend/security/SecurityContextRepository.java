package com.abdatytch.backend.security;

import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Repository personnalisé pour le contexte de sécurité.
 * Gère le stockage et la récupération du contexte de sécurité dans les requêtes réactives.
 */
@Component
public class SecurityContextRepository implements ServerSecurityContextRepository {

    private final ReactiveAuthenticationManager authenticationManager;

    public SecurityContextRepository(ReactiveAuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Mono<Void> save(ServerWebExchange exchange, SecurityContext context) {
        return Mono.empty();
    }

    @Override
    public Mono<SecurityContext> load(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(token, null);
            
            return authenticationManager.authenticate(authentication)
                .<SecurityContext>map(SecurityContextImpl::new)
                // Un token invalide ou expiré ne doit PAS provoquer une erreur 500 :
                // on renvoie un contexte vide. La couche d'autorisation répondra
                // alors 401 (Unauthorized), que le frontend intercepte pour rediriger
                // silencieusement vers la page de connexion.
                .onErrorResume(error -> Mono.empty());
        }

        return Mono.empty();
    }
}
