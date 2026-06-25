package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.response.ApiKeyResponseDTO;
import com.abdatytch.backend.entity.ApiKey;

/**
 * Interface du mapper pour les clés API.
 */
public interface IApiKeyMapper {

    /**
     * Convertit une entité en DTO de réponse avec clé MASQUÉE
     * (préfixe + caractères de masquage). Utilisé pour les listes.
     */
    ApiKeyResponseDTO toMaskedResponseDTO(ApiKey entity);
}
