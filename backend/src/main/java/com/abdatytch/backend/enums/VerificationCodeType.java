package com.abdatytch.backend.enums;

/**
 * Enumération des types de codes de validation.
 * Définit les différents scénarios d'utilisation des codes de validation.
 */
public enum VerificationCodeType {
    
    /**
     * Code de validation pour l'enregistrement d'un nouvel utilisateur.
     */
    REGISTRATION,
    
    /**
     * Code de validation pour la connexion.
     */
    LOGIN,
    
    /**
     * Code de validation pour la réinitialisation du mot de passe.
     */
    PASSWORD_RESET,
    
    /**
     * Code de validation pour la modification de l'email.
     */
    EMAIL_CHANGE,
    
    /**
     * Code de validation pour la suppression de compte.
     */
    ACCOUNT_DELETION
}
