package com.abdatytch.backend.service;

import reactor.core.publisher.Mono;

/**
 * Interface du service pour les alertes.
 * Définit les méthodes pour envoyer des alertes par différents canaux.
 */
public interface IAlertService {

    /**
     * Envoie une alerte par email.
     * 
     * @param recipients les destinataires (séparés par des virgules)
     * @param subject le sujet de l'alerte
     * @param message le message de l'alerte
     * @return un Mono vide
     */
    Mono<Void> sendEmailAlert(String recipients, String subject, String message);

    /**
     * Envoie une alerte par SMS.
     * 
     * @param recipients les numéros de téléphone (séparés par des virgules)
     * @param message le message de l'alerte
     * @return un Mono vide
     */
    Mono<Void> sendSMSAlert(String recipients, String message);

    /**
     * Envoie une alerte par Slack.
     * 
     * @param webhookUrl l'URL du webhook Slack
     * @param message le message de l'alerte
     * @return un Mono vide
     */
    Mono<Void> sendSlackAlert(String webhookUrl, String message);

    /**
     * Envoie une alerte par tous les canaux configurés.
     * 
     * @param channels les canaux (EMAIL, SMS, SLACK)
     * @param recipients les destinataires
     * @param subject le sujet (pour email)
     * @param message le message de l'alerte
     * @return un Mono vide
     */
    Mono<Void> sendAlert(String channels, String recipients, String subject, String message);
}
