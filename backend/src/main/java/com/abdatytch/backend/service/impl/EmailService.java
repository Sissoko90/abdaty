package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.enums.VerificationCodeType;
import com.abdatytch.backend.service.IEmailService;
import com.abdatytch.backend.service.IEmailTemplateService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * Service pour l'envoi d'emails.
 * Utilise JavaMailSender pour envoyer les codes de validation par email.
 * Implémente le caching, la résilience et les métriques.
 */
@Service
public class EmailService implements IEmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final IEmailTemplateService emailTemplateService;
    private final MeterRegistry meterRegistry;
    private final Timer emailSendTimer;

    @Value("${spring.mail.from:}")
    private String fromEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender, IEmailTemplateService emailTemplateService, MeterRegistry meterRegistry) {
        this.mailSender = mailSender;
        this.emailTemplateService = emailTemplateService;
        this.meterRegistry = meterRegistry;
        this.emailSendTimer = meterRegistry.timer("email.send.time");
    }

    /**
     * Envoie un code de validation par email.
     * 
     * @param to l'adresse email du destinataire
     * @param subject le sujet de l'email
     * @param content le contenu de l'email
     * @return un Mono vide indiquant le succès
     */
    @CircuitBreaker(name = "emailService", fallbackMethod = "sendEmailFallback")
    @Retry(name = "emailService")
    public Mono<Void> sendVerificationEmail(String to, String subject, String content) {
        logger.info("Envoi d'email à: {}", to);
        
        return Mono.fromRunnable(() -> {
            Timer.Sample sample = Timer.start(meterRegistry);
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(content, true);
                
                mailSender.send(message);
                sample.stop(emailSendTimer);
                logger.info("Email envoyé avec succès à: {}", to);
            } catch (Exception e) {
                sample.stop(emailSendTimer);
                logger.error("Erreur lors de l'envoi de l'email à: {}", to, e);
                throw new RuntimeException(MessageConstants.EMAIL_SEND_FAILED, e);
            }
        });
    }

    @Override
    public Mono<Void> sendHtmlEmail(String to, String subject, String htmlContent,
                                    java.util.Map<String, String> headers,
                                    java.util.Map<String, org.springframework.core.io.Resource> attachments,
                                    java.util.Map<String, org.springframework.core.io.Resource> inlineImages) {
        return Mono.fromRunnable(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                // Images inline (cid:) — DOIVENT être ajoutées après setText.
                if (inlineImages != null) {
                    for (java.util.Map.Entry<String, org.springframework.core.io.Resource> img : inlineImages.entrySet()) {
                        helper.addInline(img.getKey(), img.getValue());
                    }
                }
                // Pièces jointes (PDF, CSV, …).
                if (attachments != null) {
                    for (java.util.Map.Entry<String, org.springframework.core.io.Resource> a : attachments.entrySet()) {
                        helper.addAttachment(a.getKey(), a.getValue());
                    }
                }
                // En-têtes additionnels (ex: List-Unsubscribe -> lien natif Gmail).
                if (headers != null) {
                    for (java.util.Map.Entry<String, String> h : headers.entrySet()) {
                        message.addHeader(h.getKey(), h.getValue());
                    }
                }
                mailSender.send(message);
                logger.info("Email HTML envoyé avec succès à: {}", to);
            } catch (Exception e) {
                logger.error("Erreur lors de l'envoi de l'email HTML à: {}", to, e);
                throw new RuntimeException(MessageConstants.EMAIL_SEND_FAILED, e);
            }
        })
        // Envoi SMTP bloquant : on l'exécute sur un ordonnanceur dédié aux I/O
        // pour ne jamais bloquer la boucle d'événements réactive.
        .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
        .then();
    }

    /**
     * Envoie un code de validation par email avec template HTML.
     * 
     * @param to l'adresse email du destinataire
     * @param code le code de validation
     * @param type le type de code
     * @param firstName le prénom de l'utilisateur
     * @return un Mono vide indiquant le succès
     */
    @CircuitBreaker(name = "emailService", fallbackMethod = "sendEmailFallback")
    @Retry(name = "emailService")
    public Mono<Void> sendVerificationEmailWithTemplate(String to, String code, VerificationCodeType type, String firstName) {
        logger.info("Envoi d'email avec template à: {}", to);
        
        return Mono.fromRunnable(() -> {
            Timer.Sample sample = Timer.start(meterRegistry);
            try {
                String subject;
                String htmlContent;
                
                switch (type) {
                    case REGISTRATION:
                        subject = "Bienvenue chez Abdaty Technologie";
                        htmlContent = emailTemplateService.generateRegistrationTemplate(code, to, firstName);
                        break;
                    case LOGIN:
                        subject = "Code de connexion - Abdaty Technologie";
                        htmlContent = emailTemplateService.generateLoginTemplate(code, to, firstName);
                        break;
                    case PASSWORD_RESET:
                        subject = "Réinitialisation du mot de passe - Abdaty Technologie";
                        htmlContent = emailTemplateService.generatePasswordResetTemplate(code, to, firstName);
                        break;
                    default:
                        subject = "Code de validation - Abdaty Technologie";
                        htmlContent = emailTemplateService.generateRegistrationTemplate(code, to, firstName);
                }
                
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                
                mailSender.send(message);
                sample.stop(emailSendTimer);
                logger.info("Email avec template envoyé avec succès à: {}", to);
            } catch (Exception e) {
                sample.stop(emailSendTimer);
                logger.error("Erreur lors de l'envoi de l'email avec template à: {}", to, e);
                throw new RuntimeException(MessageConstants.EMAIL_SEND_FAILED, e);
            }
        });
    }

    /**
     * Méthode de fallback en cas d'échec du circuit breaker.
     * 
     * @param to l'adresse email du destinataire
     * @param subject le sujet de l'email
     * @param content le contenu de l'email
     * @param exception l'exception survenue
     * @return un Mono vide
     */
    public Mono<Void> sendEmailFallback(String to, String subject, String content, Exception exception) {
        logger.error("Fallback: échec de l'envoi d'email à: {}, erreur: {}", to, exception.getMessage());
        return Mono.error(new RuntimeException(MessageConstants.EMAIL_SEND_FAILED));
    }
}
