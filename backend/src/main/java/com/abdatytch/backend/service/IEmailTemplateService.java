package com.abdatytch.backend.service;

/**
 * Interface du service de templates pour les emails.
 * Définit les méthodes pour générer des emails HTML à partir de templates.
 */
public interface IEmailTemplateService {

    /**
     * Génère le template HTML pour un email de validation d'enregistrement.
     * 
     * @param code le code de validation
     * @param email l'adresse email de l'utilisateur
     * @param firstName le prénom de l'utilisateur
     * @return le contenu HTML de l'email
     */
    String generateRegistrationTemplate(String code, String email, String firstName);

    /**
     * Génère le template HTML pour un email de code de connexion.
     * 
     * @param code le code de connexion
     * @param email l'adresse email de l'utilisateur
     * @param firstName le prénom de l'utilisateur
     * @return le contenu HTML de l'email
     */
    String generateLoginTemplate(String code, String email, String firstName);

    /**
     * Génère le template HTML pour un email de réinitialisation de mot de passe.
     * 
     * @param code le code de réinitialisation
     * @param email l'adresse email de l'utilisateur
     * @param firstName le prénom de l'utilisateur
     * @return le contenu HTML de l'email
     */
    String generatePasswordResetTemplate(String code, String email, String firstName);
}
