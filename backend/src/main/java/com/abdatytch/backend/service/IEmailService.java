package com.abdatytch.backend.service;

import com.abdatytch.backend.enums.VerificationCodeType;
import org.springframework.core.io.Resource;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Interface du service d'envoi d'emails.
 * Définit les méthodes pour l'envoi d'emails de validation.
 */
public interface IEmailService {

    /**
     * Envoie un email HTML avec des en-têtes additionnels (ex: List-Unsubscribe).
     *
     * @param to l'adresse email du destinataire
     * @param subject le sujet
     * @param htmlContent le contenu HTML
     * @param headers en-têtes additionnels (peut être null/vide)
     * @param attachments pièces jointes (nom d'affichage -> ressource), peut être null
     * @param inlineImages images inline (contentId -> ressource) référencées via cid:, peut être null
     * @return un Mono vide indiquant le succès
     */
    Mono<Void> sendHtmlEmail(String to, String subject, String htmlContent,
                             Map<String, String> headers, Map<String, Resource> attachments,
                             Map<String, Resource> inlineImages);

    /**
     * Envoie un code de validation par email.
     * 
     * @param to l'adresse email du destinataire
     * @param subject le sujet de l'email
     * @param content le contenu de l'email
     * @return un Mono vide indiquant le succès
     */
    Mono<Void> sendVerificationEmail(String to, String subject, String content);

    /**
     * Envoie un code de validation par email avec template HTML.
     * 
     * @param to l'adresse email du destinataire
     * @param code le code de validation
     * @param type le type de code
     * @param firstName le prénom de l'utilisateur
     * @return un Mono vide indiquant le succès
     */
    Mono<Void> sendVerificationEmailWithTemplate(String to, String code, VerificationCodeType type, String firstName);
}
