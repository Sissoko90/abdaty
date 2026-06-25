package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.request.ApiKeyRequestDTO;
import com.abdatytch.backend.dto.response.ApiKeyResponseDTO;
import com.abdatytch.backend.dto.response.MessageResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service de gestion des clés API (espace utilisateur).
 */
public interface IApiKeyService {

    /** Liste les clés (masquées) de l'utilisateur. */
    Flux<ApiKeyResponseDTO> getUserKeys(String userId);

    /**
     * Crée une nouvelle clé pour l'utilisateur.
     * La réponse contient la clé COMPLÈTE en clair (affichée une seule fois).
     */
    Mono<ApiKeyResponseDTO> create(String userId, ApiKeyRequestDTO request);

    /** Révoque une clé appartenant à l'utilisateur (404 si absente). */
    Mono<MessageResponseDTO> revoke(String userId, String id);
}
