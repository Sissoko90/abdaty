package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.ApiKeyRequestDTO;
import com.abdatytch.backend.dto.response.ApiKeyResponseDTO;
import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.service.IApiKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controller pour la gestion des clés API de l'utilisateur connecté (dashboard).
 *
 * Toutes les opérations sont à portée utilisateur : l'identifiant du propriétaire
 * est dérivé du JWT validé (@AuthenticationPrincipal), garantissant qu'un
 * utilisateur ne manipule que ses propres clés.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/api-keys")
@Tag(name = "API Keys", description = "Gestion des clés API de l'utilisateur")
public class ApiKeyController {

    private static final Logger logger = LoggerFactory.getLogger(ApiKeyController.class);

    private final IApiKeyService apiKeyService;

    @Autowired
    public ApiKeyController(IApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lister mes clés API", description = "Liste les clés API de l'utilisateur (valeurs masquées)")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<ApiKeyResponseDTO> getMyKeys(
            @AuthenticationPrincipal String userId) {
        logger.info("Liste des clés API pour l'utilisateur: {}", userId);
        return apiKeyService.getUserKeys(userId);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Créer une clé API", description = "Crée une clé ; la valeur complète n'est renvoyée qu'à la création")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Clé créée avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public Mono<ResponseEntity<ApiKeyResponseDTO>> createKey(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ApiKeyRequestDTO request) {
        logger.info("Création d'une clé API pour l'utilisateur: {}", userId);
        return apiKeyService.create(userId, request)
            .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Révoquer une clé API", description = "Révoque une clé appartenant à l'utilisateur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Clé révoquée avec succès"),
        @ApiResponse(responseCode = "404", description = "Clé introuvable")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> revokeKey(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Identifiant de la clé") @PathVariable String id) {
        logger.info("Révocation de la clé API {} pour l'utilisateur {}", id, userId);
        return apiKeyService.revoke(userId, id)
            .map(ResponseEntity::ok);
    }
}
