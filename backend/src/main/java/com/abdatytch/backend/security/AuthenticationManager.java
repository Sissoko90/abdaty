package com.abdatytch.backend.security;

import com.abdatytch.backend.service.IJwtService;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Collections;

/**
 * Gestionnaire d'authentification réactif.
 * Valide les tokens JWT et retourne un Authentication object.
 */
@Component
public class AuthenticationManager implements ReactiveAuthenticationManager {

    private final IJwtService jwtService;

    public AuthenticationManager(IJwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getName(); // Le token est stocké dans le name
        
        // Valider le token JWT
        if (!jwtService.validateToken(token)) {
            return Mono.error(new RuntimeException("Token JWT invalide"));
        }

        // Vérifier si le token est expiré
        if (jwtService.isTokenExpired(token)) {
            return Mono.error(new RuntimeException("Token JWT expiré"));
        }

        // SÉCURITÉ : seul un token de type "access" peut authentifier une requête.
        // Un refresh token (durée de vie 7 j) présenté en Authorization: Bearer doit
        // être REFUSÉ, sinon sa fenêtre d'usage en cas de vol serait élargie.
        if (!"access".equals(jwtService.extractTokenType(token))) {
            return Mono.error(new RuntimeException("Type de token invalide"));
        }

        // Extraire les informations du token
        String userId = jwtService.extractUserId(token);
        String role = jwtService.extractRole(token);

        // Le principal porte l'userId issu du token SIGNÉ et VALIDÉ : c'est la
        // seule source d'identité fiable. Les contrôleurs doivent le lire via
        // @AuthenticationPrincipal et NE JAMAIS faire confiance à un en-tête
        // client type X-User-Id (sinon IDOR : agir au nom d'autrui).
        return Mono.just(new UsernamePasswordAuthenticationToken(
            userId,
            null,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
        ));
    }
}
