package com.abdatytch.backend.service;

import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Interface du service pour l'analyse de tendances.
 * Définit les méthodes pour analyser les métriques temporelles et détecter les tendances.
 */
public interface ITrendAnalysisService {

    /**
     * Analyse la tendance d'une métrique sur une période donnée.
     * 
     * @param metricName le nom de la métrique
     * @param startDate date de début
     * @param endDate date de fin
     * @return un Mono contenant la tendance (UP, DOWN, STABLE)
     */
    Mono<String> analyzeTrend(String metricName, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Calcule la moyenne d'une métrique sur une période.
     * 
     * @param metricName le nom de la métrique
     * @param startDate date de début
     * @param endDate date de fin
     * @return un Mono contenant la moyenne
     */
    Mono<Double> calculateAverage(String metricName, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Détecte les anomalies dans les métriques.
     * 
     * @param metricName le nom de la métrique
     * @param threshold seuil de détection
     * @return un Mono contenant les anomalies détectées
     */
    Mono<Map<String, Object>> detectAnomalies(String metricName, double threshold);

    /**
     * Prédit les valeurs futures d'une métrique.
     * 
     * @param metricName le nom de la métrique
     * @param periods nombre de périodes à prédire
     * @return un Mono contenant les valeurs prédites
     */
    Mono<Map<String, Object>> predictValues(String metricName, int periods);

    /**
     * Obtient un résumé des tendances de toutes les métriques.
     * 
     * @return un Mono contenant le résumé
     */
    Mono<Map<String, Object>> getTrendsSummary();
}
