package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.response.SuspiciousIPDTO;
import com.abdatytch.backend.dto.response.SuspiciousIPStatisticsDTO;
import com.abdatytch.backend.service.ISuspiciousIPService;
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
 * Controller pour les IPs suspectes.
 * Expose les endpoints pour surveiller et bloquer les IPs suspectes détectées par Redis et MaxMind.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/suspicious-ips")
@Tag(name = "Suspicious IPs", description = "API pour la surveillance et le blocage des IPs suspectes")
public class SuspiciousIPController {

    private static final Logger logger = LoggerFactory.getLogger(SuspiciousIPController.class);

    private final ISuspiciousIPService suspiciousIPService;

    @Autowired
    public SuspiciousIPController(ISuspiciousIPService suspiciousIPService) {
        this.suspiciousIPService = suspiciousIPService;
    }

    /**
     * Obtient les statistiques des IPs suspectes.
     * 
     * @return les statistiques
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les statistiques", description = "Récupère les statistiques des IPs suspectes (total, bloquées, critiques, tentatives)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès")
    })
    public Mono<ResponseEntity<SuspiciousIPStatisticsDTO>> getStatistics() {
        logger.info("Récupération des statistiques des IPs suspectes");
        return suspiciousIPService.getStatistics()
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient toutes les IPs suspectes avec pagination.
     * 
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir toutes les IPs suspectes", description = "Récupère toutes les IPs suspectes avec pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IPs suspectes récupérées avec succès")
    })
    public Flux<SuspiciousIPDTO> getAllSuspiciousIPs(
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Récupération de toutes les IPs suspectes - page: {}, size: {}", page, size);
        return suspiciousIPService.getAllSuspiciousIPs(page, size);
    }

    /**
     * Obtient les IPs suspectes filtrées par niveau de menace.
     * 
     * @param threatLevel le niveau de menace (LOW, MEDIUM, HIGH, CRITICAL)
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    @GetMapping("/threat/{threatLevel}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les IPs par niveau de menace", description = "Récupère les IPs suspectes filtrées par niveau de menace")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IPs suspectes récupérées avec succès")
    })
    public Flux<SuspiciousIPDTO> getSuspiciousIPsByThreatLevel(
            @Parameter(description = "Niveau de menace (LOW, MEDIUM, HIGH, CRITICAL)") @PathVariable String threatLevel,
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Récupération des IPs suspectes avec niveau: {}, page: {}, size: {}", threatLevel, page, size);
        return suspiciousIPService.getSuspiciousIPsByThreatLevel(threatLevel, page, size);
    }

    /**
     * Obtient les IPs suspectes filtrées par statut de blocage.
     * 
     * @param blockStatus le statut de blocage (BLOCKED, NOT_BLOCKED)
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    @GetMapping("/status/{blockStatus}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les IPs par statut", description = "Récupère les IPs suspectes filtrées par statut de blocage")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IPs suspectes récupérées avec succès")
    })
    public Flux<SuspiciousIPDTO> getSuspiciousIPsByBlockStatus(
            @Parameter(description = "Statut de blocage (BLOCKED, NOT_BLOCKED)") @PathVariable String blockStatus,
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Récupération des IPs suspectes avec statut: {}, page: {}, size: {}", blockStatus, page, size);
        return suspiciousIPService.getSuspiciousIPsByBlockStatus(blockStatus, page, size);
    }

    /**
     * Recherche les IPs suspectes contenant un terme.
     * 
     * @param searchTerm le terme de recherche
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Rechercher les IPs", description = "Recherche les IPs suspectes contenant un terme")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IPs suspectes récupérées avec succès")
    })
    public Flux<SuspiciousIPDTO> searchSuspiciousIPs(
            @Parameter(description = "Terme de recherche") @RequestParam String searchTerm,
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Recherche des IPs suspectes avec terme: {}, page: {}, size: {}", searchTerm, page, size);
        return suspiciousIPService.searchSuspiciousIPs(searchTerm, page, size);
    }

    /**
     * Obtient une IP suspecte par adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    @GetMapping("/{ipAddress}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir une IP suspecte", description = "Récupère une IP suspecte par adresse IP")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IP suspecte récupérée avec succès")
    })
    public Mono<ResponseEntity<SuspiciousIPDTO>> getSuspiciousIPByIpAddress(
            @Parameter(description = "Adresse IP") @PathVariable String ipAddress) {
        logger.info("Récupération de l'IP suspecte: {}", ipAddress);
        return suspiciousIPService.getSuspiciousIPByIpAddress(ipAddress)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Détecte et enregistre une IP suspecte.
     * 
     * @param ipAddress l'adresse IP
     * @param reason la raison de la suspicion
     * @param threatLevel le niveau de menace
     * @return un Mono de SuspiciousIPDTO
     */
    @PostMapping("/detect")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Détecter une IP suspecte", description = "Détecte et enregistre une IP suspecte")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IP suspecte enregistrée avec succès")
    })
    public Mono<ResponseEntity<SuspiciousIPDTO>> detectAndRegisterSuspiciousIP(
            @Parameter(description = "Adresse IP") @RequestParam String ipAddress,
            @Parameter(description = "Raison de la suspicion") @RequestParam String reason,
            @Parameter(description = "Niveau de menace") @RequestParam String threatLevel) {
        logger.info("Détection et enregistrement de l'IP suspecte: {} - Raison: {} - Niveau: {}", ipAddress, reason, threatLevel);
        return suspiciousIPService.detectAndRegisterSuspiciousIP(ipAddress, reason, threatLevel)
            .map(ResponseEntity::ok);
    }

    /**
     * Incrémente le compteur de tentatives pour une IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    @PostMapping("/increment/{ipAddress}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Incrémenter les tentatives", description = "Incrémente le compteur de tentatives pour une IP")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compteur incrémenté avec succès")
    })
    public Mono<ResponseEntity<SuspiciousIPDTO>> incrementAttemptCount(
            @Parameter(description = "Adresse IP") @PathVariable String ipAddress) {
        logger.info("Incrémentation du compteur de tentatives pour l'IP: {}", ipAddress);
        return suspiciousIPService.incrementAttemptCount(ipAddress)
            .map(ResponseEntity::ok);
    }

    /**
     * Bloque une IP suspecte.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    @PostMapping("/block/{ipAddress}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bloquer une IP", description = "Bloque une IP suspecte")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IP bloquée avec succès")
    })
    public Mono<ResponseEntity<SuspiciousIPDTO>> blockIP(
            @Parameter(description = "Adresse IP à bloquer") @PathVariable String ipAddress) {
        logger.info("Blocage de l'IP suspecte: {}", ipAddress);
        return suspiciousIPService.blockIP(ipAddress)
            .map(ResponseEntity::ok);
    }

    /**
     * Débloque une IP suspecte.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    @PostMapping("/unblock/{ipAddress}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Débloquer une IP", description = "Débloque une IP suspecte")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "IP débloquée avec succès")
    })
    public Mono<ResponseEntity<SuspiciousIPDTO>> unblockIP(
            @Parameter(description = "Adresse IP à débloquer") @PathVariable String ipAddress) {
        logger.info("Déblocage de l'IP suspecte: {}", ipAddress);
        return suspiciousIPService.unblockIP(ipAddress)
            .map(ResponseEntity::ok);
    }

    /**
     * Met à jour le niveau de menace d'une IP.
     * 
     * @param ipAddress l'adresse IP
     * @param threatLevel le nouveau niveau de menace
     * @return un Mono de SuspiciousIPDTO
     */
    @PutMapping("/threat-level/{ipAddress}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour le niveau de menace", description = "Met à jour le niveau de menace d'une IP")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Niveau de menace mis à jour avec succès")
    })
    public Mono<ResponseEntity<SuspiciousIPDTO>> updateThreatLevel(
            @Parameter(description = "Adresse IP") @PathVariable String ipAddress,
            @Parameter(description = "Nouveau niveau de menace") @RequestParam String threatLevel) {
        logger.info("Mise à jour du niveau de menace pour l'IP: {} - Niveau: {}", ipAddress, threatLevel);
        return suspiciousIPService.updateThreatLevel(ipAddress, threatLevel)
            .map(ResponseEntity::ok);
    }
}
