package com.abdatytch.backend.service;

import com.abdatytch.backend.entity.AnalyticsData;
import reactor.core.publisher.Mono;

/**
 * Interface du service d'analytics.
 * Définit les méthodes pour collecter et stocker les informations d'analytics.
 */
public interface IAnalyticsService {

    /**
     * Collecte et stocke les informations d'analytics pour une requête.
     * 
     * @param ipAddress l'adresse IP
     * @param userAgent le User-Agent
     * @param requestPath le chemin de la requête
     * @param requestMethod la méthode HTTP
     * @param referer le référent
     * @param userId l'identifiant de l'utilisateur (optionnel)
     * @return un Mono contenant les données d'analytics sauvegardées
     */
    Mono<AnalyticsData> collectAndStoreAnalytics(
            String ipAddress,
            String userAgent,
            String requestPath,
            String requestMethod,
            String referer,
            String userId
    );

    /**
     * Crée un objet AnalyticsData à partir des informations brutes.
     * 
     * @param ipAddress l'adresse IP
     * @param userAgent le User-Agent
     * @param requestPath le chemin de la requête
     * @param requestMethod la méthode HTTP
     * @param referer le référent
     * @param userId l'identifiant de l'utilisateur (optionnel)
     * @return l'objet AnalyticsData créé
     */
    AnalyticsData createAnalyticsData(
            String ipAddress,
            String userAgent,
            String requestPath,
            String requestMethod,
            String referer,
            String userId
    );
}
