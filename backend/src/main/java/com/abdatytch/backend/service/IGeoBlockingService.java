package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.GeoBlockingResponseDTO;
import com.abdatytch.backend.dto.response.GeoBlockingStatsDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service GeoBlocking.
 * Définit les méthodes pour gérer les règles de geo-blocking.
 */
public interface IGeoBlockingService {

    /**
     * Obtient les statistiques de geo-blocking.
     * 
     * @return les statistiques
     */
    Mono<GeoBlockingStatsDTO> getStatistics();

    /**
     * Obtient toutes les règles de geo-blocking.
     * 
     * @return un Flux de GeoBlockingResponseDTO
     */
    Flux<GeoBlockingResponseDTO> getAllRules();

    /**
     * Obtient les règles de geo-blocking par continent.
     * 
     * @param continentCode le code du continent
     * @return un Flux de GeoBlockingResponseDTO
     */
    Flux<GeoBlockingResponseDTO> getRulesByContinent(String continentCode);

    /**
     * Obtient les règles de geo-blocking par statut d'accès.
     * 
     * @param accessStatus le statut d'accès (BLOCKED ou ALLOWED)
     * @return un Flux de GeoBlockingResponseDTO
     */
    Flux<GeoBlockingResponseDTO> getRulesByStatus(String accessStatus);

    /**
     * Recherche des règles de geo-blocking par nom de pays.
     * 
     * @param countryName le nom du pays à rechercher
     * @return un Flux de GeoBlockingResponseDTO
     */
    Flux<GeoBlockingResponseDTO> searchByCountryName(String countryName);

    /**
     * Obtient une règle de geo-blocking par code de pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlockingResponseDTO
     */
    Mono<GeoBlockingResponseDTO> getRuleByCountryCode(String countryCode);

    /**
     * Bloque un pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlockingResponseDTO
     */
    Mono<GeoBlockingResponseDTO> blockCountry(String countryCode);

    /**
     * Débloque un pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlockingResponseDTO
     */
    Mono<GeoBlockingResponseDTO> unblockCountry(String countryCode);

    /**
     * Bloque tous les pays d'un continent.
     * 
     * @param continentCode le code du continent
     * @return un Mono avec le nombre de pays bloqués
     */
    Mono<Long> blockContinent(String continentCode);

    /**
     * Débloque tous les pays d'un continent.
     * 
     * @param continentCode le code du continent
     * @return un Mono avec le nombre de pays débloqués
     */
    Mono<Long> unblockContinent(String continentCode);

    /**
     * Débloque tous les pays.
     * 
     * @return un Mono avec le nombre de pays débloqués
     */
    Mono<Long> unblockAll();

    /**
     * Met à jour le score de menace d'un pays.
     * 
     * @param countryCode le code du pays
     * @param threatScore le nouveau score de menace
     * @return un Mono de GeoBlockingResponseDTO
     */
    Mono<GeoBlockingResponseDTO> updateThreatScore(String countryCode, Integer threatScore);

    /**
     * Met à jour le nombre de requêtes pour un pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlockingResponseDTO
     */
    Mono<GeoBlockingResponseDTO> incrementRequestCount(String countryCode);
}
