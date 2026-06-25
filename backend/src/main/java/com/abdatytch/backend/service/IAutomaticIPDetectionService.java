package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.SuspiciousIPDTO;
import reactor.core.publisher.Mono;

/**
 * Interface du service pour la détection automatique des IPs suspectes.
 * Définit les méthodes pour détecter automatiquement les IPs suspectes basées sur des patterns.
 */
public interface IAutomaticIPDetectionService {

    /**
     * Analyse une tentative de connexion et détecte si l'IP est suspecte.
     * 
     * @param ipAddress l'adresse IP
     * @param username le nom d'utilisateur (optionnel)
     * @param success si la connexion a réussi
     * @return un Mono de SuspiciousIPDTO si l'IP est suspecte, sinon vide
     */
    Mono<SuspiciousIPDTO> analyzeLoginAttempt(String ipAddress, String username, boolean success);

    /**
     * Détecte les IPs suspectes basées sur les patterns de tentatives.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO si l'IP est suspecte
     */
    Mono<SuspiciousIPDTO> detectSuspiciousIP(String ipAddress);

    /**
     * Définit les seuils de détection.
     * 
     * @param maxAttempts nombre maximum de tentatives autorisées
     * @param timeWindowSeconds fenêtre de temps en secondes
     */
    void setDetectionThresholds(long maxAttempts, long timeWindowSeconds);

    /**
     * Obtient les seuils de détection actuels.
     * 
     * @return un tableau [maxAttempts, timeWindowSeconds]
     */
    long[] getDetectionThresholds();
}
