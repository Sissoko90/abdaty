package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.request.SiteSettingRequestDTO;
import com.abdatytch.backend.dto.response.SiteSettingResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service de gestion des paramètres du site.
 */
public interface ISiteSettingService {

    /** Liste tous les paramètres. */
    Flux<SiteSettingResponseDTO> getAll();

    /** Liste les paramètres d'une catégorie (general, seo, social, theme...). */
    Flux<SiteSettingResponseDTO> getByCategory(String category);

    /** Récupère un paramètre par sa clé (404 si absent). */
    Mono<SiteSettingResponseDTO> getByKey(String key);

    /**
     * Crée ou met à jour un paramètre identifié par sa clé (upsert).
     * Pratique pour l'enregistrement depuis le panel d'administration.
     */
    Mono<SiteSettingResponseDTO> upsert(String key, SiteSettingRequestDTO request);

    /** Supprime un paramètre par sa clé (404 si absent). */
    Mono<Void> delete(String key);
}
