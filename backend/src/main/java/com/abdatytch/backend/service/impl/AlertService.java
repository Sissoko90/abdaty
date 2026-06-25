package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.service.IAlertService;
import com.abdatytch.backend.service.IEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Implémentation du service pour les alertes.
 * Envoie des alertes par email, SMS et Slack.
 */
@Service
public class AlertService implements IAlertService {

    private static final Logger logger = LoggerFactory.getLogger(AlertService.class);

    private final IEmailService emailService;
    private final WebClient webClient;

    @Autowired
    public AlertService(IEmailService emailService) {
        this.emailService = emailService;
        this.webClient = WebClient.builder().build();
    }

    @Override
    public Mono<Void> sendEmailAlert(String recipients, String subject, String message) {
        logger.info("Envoi d'alerte par email à: {}", recipients);
        
        String[] recipientArray = recipients.split(",");
        StringBuilder emailContent = new StringBuilder();
        emailContent.append("<h1>Alerte Système</h1>");
        emailContent.append("<p>").append(message).append("</p>");
        emailContent.append("<p><em>Ceci est une alerte automatique. Ne répondez pas à cet email.</em></p>");
        
        return Mono.fromRunnable(() -> {
            for (String recipient : recipientArray) {
                try {
                    emailService.sendVerificationEmail(recipient.trim(), subject, emailContent.toString()).subscribe();
                } catch (Exception e) {
                    logger.error("Erreur lors de l'envoi d'email à: {}", recipient, e);
                }
            }
        }).then();
    }

    @Override
    public Mono<Void> sendSMSAlert(String recipients, String message) {
        logger.info("Envoi d'alerte par SMS à: {}", recipients);
        
        // Intégration avec un fournisseur SMS (Twilio, AWS SNS, etc.)
        // Pour l'instant, nous simulons l'envoi
        return Mono.fromRunnable(() -> {
            String[] recipientArray = recipients.split(",");
            for (String recipient : recipientArray) {
                logger.info("Simulation d'envoi SMS à {}: {}", recipient.trim(), message);
                // TODO: Intégrer avec un vrai fournisseur SMS
            }
        }).then();
    }

    @Override
    public Mono<Void> sendSlackAlert(String webhookUrl, String message) {
        logger.info("Envoi d'alerte par Slack");
        
        // Intégration avec Slack webhook
        return webClient.post()
            .uri(webhookUrl)
            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            .bodyValue("{\"text\":\"" + message + "\"}")
            .retrieve()
            .bodyToMono(String.class)
            .doOnSuccess(response -> logger.info("Alerte Slack envoyée avec succès"))
            .doOnError(e -> logger.error("Erreur lors de l'envoi de l'alerte Slack", e))
            .then();
    }

    @Override
    public Mono<Void> sendAlert(String channels, String recipients, String subject, String message) {
        logger.info("Envoi d'alerte par canaux: {}", channels);
        
        String[] channelArray = channels.split(",");
        return Mono.fromRunnable(() -> {
            for (String channel : channelArray) {
                String trimmedChannel = channel.trim().toUpperCase();
                switch (trimmedChannel) {
                    case "EMAIL":
                        sendEmailAlert(recipients, subject, message).subscribe();
                        break;
                    case "SMS":
                        sendSMSAlert(recipients, message).subscribe();
                        break;
                    case "SLACK":
                        sendSlackAlert(recipients, message).subscribe();
                        break;
                    default:
                        logger.warn("Canal d'alerte inconnu: {}", trimmedChannel);
                }
            }
        }).then();
    }
}
