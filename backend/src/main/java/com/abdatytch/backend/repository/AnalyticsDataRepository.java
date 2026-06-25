package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.AnalyticsData;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;

/**
 * Repository R2DBC pour AnalyticsData.
 * Permet les opérations CRUD sur les données d'analytics.
 */
@Repository
public interface AnalyticsDataRepository extends R2dbcRepository<AnalyticsData, String> {

    /**
     * Données d'analytics sur une fenêtre temporelle (filtrage poussé en SQL,
     * appuyé sur l'index idx_analytics_data_created_at) — évite un full scan +
     * filtrage en mémoire.
     */
    Flux<AnalyticsData> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Trouve les données d'analytics par adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Flux de AnalyticsData
     */
    Flux<AnalyticsData> findByIpAddress(String ipAddress);

    /**
     * Trouve les données d'analytics par utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @return un Flux de AnalyticsData
     */
    Flux<AnalyticsData> findByUserId(String userId);

    /**
     * Trouve les données d'analytics par pays.
     * 
     * @param country le pays
     * @return un Flux de AnalyticsData
     */
    Flux<AnalyticsData> findByCountry(String country);

    /**
     * Trouve les données d'analytics par type d'appareil.
     * 
     * @param deviceType le type d'appareil
     * @return un Flux de AnalyticsData
     */
    Flux<AnalyticsData> findByDeviceType(String deviceType);

    /**
     * Trouve les données d'analytics par navigateur.
     * 
     * @param browserName le nom du navigateur
     * @return un Flux de AnalyticsData
     */
    Flux<AnalyticsData> findByBrowserName(String browserName);

    /**
     * Trouve les données d'analytics par système d'exploitation.
     * 
     * @param osName le nom de l'OS
     * @return un Flux de AnalyticsData
     */
    Flux<AnalyticsData> findByOsName(String osName);
}
