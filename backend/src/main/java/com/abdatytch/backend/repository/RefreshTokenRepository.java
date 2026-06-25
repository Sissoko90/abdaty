package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.RefreshToken;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Repository pour la gestion des refresh tokens.
 * Fournit les méthodes CRUD pour les opérations sur les refresh tokens.
 */
@Repository
public interface RefreshTokenRepository extends R2dbcRepository<RefreshToken, String> {

    /**
     * Trouve un refresh token par son token.
     * 
     * @param token le token de rafraîchissement
     * @return un Mono contenant le refresh token
     */
    Mono<RefreshToken> findByToken(String token);

    /**
     * Trouve tous les refresh tokens pour un utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @return un Flux contenant les refresh tokens
     */
    Flux<RefreshToken> findByUserId(String userId);

    /**
     * Supprime tous les refresh tokens pour un utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @return un Mono contenant le nombre de tokens supprimés
     */
    Mono<Long> deleteByUserId(String userId);

    /**
     * Trouve tous les refresh tokens expirés.
     * 
     * @param now la date actuelle
     * @return un Flux contenant les refresh tokens expirés
     */
    Flux<RefreshToken> findByExpiresAtBefore(LocalDateTime now);

    /**
     * Supprime tous les refresh tokens expirés.
     * 
     * @param now la date actuelle
     * @return un Mono contenant le nombre de tokens supprimés
     */
    Mono<Long> deleteByExpiresAtBefore(LocalDateTime now);
}
