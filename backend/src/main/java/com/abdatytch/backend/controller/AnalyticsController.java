package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.response.AnalyticsMetricsDTO;
import com.abdatytch.backend.dto.response.AnalyticsResponseDTO;
import com.abdatytch.backend.mapper.IAnalyticsMapper;
import com.abdatytch.backend.repository.AnalyticsDataRepository;
import com.abdatytch.backend.service.IAnalyticsAggregationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Controller pour les analytics.
 * Expose les endpoints pour exporter les données d'analytics et consulter les métriques.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/analytics")
@Tag(name = "Analytics", description = "API pour les analytics et métriques")
public class AnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsDataRepository analyticsDataRepository;
    private final IAnalyticsAggregationService analyticsAggregationService;
    private final IAnalyticsMapper analyticsMapper;

    @Autowired
    public AnalyticsController(
            AnalyticsDataRepository analyticsDataRepository,
            IAnalyticsAggregationService analyticsAggregationService,
            IAnalyticsMapper analyticsMapper) {
        this.analyticsDataRepository = analyticsDataRepository;
        this.analyticsAggregationService = analyticsAggregationService;
        this.analyticsMapper = analyticsMapper;
    }

    /**
     * Obtient toutes les données d'analytics.
     * 
     * @return un Flux de AnalyticsResponseDTO
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir toutes les données d'analytics", description = "Récupère toutes les données d'analytics collectées")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Données d'analytics récupérées avec succès")
    })
    public Flux<AnalyticsResponseDTO> getAllAnalytics() {
        logger.info("Récupération de toutes les données d'analytics");
        return analyticsDataRepository.findAll()
            .map(analyticsMapper::toResponseDTO);
    }

    /**
     * Obtient les analytics par adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Flux de AnalyticsResponseDTO
     */
    @GetMapping("/ip/{ipAddress}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les analytics par IP", description = "Récupère les analytics pour une adresse IP spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analytics pour l'IP récupérés avec succès")
    })
    public Flux<AnalyticsResponseDTO> getAnalyticsByIp(
            @Parameter(description = "Adresse IP") @PathVariable String ipAddress) {
        logger.info("Récupération des analytics pour l'IP: {}", ipAddress);
        return analyticsDataRepository.findByIpAddress(ipAddress)
            .map(analyticsMapper::toResponseDTO);
    }

    /**
     * Obtient les analytics par utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @return un Flux de AnalyticsResponseDTO
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les analytics par utilisateur", description = "Récupère les analytics pour un utilisateur spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analytics pour l'utilisateur récupérés avec succès")
    })
    public Flux<AnalyticsResponseDTO> getAnalyticsByUser(
            @Parameter(description = "ID utilisateur") @PathVariable String userId) {
        logger.info("Récupération des analytics pour l'utilisateur: {}", userId);
        return analyticsDataRepository.findByUserId(userId)
            .map(analyticsMapper::toResponseDTO);
    }

    /**
     * Obtient les métriques pour les dernières 24 heures.
     * 
     * @return les métriques agrégées
     */
    @GetMapping("/metrics/24h")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Métriques des dernières 24h", description = "Obtient les métriques agrégées pour les dernières 24 heures")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    })
    public Mono<ResponseEntity<AnalyticsMetricsDTO>> getLast24HoursMetrics() {
        logger.info("Récupération des métriques des dernières 24h");
        return analyticsAggregationService.aggregateLast24Hours()
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient les métriques pour les 7 derniers jours.
     * 
     * @return les métriques agrégées
     */
    @GetMapping("/metrics/7d")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Métriques des 7 derniers jours", description = "Obtient les métriques agrégées pour les 7 derniers jours")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    })
    public Mono<ResponseEntity<AnalyticsMetricsDTO>> getLast7DaysMetrics() {
        logger.info("Récupération des métriques des 7 derniers jours");
        return analyticsAggregationService.aggregateLast7Days()
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient les métriques pour les 30 derniers jours.
     * 
     * @return les métriques agrégées
     */
    @GetMapping("/metrics/30d")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Métriques des 30 derniers jours", description = "Obtient les métriques agrégées pour les 30 derniers jours")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    })
    public Mono<ResponseEntity<AnalyticsMetricsDTO>> getLast30DaysMetrics() {
        logger.info("Récupération des métriques des 30 derniers jours");
        return analyticsAggregationService.aggregateLast30Days()
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient les métriques pour le mois en cours.
     * 
     * @return les métriques agrégées
     */
    @GetMapping("/metrics/current-month")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Métriques du mois en cours", description = "Obtient les métriques agrégées pour le mois en cours")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    })
    public Mono<ResponseEntity<AnalyticsMetricsDTO>> getCurrentMonthMetrics() {
        logger.info("Récupération des métriques du mois en cours");
        return analyticsAggregationService.aggregateCurrentMonth()
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient les métriques pour une période personnalisée.
     * 
     * @param startDate date de début
     * @param endDate date de fin
     * @param period période (day, week, month)
     * @return les métriques agrégées
     */
    @GetMapping("/metrics/custom")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Métriques personnalisées", description = "Obtient les métriques agrégées pour une période personnalisée")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Métriques récupérées avec succès")
    })
    public Mono<ResponseEntity<AnalyticsMetricsDTO>> getCustomMetrics(
            @Parameter(description = "Date de début") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Date de fin") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Période") @RequestParam(defaultValue = "day") String period) {
        logger.info("Récupération des métriques personnalisées du {} au {}", startDate, endDate);
        return analyticsAggregationService.aggregateAnalytics(startDate, endDate, period)
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient les métriques par pays.
     * 
     * @param country le pays
     * @return un Flux de AnalyticsResponseDTO
     */
    @GetMapping("/country/{country}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Analytics par pays", description = "Récupère les analytics pour un pays spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analytics pour le pays récupérés avec succès")
    })
    public Flux<AnalyticsResponseDTO> getAnalyticsByCountry(
            @Parameter(description = "Pays") @PathVariable String country) {
        logger.info("Récupération des analytics pour le pays: {}", country);
        return analyticsDataRepository.findByCountry(country)
            .map(analyticsMapper::toResponseDTO);
    }

    /**
     * Obtient les métriques par type d'appareil.
     * 
     * @param deviceType le type d'appareil
     * @return un Flux de AnalyticsResponseDTO
     */
    @GetMapping("/device/{deviceType}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Analytics par type d'appareil", description = "Récupère les analytics pour un type d'appareil spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analytics pour le type d'appareil récupérés avec succès")
    })
    public Flux<AnalyticsResponseDTO> getAnalyticsByDeviceType(
            @Parameter(description = "Type d'appareil") @PathVariable String deviceType) {
        logger.info("Récupération des analytics pour le type d'appareil: {}", deviceType);
        return analyticsDataRepository.findByDeviceType(deviceType)
            .map(analyticsMapper::toResponseDTO);
    }
}
