package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.SiteContent;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour le contenu éditorial unifié du site.
 */
@Repository
public interface SiteContentRepository extends R2dbcRepository<SiteContent, String> {

    /** Liste les blocs ACTIFS d'une section, triés par ordre d'affichage (lecture publique). */
    Flux<SiteContent> findBySectionAndActiveTrueOrderByDisplayOrderAsc(String section);

    /** Liste TOUS les blocs d'une section, triés par ordre d'affichage (admin). */
    Flux<SiteContent> findBySectionOrderByDisplayOrderAsc(String section);

    /** Récupère un bloc précis par (section, contentKey). */
    Mono<SiteContent> findBySectionAndContentKey(String section, String contentKey);

    /** Indique si un bloc existe déjà pour (section, contentKey). */
    Mono<Boolean> existsBySectionAndContentKey(String section, String contentKey);

    /** Liste l'ensemble du contenu, groupé par section puis ordre d'affichage (admin). */
    Flux<SiteContent> findAllByOrderBySectionAscDisplayOrderAsc();
}
