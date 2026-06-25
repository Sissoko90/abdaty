package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

/**
 * Entité représentant une clé API appartenant à un utilisateur.
 * Hérite de BaseEntity (id, createdAt, updatedAt, version, status).
 *
 * Sécurité : la clé en clair n'est JAMAIS stockée. On conserve uniquement :
 *  - {@code keyHash} : empreinte SHA-256 de la clé (pour une future vérification) ;
 *  - {@code keyPrefix} : début de la clé (ex: "abdaty_live_1a2b") pour un
 *    affichage masqué dans la liste.
 * La clé complète n'est renvoyée qu'UNE seule fois, au moment de la création.
 *
 * Le statut éditorial est porté par {@code keyStatus} ("active"/"revoked") afin
 * de ne pas entrer en conflit avec {@code status} de BaseEntity.
 */
@Table("api_keys")
public class ApiKey extends BaseEntity {

    /** Identifiant de l'utilisateur propriétaire (référence users.id). */
    private String userId;

    /** Empreinte SHA-256 (hex) de la clé en clair. */
    private String keyHash;

    /** Préfixe de la clé conservé pour l'affichage masqué. */
    private String keyPrefix;

    /** Nom convivial de la clé (ex: "Production Key"). */
    private String name;

    /** Permissions accordées (liste sérialisée séparée par des virgules). */
    private String permissions;

    /** Limite de débit (requêtes par heure). */
    private Integer rateLimit;

    /** Statut : "active" ou "revoked". */
    private String keyStatus;

    /** Date de dernière utilisation. */
    private LocalDateTime lastUsedAt;

    /** Date d'expiration éventuelle. */
    private LocalDateTime expiresAt;

    public ApiKey() {
        this.keyStatus = "active";
        this.rateLimit = 1000;
    }

    // Getters et Setters

    public String getUserId() {return userId;}

    public void setUserId(String userId) {this.userId = userId;}

    public String getKeyHash() {return keyHash;}

    public void setKeyHash(String keyHash) {this.keyHash = keyHash;}

    public String getKeyPrefix() {return keyPrefix;}

    public void setKeyPrefix(String keyPrefix) {this.keyPrefix = keyPrefix;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getPermissions() {return permissions;}

    public void setPermissions(String permissions) {this.permissions = permissions;}

    public Integer getRateLimit() {return rateLimit;}

    public void setRateLimit(Integer rateLimit) {this.rateLimit = rateLimit;}

    public String getKeyStatus() {return keyStatus;}

    public void setKeyStatus(String keyStatus) {this.keyStatus = keyStatus;}

    public LocalDateTime getLastUsedAt() {return lastUsedAt;}

    public void setLastUsedAt(LocalDateTime lastUsedAt) {this.lastUsedAt = lastUsedAt;}

    public LocalDateTime getExpiresAt() {return expiresAt;}

    public void setExpiresAt(LocalDateTime expiresAt) {this.expiresAt = expiresAt;}
}
