package com.abdatytch.backend.service;

/**
 * Interface du service JWT.
 * Définit les méthodes pour la génération et validation des tokens JWT.
 */
public interface IJwtService {

    /**
     * Génère un token d'accès pour un utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param email l'email de l'utilisateur
     * @param role le rôle de l'utilisateur
     * @return le token d'accès généré
     */
    String generateAccessToken(String userId, String email, String role);

    /**
     * Génère un token de rafraîchissement pour un utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param email l'email de l'utilisateur
     * @return le token de rafraîchissement généré
     */
    String generateRefreshToken(String userId, String email);

    /**
     * Extrait l'email d'un token.
     * 
     * @param token le token JWT
     * @return l'email extrait du token
     */
    String extractEmail(String token);

    /**
     * Extrait l'ID utilisateur d'un token.
     * 
     * @param token le token JWT
     * @return l'ID utilisateur extrait du token
     */
    String extractUserId(String token);

    /**
     * Extrait le rôle d'un token.
     * 
     * @param token le token JWT
     * @return le rôle extrait du token
     */
    String extractRole(String token);

    /**
     * Extrait le type d'un token ("access" ou "refresh").
     *
     * @param token le token JWT
     * @return le type du token, ou null si absent
     */
    String extractTokenType(String token);

    /**
     * Valide un token.
     * 
     * @param token le token JWT
     * @return true si le token est valide, false sinon
     */
    boolean validateToken(String token);

    /**
     * Vérifie si un token est expiré.
     * 
     * @param token le token JWT
     * @return true si le token est expiré, false sinon
     */
    boolean isTokenExpired(String token);
}
