package com.abdatytch.backend.entity;

import com.abdatytch.backend.enums.VerificationCodeType;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

/**
 * Entité représentant un code de validation.
 * Utilisée pour la vérification par email (enregistrement, connexion, réinitialisation mot de passe).
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, status).
 */
@Table("verification_codes")
public class VerificationCode extends BaseEntity {

    /**
     * Code de validation à 6 chiffres.
     */
    private String code;

    /**
     * Adresse email de l'utilisateur.
     */
    private String email;

    /**
     * Type de code de validation (REGISTRATION, LOGIN, PASSWORD_RESET, etc.).
     */
    private VerificationCodeType type;

    /**
     * Date et heure d'expiration du code.
     */
    private LocalDateTime expiresAt;

    /**
     * Indique si le code a été utilisé.
     */
    private boolean used;

    public VerificationCode() {}

    public VerificationCode(String code, String email, VerificationCodeType type, LocalDateTime expiresAt) {
        this.code = code;
        this.email = email;
        this.type = type;
        this.expiresAt = expiresAt;
        this.used = false;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public VerificationCodeType getType() {
        return type;
    }

    public void setType(VerificationCodeType type) {
        this.type = type;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    /**
     * Vérifie si le code est expiré.
     * 
     * @return true si le code est expiré, false sinon
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
