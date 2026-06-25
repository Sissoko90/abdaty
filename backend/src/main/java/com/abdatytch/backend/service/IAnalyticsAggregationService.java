package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.AnalyticsMetricsDTO;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Interface du service d'agrégation des analytics.
 * Définit les méthodes pour agréger les données d'analytics par période.
 */
public interface IAnalyticsAggregationService {

    /**
     * Agrège les analytics pour une période donnée.
     * 
     * @param startDate date de début
     * @param endDate date de fin
     * @param period période (day, week, month)
     * @return les métriques agrégées
     */
    Mono<AnalyticsMetricsDTO> aggregateAnalytics(LocalDateTime startDate, LocalDateTime endDate, String period);

    /**
     * Agrège les analytics pour les dernières 24 heures.
     * 
     * @return les métriques agrégées
     */
    Mono<AnalyticsMetricsDTO> aggregateLast24Hours();

    /**
     * Agrège les analytics pour les 7 derniers jours.
     * 
     * @return les métriques agrégées
     */
    Mono<AnalyticsMetricsDTO> aggregateLast7Days();

    /**
     * Agrège les analytics pour les 30 derniers jours.
     * 
     * @return les métriques agrégées
     */
    Mono<AnalyticsMetricsDTO> aggregateLast30Days();

    /**
     * Agrège les analytics pour le mois en cours.
     * 
     * @return les métriques agrégées
     */
    Mono<AnalyticsMetricsDTO> aggregateCurrentMonth();
}
