package com.abdatytch.backend.controller;

import com.abdatytch.backend.service.ISystemMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Controller pour les métriques système.
 * Expose les métriques depuis Micrometer/Prometheus pour le dashboard.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/system-metrics")
@Tag(name = "System Metrics", description = "API pour les métriques système")
public class SystemMetricsController {

    private static final Logger logger = LoggerFactory.getLogger(SystemMetricsController.class);

    private final ISystemMetricsService systemMetricsService;

    @Autowired
    public SystemMetricsController(ISystemMetricsService systemMetricsService) {
        this.systemMetricsService = systemMetricsService;
    }

    /**
     * Obtient toutes les métriques système pour le dashboard.
     * 
     * @return les métriques système
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les métriques système", description = "Récupère toutes les métriques système (CPU, Mémoire, Disque, API, etc.)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    })
    public Mono<ResponseEntity<Map<String, Object>>> getSystemMetrics() {
        logger.info("Récupération des métriques système");
        return systemMetricsService.getSystemMetrics()
            .map(ResponseEntity::ok);
    }

    /**
     * Incrémente le compteur de SMS envoyés.
     * 
     * @return confirmation de l'incrémentation
     */
    @PostMapping("/sms-sent/increment")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Incrémenter SMS envoyés", description = "Incrémente le compteur de SMS envoyés")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compteur incrémenté avec succès")
    })
    public Mono<ResponseEntity<String>> incrementSmsSent() {
        logger.info("Incrémentation du compteur SMS envoyés");
        systemMetricsService.incrementSmsSent();
        return Mono.just(ResponseEntity.ok("SMS counter incremented"));
    }

    /**
     * Incrémente le compteur de requêtes API.
     * 
     * @return confirmation de l'incrémentation
     */
    @PostMapping("/api-requests/increment")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Incrémenter requêtes API", description = "Incrémente le compteur de requêtes API")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compteur incrémenté avec succès")
    })
    public Mono<ResponseEntity<String>> incrementApiRequests() {
        logger.info("Incrémentation du compteur requêtes API");
        systemMetricsService.incrementApiRequests();
        return Mono.just(ResponseEntity.ok("API requests counter incremented"));
    }

    /**
     * Incrémente le compteur d'erreurs API.
     * 
     * @return confirmation de l'incrémentation
     */
    @PostMapping("/api-errors/increment")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Incrémenter erreurs API", description = "Incrémente le compteur d'erreurs API")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compteur incrémenté avec succès")
    })
    public Mono<ResponseEntity<String>> incrementApiErrors() {
        logger.info("Incrémentation du compteur erreurs API");
        systemMetricsService.incrementApiErrors();
        return Mono.just(ResponseEntity.ok("API errors counter incremented"));
    }

    /**
     * Met à jour le nombre d'utilisateurs actifs.
     * 
     * @param count le nombre d'utilisateurs actifs
     * @return confirmation de la mise à jour
     */
    @PostMapping("/active-users/update")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour utilisateurs actifs", description = "Met à jour le nombre d'utilisateurs actifs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Nombre d'utilisateurs mis à jour avec succès")
    })
    public Mono<ResponseEntity<String>> updateActiveUsers(
            @RequestParam Long count) {
        logger.info("Mise à jour du nombre d'utilisateurs actifs: {}", count);
        systemMetricsService.updateActiveUsers(count);
        return Mono.just(ResponseEntity.ok("Active users updated"));
    }
}
