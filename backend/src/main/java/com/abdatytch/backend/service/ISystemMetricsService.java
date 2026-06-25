package com.abdatytch.backend.service;

import reactor.core.publisher.Mono;

/**
 * Interface du service pour les métriques système.
 * Définit les méthodes pour collecter les métriques depuis Micrometer/Prometheus.
 */
public interface ISystemMetricsService {

    /**
     * Obtient toutes les métriques système au format JSON pour le dashboard.
     * 
     * @return un Mono contenant les métriques système
     */
    Mono<java.util.Map<String, Object>> getSystemMetrics();

    /**
     * Incrémente le compteur de SMS envoyés.
     */
    void incrementSmsSent();

    /**
     * Incrémente le compteur de requêtes API.
     */
    void incrementApiRequests();

    /**
     * Incrémente le compteur d'erreurs API.
     */
    void incrementApiErrors();

    /**
     * Met à jour le nombre d'utilisateurs actifs.
     * 
     * @param count le nombre d'utilisateurs actifs
     */
    void updateActiveUsers(long count);
}
