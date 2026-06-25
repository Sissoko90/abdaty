package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.DocumentationEntry;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les entrées de documentation.
 */
@Repository
public interface DocumentationRepository extends R2dbcRepository<DocumentationEntry, String> {

    /** Trouve une entrée par son slug (unique). */
    Mono<DocumentationEntry> findBySlug(String slug);

    /** Indique si une entrée existe déjà pour le slug donné. */
    Mono<Boolean> existsBySlug(String slug);

    /** Liste les entrées actives, triées par ordre d'affichage croissant. */
    Flux<DocumentationEntry> findByActiveTrueOrderByDisplayOrderAsc();

    /** Liste les entrées (actives) d'un parent donné, triées par ordre d'affichage. */
    Flux<DocumentationEntry> findByParentIdOrderByDisplayOrderAsc(String parentId);
}
