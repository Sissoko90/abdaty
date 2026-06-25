package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.ApiKey;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les clés API.
 */
@Repository
public interface ApiKeyRepository extends R2dbcRepository<ApiKey, String> {

    /** Liste les clés d'un utilisateur, de la plus récente à la plus ancienne. */
    Flux<ApiKey> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Récupère une clé par identifiant ET propriétaire (contrôle d'accès). */
    Mono<ApiKey> findByIdAndUserId(String id, String userId);
}
