package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.ApiKeyRequestDTO;
import com.abdatytch.backend.dto.response.ApiKeyResponseDTO;
import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.entity.ApiKey;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.IApiKeyMapper;
import com.abdatytch.backend.repository.ApiKeyRepository;
import com.abdatytch.backend.service.IApiKeyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.List;

/**
 * Implémentation réactive du service de gestion des clés API.
 *
 * Sécurité : la clé en clair est générée puis renvoyée UNE seule fois (création).
 * En base, on ne conserve que son empreinte SHA-256 et son préfixe d'affichage.
 */
@Service
public class ApiKeyService implements IApiKeyService {

    private static final Logger logger = LoggerFactory.getLogger(ApiKeyService.class);

    private static final String KEY_PREFIX = "abdaty_live_";
    private static final int RANDOM_LENGTH = 32;
    private static final int DISPLAY_PREFIX_LENGTH = 16;
    private static final String ALPHANUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private final ApiKeyRepository apiKeyRepository;
    private final IApiKeyMapper apiKeyMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    public ApiKeyService(ApiKeyRepository apiKeyRepository, IApiKeyMapper apiKeyMapper) {
        this.apiKeyRepository = apiKeyRepository;
        this.apiKeyMapper = apiKeyMapper;
    }

    @Override
    public Flux<ApiKeyResponseDTO> getUserKeys(String userId) {
        logger.info("Récupération des clés API de l'utilisateur: {}", userId);
        return apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .map(apiKeyMapper::toMaskedResponseDTO);
    }

    @Override
    public Mono<ApiKeyResponseDTO> create(String userId, ApiKeyRequestDTO request) {
        logger.info("Création d'une clé API pour l'utilisateur: {}", userId);

        // Génération de la clé en clair (jamais persistée telle quelle).
        final String rawKey = generateRawKey();

        ApiKey entity = new ApiKey();
        entity.setUserId(userId);
        entity.setName(request.getName());
        entity.setPermissions(joinPermissions(request.getPermissions()));
        if (request.getRateLimit() != null) {
            entity.setRateLimit(request.getRateLimit());
        }
        entity.setKeyPrefix(rawKey.substring(0, DISPLAY_PREFIX_LENGTH));
        entity.setKeyHash(sha256Hex(rawKey));

        return apiKeyRepository.save(entity)
            .map(saved -> {
                ApiKeyResponseDTO dto = apiKeyMapper.toMaskedResponseDTO(saved);
                // On expose la clé COMPLÈTE uniquement ici, à la création.
                dto.setKey(rawKey);
                return dto;
            })
            .doOnSuccess(dto -> logger.info("Clé API créée pour l'utilisateur: {}", userId));
    }

    @Override
    public Mono<MessageResponseDTO> revoke(String userId, String id) {
        logger.info("Révocation de la clé API {} pour l'utilisateur {}", id, userId);
        return apiKeyRepository.findByIdAndUserId(id, userId)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(key -> {
                key.setKeyStatus("revoked");
                return apiKeyRepository.save(key);
            })
            .thenReturn(new MessageResponseDTO("Clé API révoquée avec succès"));
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                            */
    /* ------------------------------------------------------------------ */

    /** Génère une clé en clair de la forme "abdaty_live_<32 caractères>". */
    private String generateRawKey() {
        StringBuilder sb = new StringBuilder(KEY_PREFIX);
        for (int i = 0; i < RANDOM_LENGTH; i++) {
            sb.append(ALPHANUM.charAt(secureRandom.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }

    /** Calcule l'empreinte SHA-256 (hex) d'une chaîne. */
    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(Character.forDigit((b >> 4) & 0xF, 16));
                hex.append(Character.forDigit(b & 0xF, 16));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Impossible de hacher la clé API", e);
        }
    }

    /** Joint une liste de permissions en chaîne séparée par des virgules. */
    private String joinPermissions(List<String> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return null;
        }
        return String.join(",", permissions);
    }
}
