package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.request.SiteContentRequestDTO;
import com.abdatytch.backend.dto.response.SiteContentResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service de gestion du contenu éditorial unifié.
 */
public interface ISiteContentService {

    /* ---------------------- Lecture publique ---------------------- */

    /** Liste les blocs ACTIFS d'une section, triés par ordre d'affichage. */
    Flux<SiteContentResponseDTO> getActiveSection(String section);

    /** Récupère un bloc précis par (section, clé) — 404 si absent. */
    Mono<SiteContentResponseDTO> getItem(String section, String contentKey);

    /* ---------------------- Administration ------------------------ */

    /** Liste l'intégralité du contenu (groupé par section). */
    Flux<SiteContentResponseDTO> getAll();

    /** Liste tous les blocs d'une section (inactifs inclus). */
    Flux<SiteContentResponseDTO> getSection(String section);

    /** Récupère un bloc par identifiant — 404 si absent. */
    Mono<SiteContentResponseDTO> getById(String id);

    /** Crée un bloc — 409 si (section, clé) existe déjà. */
    Mono<SiteContentResponseDTO> create(SiteContentRequestDTO request);

    /** Met à jour un bloc par identifiant — 404 si absent. */
    Mono<SiteContentResponseDTO> update(String id, SiteContentRequestDTO request);

    /** Crée ou met à jour un bloc identifié par (section, clé) — upsert. */
    Mono<SiteContentResponseDTO> upsert(String section, String contentKey, SiteContentRequestDTO request);

    /** Supprime un bloc par identifiant — 404 si absent. */
    Mono<Void> delete(String id);
}
