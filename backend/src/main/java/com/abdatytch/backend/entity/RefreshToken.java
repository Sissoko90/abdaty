package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

/**
 * Entité représentant un token de rafraîchissement.
 * Utilisée pour rafraîchir automatiquement la session utilisateur.
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, status).
 */
@Table("refresh_tokens")
public class RefreshToken extends BaseEntity {

    /**
     * Token de rafraîchissement.
     */
    private String token;

    /**
     * Identifiant de l'utilisateur associé.
     */
    private String userId;

    /**
     * Date et heure d'expiration du token.
     */
    private LocalDateTime expiresAt;

    /**
     * Indique si le token est révoqué.
     */
    private boolean revoked;

    public RefreshToken() {}

    public RefreshToken(String token, String userId, LocalDateTime expiresAt) {
        this.token = token;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.revoked = false;
    }

    public String getToken() {return token;}

    public void setToken(String token) {this.token = token;}

    public String getUserId() {return userId;}

    public void setUserId(String userId) {this.userId = userId;}

    public LocalDateTime getExpiresAt() {return expiresAt;}

    public void setExpiresAt(LocalDateTime expiresAt) {this.expiresAt = expiresAt;}

    public boolean isRevoked() {return revoked;}

    public void setRevoked(boolean revoked) {this.revoked = revoked;}

    /**
     * Vérifie si le token est expiré.
     * 
     * @return true si le token est expiré, false sinon
     */
    public boolean isExpired() {return LocalDateTime.now().isAfter(expiresAt);}
}
