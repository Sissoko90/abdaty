package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.request.ContactRequestDTO;
import com.abdatytch.backend.dto.response.ContactMessageDTO;
import com.abdatytch.backend.entity.ContactMessage;
import com.abdatytch.backend.event.NotificationEvent;
import com.abdatytch.backend.event.NotificationEventPublisher;
import com.abdatytch.backend.repository.ContactMessageRepository;
import com.abdatytch.backend.service.IEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service du formulaire de contact : enregistre les messages reçus et notifie
 * l'équipe par email (best-effort), + confirmation à l'expéditeur.
 */
@Service
public class ContactService {

    private static final Logger logger = LoggerFactory.getLogger(ContactService.class);

    private final ContactMessageRepository repository;
    private final IEmailService emailService;
    private final NotificationEventPublisher notificationPublisher;

    /** Adresse qui reçoit les notifications de contact :
     *  app.contact.notify-email → sinon ADMIN_EMAIL (.env) → sinon l'expéditeur SMTP. */
    @Value("${app.contact.notify-email:${ADMIN_EMAIL:${spring.mail.from:}}}")
    private String notifyEmail;

    public ContactService(ContactMessageRepository repository, IEmailService emailService,
                          NotificationEventPublisher notificationPublisher) {
        this.repository = repository;
        this.emailService = emailService;
        this.notificationPublisher = notificationPublisher;
    }

    /** Enregistre un message et déclenche les emails (sans bloquer la réponse). */
    public Mono<ContactMessageDTO> create(ContactRequestDTO dto, String ip) {
        ContactMessage m = new ContactMessage();
        m.setName(dto.getName());
        m.setEmail(dto.getEmail());
        m.setCompany(dto.getCompany());
        m.setPhone(dto.getPhone());
        m.setService(dto.getService());
        m.setMessage(dto.getMessage());
        m.setIpAddress(ip);
        return repository.save(m)
            .doOnSuccess(saved -> {
                sendEmails(saved).subscribe();
                // Notification push temps réel vers les panels admin (via Kafka → WS).
                notificationPublisher.publish(new NotificationEvent(
                    "CONTACT_MESSAGE",
                    "Nouveau message de contact",
                    saved.getName() + " a envoyé un message"
                        + (saved.getService() != null ? " (" + saved.getService() + ")" : ""),
                    "/admin/contacts",
                    System.currentTimeMillis()));
            })
            .map(this::toDTO);
    }

    /** Envoie la notification à l'équipe + l'accusé de réception à l'expéditeur. */
    private Mono<Void> sendEmails(ContactMessage m) {
        Mono<Void> notify = Mono.empty();
        if (notifyEmail != null && !notifyEmail.isBlank()) {
            String subject = "Nouveau message de contact — " + m.getName();
            notify = emailService.sendHtmlEmail(notifyEmail, subject, buildNotificationHtml(m), null, null, null)
                .onErrorResume(e -> {
                    logger.warn("Notification contact non envoyée : {}", e.getMessage());
                    return Mono.empty();
                });
        }
        Mono<Void> ack = emailService.sendHtmlEmail(m.getEmail(),
                "Nous avons bien reçu votre message", buildAckHtml(m), null, null, null)
            .onErrorResume(e -> {
                logger.warn("Accusé de réception contact non envoyé : {}", e.getMessage());
                return Mono.empty();
            });
        return notify.then(ack);
    }

    private String buildNotificationHtml(ContactMessage m) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>Nouveau message de contact</h2>");
        sb.append("<p><strong>Nom :</strong> ").append(esc(m.getName())).append("</p>");
        sb.append("<p><strong>Email :</strong> ").append(esc(m.getEmail())).append("</p>");
        if (m.getCompany() != null && !m.getCompany().isBlank())
            sb.append("<p><strong>Société :</strong> ").append(esc(m.getCompany())).append("</p>");
        if (m.getPhone() != null && !m.getPhone().isBlank())
            sb.append("<p><strong>Téléphone :</strong> ").append(esc(m.getPhone())).append("</p>");
        if (m.getService() != null && !m.getService().isBlank())
            sb.append("<p><strong>Service :</strong> ").append(esc(m.getService())).append("</p>");
        sb.append("<p><strong>Message :</strong></p><p style=\"white-space:pre-line\">")
          .append(esc(m.getMessage())).append("</p>");
        return sb.toString();
    }

    private String buildAckHtml(ContactMessage m) {
        return "<p>Bonjour " + esc(m.getName()) + ",</p>"
            + "<p>Merci de nous avoir contactés. Nous avons bien reçu votre message et notre équipe "
            + "vous répondra dans les meilleurs délais.</p>"
            + "<p>— L'équipe Abdaty Technologie</p>";
    }

    /** Échappement HTML minimal. */
    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    /* ========================= ADMIN ========================= */

    public Flux<ContactMessageDTO> list(int page, int size) {
        int safeSize = size <= 0 || size > 200 ? 50 : size;
        int safePage = Math.max(page, 0);
        return repository.findAllByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(safePage, safeSize))
            .map(this::toDTO);
    }

    public Mono<Long> count() {
        return repository.count();
    }

    public Mono<Long> unreadCount() {
        return repository.countByIsReadFalse();
    }

    public Mono<ContactMessageDTO> markRead(String id, boolean read) {
        return repository.findById(id)
            .flatMap(m -> {
                m.setIsRead(read);
                return repository.save(m);
            })
            .map(this::toDTO);
    }

    public Mono<Void> delete(String id) {
        return repository.deleteById(id);
    }

    private ContactMessageDTO toDTO(ContactMessage m) {
        ContactMessageDTO dto = new ContactMessageDTO();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setEmail(m.getEmail());
        dto.setCompany(m.getCompany());
        dto.setPhone(m.getPhone());
        dto.setService(m.getService());
        dto.setMessage(m.getMessage());
        dto.setIpAddress(m.getIpAddress());
        dto.setIsRead(m.getIsRead());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
