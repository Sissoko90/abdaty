package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.GeoBlocking;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour GeoBlocking.
 * Permet les opérations CRUD sur les règles de geo-blocking.
 */
@Repository
public interface GeoBlockingRepository extends R2dbcRepository<GeoBlocking, String> {

    /**
     * Trouve les règles de geo-blocking par code de pays.
     * 
     * @param countryCode le code du pays
     * @return un Mono de GeoBlocking
     */
    Mono<GeoBlocking> findByCountryCode(String countryCode);

    /**
     * Trouve toutes les règles par continent.
     * 
     * @param continentCode le code du continent
     * @return un Flux de GeoBlocking
     */
    Flux<GeoBlocking> findByContinentCode(String continentCode);

    /**
     * Trouve toutes les règles par statut d'accès.
     * 
     * @param accessStatus le statut d'accès (BLOCKED ou ALLOWED)
     * @return un Flux de GeoBlocking
     */
    Flux<GeoBlocking> findByAccessStatus(String accessStatus);

    /**
     * Compte le nombre de pays par statut d'accès.
     * 
     * @param accessStatus le statut d'accès
     * @return un Mono avec le compte
     */
    Mono<Long> countByAccessStatus(String accessStatus);

    /**
     * Trouve les règles par nom de pays contenant la recherche (insensible à la casse).
     * 
     * @param countryName le nom du pays à rechercher
     * @return un Flux de GeoBlocking
     */
    Flux<GeoBlocking> findByCountryNameContaining(String countryName);

    /**
     * Trouve les règles par continent et statut d'accès.
     * 
     * @param continentCode le code du continent
     * @param accessStatus le statut d'accès
     * @return un Flux de GeoBlocking
     */
    Flux<GeoBlocking> findByContinentCodeAndAccessStatus(String continentCode, String accessStatus);

    /**
     * Met à jour le statut d'accès pour tous les pays d'un continent.
     * 
     * @param continentCode le code du continent
     * @param accessStatus le nouveau statut d'accès
     * @return un Mono avec le nombre de lignes mises à jour
     */
    @Modifying
    @Query("UPDATE geo_blocking SET access_status = :accessStatus WHERE continent_code = :continentCode")
    Mono<Integer> updateAccessStatusByContinentCode(String continentCode, String accessStatus);
}
