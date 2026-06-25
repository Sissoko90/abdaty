package com.abdatytch.backend.enums;

/**
 * Enumération des statuts possibles pour un utilisateur.
 * Définit les différents états dans lesquels un utilisateur peut se trouver.
 */
public enum UserStatus {
    /**
     * Utilisateur actif, peut accéder à l'application.
     */
    ACTIVE,
    
    /**
     * Utilisateur inactif : compte créé mais email non vérifié.
     */
    INACTIVE,

    /**
     * Compte désactivé par un administrateur (distinct de « non vérifié »).
     */
    DEACTIVATED,

    /**
     * Utilisateur banni, accès refusé pour violation des règles.
     */
    BANNED,
    
    /**
     * Utilisateur bloqué, accès temporairement restreint.
     */
    BLOCKED
}
