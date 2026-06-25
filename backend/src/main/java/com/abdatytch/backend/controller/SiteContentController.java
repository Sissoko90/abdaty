package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.SiteContentRequestDTO;
import com.abdatytch.backend.dto.response.SiteContentResponseDTO;
import com.abdatytch.backend.service.ISiteContentService;
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
 * Controller du contenu éditorial unifié du site.
 *
 * Une seule ressource gère TOUT le contenu (hero, services, témoignages, FAQ,
 * footer...) via le couple (section, clé). Lecture PUBLIQUE des blocs actifs,
 * administration (ADMIN) pour le CRUD et l'upsert.
 *
 * Les chemins publics sont préfixés par /section/ pour éviter toute ambiguïté
 * avec les chemins d'administration.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/content")
@Tag(name = "Site Content", description = "Contenu éditorial unifié et multilingue du site")
public class SiteContentController {

    private static final Logger logger = LoggerFactory.getLogger(SiteContentController.class);

    private final ISiteContentService siteContentService;

    @Autowired
    public SiteContentController(ISiteContentService siteContentService) {
        this.siteContentService = siteContentService;
    }

    /* ============================ PUBLIC ============================ */

    @GetMapping("/section/{section}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Contenu actif d'une section", description = "Liste les blocs actifs d'une section, triés par ordre d'affichage")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Contenu récupéré avec succès"))
    public Flux<SiteContentResponseDTO> getActiveSection(
            @Parameter(description = "Nom de la section (hero, services, faq...)") @PathVariable String section) {
        logger.info("[public] Contenu de la section: {}", section);
        return siteContentService.getActiveSection(section);
    }

    @GetMapping("/section/{section}/{key}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Bloc de contenu précis", description = "Récupère un bloc de contenu par section et clé")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bloc trouvé"),
        @ApiResponse(responseCode = "404", description = "Bloc introuvable")
    })
    public Mono<ResponseEntity<SiteContentResponseDTO>> getItem(
            @Parameter(description = "Nom de la section") @PathVariable String section,
            @Parameter(description = "Clé du bloc") @PathVariable String key) {
        logger.info("[public] Bloc de contenu: {}/{}", section, key);
        return siteContentService.getItem(section, key)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /* ============================ ADMIN ============================ */

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tout le contenu (admin)", description = "Liste l'intégralité du contenu, groupé par section")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Contenu récupéré avec succès"))
    public Flux<SiteContentResponseDTO> getAll() {
        logger.info("[admin] Liste de tout le contenu");
        return siteContentService.getAll();
    }

    @GetMapping("/admin/section/{section}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Contenu d'une section (admin)", description = "Liste tous les blocs d'une section, inactifs inclus")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Contenu récupéré avec succès"))
    public Flux<SiteContentResponseDTO> getSection(
            @Parameter(description = "Nom de la section") @PathVariable String section) {
        logger.info("[admin] Contenu de la section: {}", section);
        return siteContentService.getSection(section);
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bloc par id (admin)", description = "Récupère un bloc de contenu par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bloc trouvé"),
        @ApiResponse(responseCode = "404", description = "Bloc introuvable")
    })
    public Mono<ResponseEntity<SiteContentResponseDTO>> getById(
            @Parameter(description = "Identifiant du bloc") @PathVariable String id) {
        logger.info("[admin] Bloc de contenu par id: {}", id);
        return siteContentService.getById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un bloc", description = "Crée un nouveau bloc de contenu")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Bloc créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "(section, clé) déjà utilisée")
    })
    public Mono<ResponseEntity<SiteContentResponseDTO>> create(@Valid @RequestBody SiteContentRequestDTO request) {
        logger.info("[admin] Création d'un bloc: {}/{}", request.getSection(), request.getContentKey());
        return siteContentService.create(request)
            .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour un bloc", description = "Met à jour un bloc de contenu par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bloc mis à jour avec succès"),
        @ApiResponse(responseCode = "404", description = "Bloc introuvable")
    })
    public Mono<ResponseEntity<SiteContentResponseDTO>> update(
            @Parameter(description = "Identifiant du bloc") @PathVariable String id,
            @Valid @RequestBody SiteContentRequestDTO request) {
        logger.info("[admin] Mise à jour du bloc id: {}", id);
        return siteContentService.update(id, request)
            .map(ResponseEntity::ok);
    }

    @PutMapping("/upsert/{section}/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer/Mettre à jour un bloc (upsert)", description = "Crée ou met à jour le bloc identifié par (section, clé)")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Bloc enregistré avec succès"))
    public Mono<ResponseEntity<SiteContentResponseDTO>> upsert(
            @Parameter(description = "Nom de la section") @PathVariable String section,
            @Parameter(description = "Clé du bloc") @PathVariable String key,
            @RequestBody SiteContentRequestDTO request) {
        logger.info("[admin] Upsert du bloc: {}/{}", section, key);
        return siteContentService.upsert(section, key, request)
            .map(ResponseEntity::ok);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un bloc", description = "Supprime un bloc de contenu")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Bloc supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Bloc introuvable")
    })
    public Mono<ResponseEntity<Void>> delete(
            @Parameter(description = "Identifiant du bloc") @PathVariable String id) {
        logger.info("[admin] Suppression du bloc id: {}", id);
        return siteContentService.delete(id)
            .thenReturn(ResponseEntity.noContent().<Void>build());
    }
}
