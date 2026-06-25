package com.abdatytch.backend.service;

import reactor.core.publisher.Mono;

/**
 * Interface du service pour la gestion des tentatives de connexion via Redis.
 * Définit les méthodes pour compter les échecs de connexion par IP.
 */
public interface IRedisLoginAttemptService {

    /**
     * Incrémente le compteur de tentatives de connexion pour une IP.
     * 
     * @param ipAddress l'adresse IP
     * @return le nombre de tentatives
     */
    Mono<Long> incrementLoginAttempt(String ipAddress);

    /**
     * Obtient le nombre de tentatives de connexion pour une IP.
     * 
     * @param ipAddress l'adresse IP
     * @return le nombre de tentatives
     */
    Mono<Long> getLoginAttempts(String ipAddress);

    /**
     * Réinitialise le compteur de tentatives pour une IP.
     * 
     * @param ipAddress l'adresse IP
     * @return un Mono vide
     */
    Mono<Void> resetLoginAttempts(String ipAddress);

    /**
     * Vérifie si une IP doit être bloquée (dépasse le seuil).
     * 
     * @param ipAddress l'adresse IP
     * @param threshold le seuil
     * @return true si l'IP doit être bloquée
     */
    Mono<Boolean> shouldBlockIP(String ipAddress, long threshold);

    /**
     * Définit une expiration pour le compteur d'une IP.
     * 
     * @param ipAddress l'adresse IP
     * @param seconds durée en secondes
     * @return un Mono vide
     */
    Mono<Void> setExpiration(String ipAddress, long seconds);
}
