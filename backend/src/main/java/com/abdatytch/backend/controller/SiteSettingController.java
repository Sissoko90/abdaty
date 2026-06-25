package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.SiteSettingRequestDTO;
import com.abdatytch.backend.dto.response.SiteSettingResponseDTO;
import com.abdatytch.backend.service.ISiteSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controller pour les paramètres du site.
 *
 * Lecture PUBLIQUE (le site vitrine consomme la configuration : nom du site,
 * SEO, réseaux sociaux, thème...) et écriture réservée aux ADMIN.
 * Les GET publics sont également autorisés dans SecurityConfig.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/site-settings")
@Tag(name = "Site Settings", description = "Paramètres de configuration du site")
public class SiteSettingController {

    private static final Logger logger = LoggerFactory.getLogger(SiteSettingController.class);

    private final ISiteSettingService siteSettingService;

    @Autowired
    public SiteSettingController(ISiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    /* ============================ PUBLIC ============================ */

    @GetMapping
    @PreAuthorize("permitAll()")
    @Operation(summary = "Tous les paramètres", description = "Liste l'ensemble des paramètres du site")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<SiteSettingResponseDTO> getAll() {
        logger.info("[public] Liste des paramètres du site");
        return siteSettingService.getAll();
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Paramètres par catégorie", description = "Liste les paramètres d'une catégorie (general, seo, social, theme...)")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<SiteSettingResponseDTO> getByCategory(
            @Parameter(description = "Catégorie") @PathVariable String category) {
        logger.info("[public] Paramètres de la catégorie: {}", category);
        return siteSettingService.getByCategory(category);
    }

    @GetMapping("/key/{key}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Paramètre par clé", description = "Récupère un paramètre par sa clé")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paramètre trouvé"),
        @ApiResponse(responseCode = "404", description = "Paramètre introuvable")
    })
    public Mono<ResponseEntity<SiteSettingResponseDTO>> getByKey(
            @Parameter(description = "Clé du paramètre") @PathVariable String key) {
        logger.info("[public] Paramètre par clé: {}", key);
        return siteSettingService.getByKey(key)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /* ============================ ADMIN ============================ */

    @PutMapping("/key/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer/Mettre à jour un paramètre", description = "Crée ou met à jour un paramètre identifié par sa clé (upsert)")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Paramètre enregistré avec succès"))
    public Mono<ResponseEntity<SiteSettingResponseDTO>> upsert(
            @Parameter(description = "Clé du paramètre") @PathVariable String key,
            @RequestBody SiteSettingRequestDTO request) {
        logger.info("[admin] Upsert du paramètre: {}", key);
        return siteSettingService.upsert(key, request)
            .map(ResponseEntity::ok);
    }

    @DeleteMapping("/key/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un paramètre", description = "Supprime un paramètre par sa clé")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Paramètre supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Paramètre introuvable")
    })
    public Mono<ResponseEntity<Void>> delete(
            @Parameter(description = "Clé du paramètre") @PathVariable String key) {
        logger.info("[admin] Suppression du paramètre: {}", key);
        return siteSettingService.delete(key)
            .thenReturn(ResponseEntity.noContent().<Void>build());
    }
}
