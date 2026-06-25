package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.service.IEmailTemplateService;
import org.springframework.stereotype.Service;

/**
 * Implémentation du service de templates pour les emails.
 * Génère des emails HTML modernes et professionnels.
 */
@Service
public class EmailTemplateService implements IEmailTemplateService {

    private static final String COMPANY_NAME = "Abdaty Technologie";
    private static final String COMPANY_URL = "https://abdatytechnologie.com";
    private static final String SUPPORT_EMAIL = "support@abdatytechnologie.com";

    @Override
    public String generateRegistrationTemplate(String code, String email, String firstName) {
        return buildTemplate(
            email,
            "Bienvenue chez " + COMPANY_NAME,
            "Activez votre compte",
            "Bonjour " + firstName + ",",
            "Merci de vous être inscrit sur " + COMPANY_NAME + ". Pour activer votre compte, veuillez utiliser le code de validation ci-dessous:",
            code,
            "Ce code expire dans 15 minutes."
        );
    }

    @Override
    public String generateLoginTemplate(String code, String email, String firstName) {
        return buildTemplate(
            email,
            "Code de connexion - " + COMPANY_NAME,
            "Connectez-vous à votre compte",
            "Bonjour " + firstName + ",",
            "Voici votre code de connexion sécurisé pour accéder à votre compte " + COMPANY_NAME + ":",
            code,
            "Ce code expire dans 15 minutes."
        );
    }

    @Override
    public String generatePasswordResetTemplate(String code, String email, String firstName) {
        return buildTemplate(
            email,
            "Réinitialisation du mot de passe - " + COMPANY_NAME,
            "Réinitialisez votre mot de passe",
            "Bonjour " + firstName + ",",
            "Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code ci-dessous pour procéder:",
            code,
            "Ce code expire dans 15 minutes."
        );
    }

    private String buildTemplate(String email, String subject, String actionTitle, String greeting, String message, String code, String expiration) {
        return "<!DOCTYPE html>" +
            "<html lang='fr'>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<title>" + subject + "</title>" +
            "<style>" +
            "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }" +
            ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }" +
            ".header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }" +
            ".logo { max-width: 120px; margin-bottom: 15px; }" +
            ".content { padding: 40px 30px; }" +
            ".greeting { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; }" +
            ".message { font-size: 15px; color: #666; margin-bottom: 25px; }" +
            ".code-box { background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }" +
            ".code { font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 5px; margin: 0; }" +
            ".expiration { font-size: 13px; color: #999; margin-top: 10px; }" +
            ".footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #e9ecef; }" +
            ".footer a { color: #667eea; text-decoration: none; }" +
            ".footer a:hover { text-decoration: underline; }" +
            ".button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; margin-top: 20px; }" +
            ".warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 14px; color: #856404; }" +
            "@media only screen and (max-width: 600px) { .container { margin: 10px; } .content { padding: 30px 20px; } .code { font-size: 28px; } }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "<div class='header'>" +
            "<h1>" + actionTitle + "</h1>" +
            "</div>" +
            "<div class='content'>" +
            "<p class='greeting'>" + greeting + "</p>" +
            "<p class='message'>" + message + "</p>" +
            "<div class='code-box'>" +
            "<p class='code'>" + code + "</p>" +
            "<p class='expiration'>" + expiration + "</p>" +
            "</div>" +
            "<div class='warning'>" +
            "<strong>⚠️ Important:</strong> Si vous n'avez pas demandé ce code, ignorez cet email et ne le partagez avec personne." +
            "</div>" +
            "</div>" +
            "<div class='footer'>" +
            "<p>&copy; 2024 " + COMPANY_NAME + ". Tous droits réservés.</p>" +
            "<p>Ce message a été envoyé à <a href='mailto:" + email + "'>" + email + "</a></p>" +
            "<p>Adresse: <a href='" + COMPANY_URL + "'>" + COMPANY_URL + "</a></p>" +
            "<p>Besoin d'aide? Contactez-nous à <a href='mailto:" + SUPPORT_EMAIL + "'>" + SUPPORT_EMAIL + "</a></p>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>";
    }
}
