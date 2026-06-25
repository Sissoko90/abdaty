package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.DocumentationRequestDTO;
import com.abdatytch.backend.dto.response.DocumentationResponseDTO;
import com.abdatytch.backend.service.IDocumentationService;
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
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controller pour la documentation.
 *
 * Lecture PUBLIQUE des entrées actives (site vitrine) et administration (ADMIN)
 * pour le CRUD. Les GET publics sont également autorisés dans SecurityConfig.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/documentation")
@Tag(name = "Documentation", description = "Gestion et consultation de la documentation")
public class DocumentationController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentationController.class);

    private final IDocumentationService documentationService;

    @Autowired
    public DocumentationController(IDocumentationService documentationService) {
        this.documentationService = documentationService;
    }

    /* ============================ PUBLIC ============================ */

    @GetMapping
    @PreAuthorize("permitAll()")
    @Operation(summary = "Documentation active", description = "Liste les entrées de documentation actives, triées par ordre d'affichage")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<DocumentationResponseDTO> getActiveEntries() {
        logger.info("[public] Liste de la documentation active");
        return documentationService.getActiveEntries();
    }

    @GetMapping("/slug/{slug}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Documentation par slug", description = "Récupère une entrée de documentation par son slug")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrée trouvée"),
        @ApiResponse(responseCode = "404", description = "Entrée introuvable")
    })
    public Mono<ResponseEntity<DocumentationResponseDTO>> getBySlug(
            @Parameter(description = "Slug de l'entrée") @PathVariable String slug) {
        logger.info("[public] Documentation par slug: {}", slug);
        return documentationService.getBySlug(slug)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /* ============================ ADMIN ============================ */

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toute la documentation (admin)", description = "Liste toutes les entrées, inactives incluses")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<DocumentationResponseDTO> getAllEntries() {
        logger.info("[admin] Liste de toute la documentation");
        return documentationService.getAllEntries();
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Entrée par id (admin)", description = "Récupère une entrée par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrée trouvée"),
        @ApiResponse(responseCode = "404", description = "Entrée introuvable")
    })
    public Mono<ResponseEntity<DocumentationResponseDTO>> getById(
            @Parameter(description = "Identifiant de l'entrée") @PathVariable String id) {
        logger.info("[admin] Documentation par id: {}", id);
        return documentationService.getById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer une entrée", description = "Crée une nouvelle entrée de documentation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Entrée créée avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Slug déjà utilisé")
    })
    public Mono<ResponseEntity<DocumentationResponseDTO>> create(@Valid @RequestBody DocumentationRequestDTO request) {
        logger.info("[admin] Création d'une entrée de documentation, slug: {}", request.getSlug());
        return documentationService.create(request)
            .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour une entrée", description = "Met à jour une entrée de documentation existante")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrée mise à jour avec succès"),
        @ApiResponse(responseCode = "404", description = "Entrée introuvable"),
        @ApiResponse(responseCode = "409", description = "Slug déjà utilisé")
    })
    public Mono<ResponseEntity<DocumentationResponseDTO>> update(
            @Parameter(description = "Identifiant de l'entrée") @PathVariable String id,
            @Valid @RequestBody DocumentationRequestDTO request) {
        logger.info("[admin] Mise à jour de la documentation id: {}", id);
        return documentationService.update(id, request)
            .map(ResponseEntity::ok);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une entrée", description = "Supprime une entrée de documentation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Entrée supprimée avec succès"),
        @ApiResponse(responseCode = "404", description = "Entrée introuvable")
    })
    public Mono<ResponseEntity<Void>> delete(
            @Parameter(description = "Identifiant de l'entrée") @PathVariable String id) {
        logger.info("[admin] Suppression de la documentation id: {}", id);
        return documentationService.delete(id)
            .thenReturn(ResponseEntity.noContent().<Void>build());
    }
}
