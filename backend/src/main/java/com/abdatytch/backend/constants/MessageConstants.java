package com.abdatytch.backend.constants;

/**
 * Constantes pour les messages d'erreur et de succès.
 * Centralise tous les textes brutes utilisés dans l'application.
 */
public class MessageConstants {

    private MessageConstants() {}

    // Messages d'erreur utilisateur
    public static final String USER_NOT_FOUND = "Utilisateur non trouvé";
    public static final String USER_ALREADY_EXISTS = "Utilisateur déjà existant";
    public static final String USERNAME_ALREADY_EXISTS = "Nom d'utilisateur déjà existant";
    public static final String EMAIL_ALREADY_EXISTS = "Adresse email déjà existante";
    public static final String PHONE_NUMBER_ALREADY_EXISTS = "Numéro de téléphone déjà existant";
    public static final String USER_CREATED_SUCCESSFULLY = "Utilisateur créé avec succès";
    public static final String USER_UPDATED_SUCCESSFULLY = "Utilisateur mis à jour avec succès";
    public static final String USER_DELETED_SUCCESSFULLY = "Utilisateur supprimé avec succès";
    public static final String USER_ACTIVATED_SUCCESSFULLY = "Utilisateur activé avec succès";
    public static final String USER_DEACTIVATED_SUCCESSFULLY = "Utilisateur désactivé avec succès";
    public static final String USER_BANNED_SUCCESSFULLY = "Utilisateur banni avec succès";
    public static final String USER_UNBANNED_SUCCESSFULLY = "Utilisateur débanni avec succès";
    public static final String USER_BLOCKED_SUCCESSFULLY = "Utilisateur bloqué avec succès";
    public static final String USER_UNBLOCKED_SUCCESSFULLY = "Utilisateur débloqué avec succès";

    // Messages de validation
    public static final String USERNAME_REQUIRED = "Le nom d'utilisateur est obligatoire";
    public static final String EMAIL_REQUIRED = "L'adresse email est obligatoire";
    public static final String EMAIL_INVALID = "L'adresse email n'est pas valide";
    public static final String PASSWORD_REQUIRED = "Le mot de passe est obligatoire";
    public static final String FIRST_NAME_REQUIRED = "Le prénom est obligatoire";
    public static final String LAST_NAME_REQUIRED = "Le nom est obligatoire";
    public static final String PHONE_NUMBER_REQUIRED = "Le numéro de téléphone est obligatoire";

    // Messages de sécurité
    public static final String UNAUTHORIZED_ACCESS = "Accès non autorisé";
    public static final String FORBIDDEN_ACCESS = "Accès interdit";
    public static final String INVALID_CREDENTIALS = "Identifiants invalides";
    public static final String TOO_MANY_LOGIN_ATTEMPTS = "Trop de tentatives de connexion. Réessayez plus tard.";
    public static final String TOKEN_EXPIRED = "Token expiré";
    public static final String TOKEN_INVALID = "Token invalide";

    // Messages de service
    public static final String SERVICE_TEMPORARILY_UNAVAILABLE = "Service temporairement indisponible";
    public static final String INTERNAL_SERVER_ERROR = "Erreur interne du serveur";
    public static final String BAD_REQUEST = "Requête invalide";
    public static final String RESOURCE_NOT_FOUND = "Ressource non trouvée";
    public static final String CONFLICT = "Conflit de données";

    // Messages de statistiques
    public static final String TOTAL_USERS = "Total utilisateurs";
    public static final String TOTAL_ACTIVE_USERS = "Total utilisateurs actifs";
    public static final String TOTAL_INACTIVE_USERS = "Total utilisateurs inactifs";
    public static final String TOTAL_BANNED_USERS = "Total utilisateurs bannis";
    public static final String TOTAL_BLOCKED_USERS = "Total utilisateurs bloqués";

    // Messages d'authentification
    public static final String REGISTRATION_SUCCESSFUL = "Inscription réussie. Un code de validation a été envoyé à votre email.";
    public static final String LOGIN_SUCCESSFUL = "Connexion réussie";
    public static final String LOGOUT_SUCCESSFUL = "Déconnexion réussie";
    public static final String VERIFICATION_CODE_SENT = "Code de validation envoyé à votre email";
    public static final String VERIFICATION_CODE_INVALID = "Code de validation invalide ou expiré";
    public static final String VERIFICATION_CODE_VALID = "Code de validation valide";
    public static final String PASSWORD_RESET_CODE_SENT = "Code de réinitialisation envoyé à votre email";
    public static final String PASSWORD_RESET_SUCCESSFUL = "Mot de passe réinitialisé avec succès";
    public static final String PASSWORD_TOO_WEAK = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial";
    public static final String PASSWORD_MISMATCH = "Les mots de passe ne correspondent pas";
    public static final String NAME_TOO_SHORT = "Le nom doit contenir au moins 3 caractères";
    public static final String FIRST_NAME_TOO_SHORT = "Le prénom doit contenir au moins 3 caractères";
    public static final String REFRESH_TOKEN_SUCCESSFUL = "Token rafraîchi avec succès";
    public static final String REFRESH_TOKEN_INVALID = "Token de rafraîchissement invalide ou expiré";
    public static final String ACCOUNT_NOT_VERIFIED = "Compte non vérifié";
    public static final String ACCOUNT_DEACTIVATED = "Compte désactivé. Veuillez contacter l'administrateur.";
    public static final String ACCOUNT_ALREADY_VERIFIED = "Compte déjà vérifié";
    public static final String EMAIL_SEND_FAILED = "Échec de l'envoi de l'email";
    public static final String AUTH_ME_SUCCESS = "Informations d'authentification récupérées avec succès";
    public static final String AUTH_ME_FAILED = "Échec de la récupération des informations d'authentification";
}
