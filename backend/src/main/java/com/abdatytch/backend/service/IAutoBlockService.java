package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.SuspiciousIPDTO;
import reactor.core.publisher.Mono;

/**
 * Interface du service pour l'auto-blocage des IPs.
 * Définit les méthodes pour bloquer automatiquement les IPs dépassant un seuil.
 */
public interface IAutoBlockService {

    /**
     * Vérifie et bloque automatiquement les IPs dépassant le seuil.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono de SuspiciousIPDTO
     */
    Mono<SuspiciousIPDTO> checkAndAutoBlock(String ipAddress);

    /**
     * Définit le seuil d'auto-blocage.
     * 
     * @param threshold le seuil de tentatives
     */
    void setAutoBlockThreshold(long threshold);

    /**
     * Obtient le seuil d'auto-blocage actuel.
     * 
     * @return le seuil
     */
    long getAutoBlockThreshold();

    /**
     * Active/désactive l'auto-blocage.
     * 
     * @param enabled true pour activer, false pour désactiver
     */
    void setAutoBlockEnabled(boolean enabled);

    /**
     * Vérifie si l'auto-blocage est activé.
     * 
     * @return true si activé
     */
    boolean isAutoBlockEnabled();
}
