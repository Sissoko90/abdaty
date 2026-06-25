package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.SuspiciousIP;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour SuspiciousIP.
 * Permet les opérations CRUD sur les IPs suspectes.
 */
@Repository
public interface SuspiciousIPRepository extends R2dbcRepository<SuspiciousIP, String> {

    /**
     * Trouve une IP suspecte par adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIP
     */
    Mono<SuspiciousIP> findByIpAddress(String ipAddress);

    /**
     * Trouve toutes les IPs suspectes par niveau de menace.
     * 
     * @param threatLevel le niveau de menace (LOW, MEDIUM, HIGH, CRITICAL)
     * @return un Flux de SuspiciousIP
     */
    Flux<SuspiciousIP> findByThreatLevel(String threatLevel);

    /**
     * Trouve toutes les IPs suspectes par statut de blocage.
     * 
     * @param blockStatus le statut de blocage (BLOCKED, NOT_BLOCKED)
     * @return un Flux de SuspiciousIP
     */
    Flux<SuspiciousIP> findByBlockStatus(String blockStatus);

    /**
     * Compte le nombre d'IPs suspectes par niveau de menace.
     * 
     * @param threatLevel le niveau de menace
     * @return un Mono avec le compte
     */
    Mono<Long> countByThreatLevel(String threatLevel);

    /**
     * Compte le nombre d'IPs suspectes par statut de blocage.
     * 
     * @param blockStatus le statut de blocage
     * @return un Mono avec le compte
     */
    Mono<Long> countByBlockStatus(String blockStatus);

    /**
     * Recherche les IPs suspectes contenant un terme.
     * 
     * @param searchTerm le terme de recherche
     * @return un Flux de SuspiciousIP
     */
    Flux<SuspiciousIP> findByIpAddressContaining(String searchTerm);

    /**
     * Trouve toutes les IPs suspectes par pays.
     * 
     * @param country le pays
     * @return un Flux de SuspiciousIP
     */
    Flux<SuspiciousIP> findByCountry(String country);

    /**
     * Met à jour le statut de blocage par adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @param blockStatus le nouveau statut de blocage
     * @return un Mono avec le nombre de lignes mises à jour
     */
    @Modifying
    @Query("UPDATE suspicious_ips SET block_status = :blockStatus WHERE ip_address = :ipAddress")
    Mono<Integer> updateBlockStatusByIpAddress(String ipAddress, String blockStatus);
}
