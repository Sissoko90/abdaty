package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.response.ApiKeyResponseDTO;
import com.abdatytch.backend.entity.ApiKey;
import com.abdatytch.backend.mapper.IApiKeyMapper;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du mapper pour les clés API.
 */
@Component
public class ApiKeyMapper implements IApiKeyMapper {

    /** Suffixe de masquage affiché après le préfixe. */
    private static final String MASK = "••••••••••••••••";

    @Override
    public ApiKeyResponseDTO toMaskedResponseDTO(ApiKey entity) {
        if (entity == null) {
            return null;
        }

        ApiKeyResponseDTO dto = new ApiKeyResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setKey((entity.getKeyPrefix() != null ? entity.getKeyPrefix() : "") + MASK);
        dto.setStatus(entity.getKeyStatus());
        dto.setPermissions(toList(entity.getPermissions()));
        dto.setRateLimit(entity.getRateLimit());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setLastUsedAt(entity.getLastUsedAt());
        return dto;
    }

    /** Convertit une chaîne de permissions séparées par des virgules en liste. */
    private List<String> toList(String permissions) {
        if (permissions == null || permissions.isBlank()) {
            return List.of();
        }
        return Arrays.stream(permissions.split(","))
            .map(String::trim)
            .filter(p -> !p.isEmpty())
            .collect(Collectors.toList());
    }
}
