package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.SuspiciousIPDTO;
import com.abdatytch.backend.dto.response.SuspiciousIPStatisticsDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service pour les IPs suspectes.
 * Définit les méthodes pour détecter et gérer les IPs suspectes.
 */
public interface ISuspiciousIPService {

    /**
     * Obtient les statistiques des IPs suspectes.
     * 
     * @return les statistiques
     */
    Mono<SuspiciousIPStatisticsDTO> getStatistics();

    /**
     * Obtient toutes les IPs suspectes avec pagination.
     * 
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    Flux<SuspiciousIPDTO> getAllSuspiciousIPs(int page, int size);

    /**
     * Obtient les IPs suspectes filtrées par niveau de menace.
     * 
     * @param threatLevel le niveau de menace (LOW, MEDIUM, HIGH, CRITICAL)
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    Flux<SuspiciousIPDTO> getSuspiciousIPsByThreatLevel(String threatLevel, int page, int size);

    /**
     * Obtient les IPs suspectes filtrées par statut de blocage.
     * 
     * @param blockStatus le statut de blocage (BLOCKED, NOT_BLOCKED)
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    Flux<SuspiciousIPDTO> getSuspiciousIPsByBlockStatus(String blockStatus, int page, int size);

    /**
     * Recherche les IPs suspectes contenant un terme.
     * 
     * @param searchTerm le terme de recherche
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de SuspiciousIPDTO
     */
    Flux<SuspiciousIPDTO> searchSuspiciousIPs(String searchTerm, int page, int size);

    /**
     * Obtient une IP suspecte par adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    Mono<SuspiciousIPDTO> getSuspiciousIPByIpAddress(String ipAddress);

    /**
     * Détecte et enregistre une IP suspecte.
     * 
     * @param ipAddress l'adresse IP
     * @param reason la raison de la suspicion
     * @param threatLevel le niveau de menace
     * @return un Mono de SuspiciousIPDTO
     */
    Mono<SuspiciousIPDTO> detectAndRegisterSuspiciousIP(String ipAddress, String reason, String threatLevel);

    /**
     * Incrémente le compteur de tentatives pour une IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    Mono<SuspiciousIPDTO> incrementAttemptCount(String ipAddress);

    /**
     * Bloque une IP suspecte.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    Mono<SuspiciousIPDTO> blockIP(String ipAddress);

    /**
     * Débloque une IP suspecte.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    Mono<SuspiciousIPDTO> unblockIP(String ipAddress);

    /**
     * Met à jour le niveau de menace d'une IP.
     * 
     * @param ipAddress l'adresse IP
     * @param threatLevel le nouveau niveau de menace
     * @return un Mono de SuspiciousIPDTO
     */
    Mono<SuspiciousIPDTO> updateThreatLevel(String ipAddress, String threatLevel);
}
