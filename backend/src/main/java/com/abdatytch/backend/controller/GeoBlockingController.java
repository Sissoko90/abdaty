package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.response.GeoBlockingResponseDTO;
import com.abdatytch.backend.dto.response.GeoBlockingStatsDTO;
import com.abdatytch.backend.service.IGeoBlockingService;
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
 * Controller pour le geo-blocking.
 * Expose les endpoints pour gérer les règles de blocage par pays et consulter les statistiques.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/geo-blocking")
@Tag(name = "Geo-Blocking", description = "API pour le geo-blocking par pays")
public class GeoBlockingController {

    private static final Logger logger = LoggerFactory.getLogger(GeoBlockingController.class);

    private final IGeoBlockingService geoBlockingService;

    @Autowired
    public GeoBlockingController(IGeoBlockingService geoBlockingService) {
        this.geoBlockingService = geoBlockingService;
    }

    /**
     * Obtient les statistiques de geo-blocking.
     * 
     * @return les statistiques
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les statistiques", description = "Récupère les statistiques de geo-blocking (total pays, bloqués, autorisés, requêtes)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès")
    })
    public Mono<ResponseEntity<GeoBlockingStatsDTO>> getStatistics() {
        logger.info("Récupération des statistiques de geo-blocking");
        return geoBlockingService.getStatistics()
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient toutes les règles de geo-blocking.
     * 
     * @return un Flux de GeoBlockingResponseDTO
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir toutes les règles", description = "Récupère toutes les règles de geo-blocking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Règles récupérées avec succès")
    })
    public Flux<GeoBlockingResponseDTO> getAllRules() {
        logger.info("Récupération de toutes les règles de geo-blocking");
        return geoBlockingService.getAllRules();
    }

    /**
     * Obtient les règles de geo-blocking par continent.
     * 
     * @param continentCode le code du continent
     * @return un Flux de GeoBlockingResponseDTO
     */
    @GetMapping("/continent/{continentCode}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les règles par continent", description = "Récupère les règles de geo-blocking pour un continent spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Règles récupérées avec succès")
    })
    public Flux<GeoBlockingResponseDTO> getRulesByContinent(
            @Parameter(description = "Code du continent (AF, EU, NA, SA, AS, OC, AN)") @PathVariable String continentCode) {
        logger.info("Récupération des règles de geo-blocking pour le continent: {}", continentCode);
        return geoBlockingService.getRulesByContinent(continentCode);
    }

    /**
     * Obtient les règles de geo-blocking par statut d'accès.
     * 
     * @param accessStatus le statut d'accès (BLOCKED ou ALLOWED)
     * @return un Flux de GeoBlockingResponseDTO
     */
    @GetMapping("/status/{accessStatus}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les règles par statut", description = "Récupère les règles de geo-blocking par statut d'accès")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Règles récupérées avec succès")
    })
    public Flux<GeoBlockingResponseDTO> getRulesByStatus(
            @Parameter(description = "Statut d'accès (BLOCKED ou ALLOWED)") @PathVariable String accessStatus) {
        logger.info("Récupération des règles de geo-blocking avec statut: {}", accessStatus);
        return geoBlockingService.getRulesByStatus(accessStatus);
    }

    /**
     * Recherche des règles de geo-blocking par nom de pays.
     * 
     * @param countryName le nom du pays à rechercher
     * @return un Flux de GeoBlockingResponseDTO
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Rechercher par pays", description = "Recherche des règles de geo-blocking par nom de pays")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Règles récupérées avec succès")
    })
    public Flux<GeoBlockingResponseDTO> searchByCountryName(
            @Parameter(description = "Nom du pays à rechercher") @RequestParam String countryName) {
        logger.info("Recherche des règles de geo-blocking pour le pays: {}", countryName);
        return geoBlockingService.searchByCountryName(countryName);
    }

    /**
     * Obtient une règle de geo-blocking par code de pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlockingResponseDTO
     */
    @GetMapping("/country/{countryCode}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir une règle par pays", description = "Récupère la règle de geo-blocking pour un pays spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Règle récupérée avec succès")
    })
    public Mono<ResponseEntity<GeoBlockingResponseDTO>> getRuleByCountryCode(
            @Parameter(description = "Code du pays (ex: ML, FR, US)") @PathVariable String countryCode) {
        logger.info("Récupération de la règle de geo-blocking pour le pays: {}", countryCode);
        return geoBlockingService.getRuleByCountryCode(countryCode)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Bloque un pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlockingResponseDTO
     */
    @PostMapping("/block/{countryCode}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bloquer un pays", description = "Bloque l'accès depuis un pays spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pays bloqué avec succès")
    })
    public Mono<ResponseEntity<GeoBlockingResponseDTO>> blockCountry(
            @Parameter(description = "Code du pays à bloquer") @PathVariable String countryCode) {
        logger.info("Blocage du pays: {}", countryCode);
        return geoBlockingService.blockCountry(countryCode)
            .map(ResponseEntity::ok);
    }

    /**
     * Débloque un pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlockingResponseDTO
     */
    @PostMapping("/unblock/{countryCode}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Débloquer un pays", description = "Débloque l'accès depuis un pays spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pays débloqué avec succès")
    })
    public Mono<ResponseEntity<GeoBlockingResponseDTO>> unblockCountry(
            @Parameter(description = "Code du pays à débloquer") @PathVariable String countryCode) {
        logger.info("Déblocage du pays: {}", countryCode);
        return geoBlockingService.unblockCountry(countryCode)
            .map(ResponseEntity::ok);
    }

    /**
     * Bloque tous les pays d'un continent.
     * 
     * @param continentCode le code du continent
     * @return un Mono avec le nombre de pays bloqués
     */
    @PostMapping("/block-continent/{continentCode}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bloquer un continent", description = "Bloque l'accès depuis tous les pays d'un continent")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Continent bloqué avec succès")
    })
    public Mono<ResponseEntity<Long>> blockContinent(
            @Parameter(description = "Code du continent à bloquer") @PathVariable String continentCode) {
        logger.info("Blocage du continent: {}", continentCode);
        return geoBlockingService.blockContinent(continentCode)
            .map(ResponseEntity::ok);
    }

    /**
     * Débloque tous les pays d'un continent.
     * 
     * @param continentCode le code du continent
     * @return un Mono avec le nombre de pays débloqués
     */
    @PostMapping("/unblock-continent/{continentCode}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Débloquer un continent", description = "Débloque l'accès depuis tous les pays d'un continent")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Continent débloqué avec succès")
    })
    public Mono<ResponseEntity<Long>> unblockContinent(
            @Parameter(description = "Code du continent à débloquer") @PathVariable String continentCode) {
        logger.info("Déblocage du continent: {}", continentCode);
        return geoBlockingService.unblockContinent(continentCode)
            .map(ResponseEntity::ok);
    }

    /**
     * Débloque tous les pays.
     * 
     * @return un Mono avec le nombre de pays débloqués
     */
    @PostMapping("/unblock-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Débloquer tous les pays", description = "Débloque l'accès depuis tous les pays")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tous les pays débloqués avec succès")
    })
    public Mono<ResponseEntity<Long>> unblockAll() {
        logger.info("Déblocage de tous les pays");
        return geoBlockingService.unblockAll()
            .map(ResponseEntity::ok);
    }

    /**
     * Met à jour le score de menace d'un pays.
     * 
     * @param countryCode le code du pays
     * @param threatScore le nouveau score de menace
     * @return un Mono de GeoBlockingResponseDTO
     */
    @PutMapping("/threat-score/{countryCode}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour le score de menace", description = "Met à jour le score de menace d'un pays")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Score de menace mis à jour avec succès")
    })
    public Mono<ResponseEntity<GeoBlockingResponseDTO>> updateThreatScore(
            @Parameter(description = "Code du pays") @PathVariable String countryCode,
            @Parameter(description = "Nouveau score de menace (0-10)") @RequestParam Integer threatScore) {
        logger.info("Mise à jour du score de menace pour le pays: {} - Score: {}", countryCode, threatScore);
        return geoBlockingService.updateThreatScore(countryCode, threatScore)
            .map(ResponseEntity::ok);
    }
}
