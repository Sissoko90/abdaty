package com.abdatytch.backend.event;

import com.abdatytch.backend.entity.Notification;
import com.abdatytch.backend.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consomme les {@link NotificationEvent} du topic Kafka et les achemine vers :
 *  1. la DIFFUSION temps réel WebSocket (un groupe Kafka UNIQUE par instance →
 *     chaque réplica reçoit l'événement et notifie ses propres clients) ;
 *  2. la PERSISTANCE pour l'historique (un groupe Kafka PARTAGÉ → l'événement
 *     n'est enregistré qu'UNE fois, pas de doublon en multi-réplicas).
 */
@Component
public class NotificationKafkaConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationKafkaConsumer.class);

    /** Destinataire sentinelle des notifications « broadcast » admin (historique). */
    public static final String ADMIN_RECIPIENT = "__admin__";

    private final NotificationBroadcaster broadcaster;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public NotificationKafkaConsumer(NotificationBroadcaster broadcaster,
                                     NotificationRepository notificationRepository,
                                     ObjectMapper objectMapper) {
        this.broadcaster = broadcaster;
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Diffusion temps réel — groupe UNIQUE par instance (random.uuid) pour que
     * TOUS les réplicas reçoivent l'événement et notifient leurs clients WS.
     */
    @KafkaListener(
        topics = "${app.notifications.kafka.topic:admin-notifications}",
        groupId = "admin-notif-broadcast-${random.uuid}",
        // auto.offset.reset=latest : à chaque (re)démarrage, on ne pousse que les
        // NOUVEAUX événements en temps réel — pas de rejeu de tout l'historique.
        properties = "auto.offset.reset:latest")
    public void broadcast(String payload) {
        parse(payload).ifPresent(broadcaster::emit);
    }

    /**
     * Persistance pour l'historique — groupe PARTAGÉ (fixe) : une seule instance
     * enregistre chaque événement, évitant les doublons en base.
     */
    @KafkaListener(
        topics = "${app.notifications.kafka.topic:admin-notifications}",
        groupId = "admin-notif-persist")
    public void persist(String payload) {
        parse(payload).ifPresent(event -> {
            Notification n = new Notification();
            n.setUserId(ADMIN_RECIPIENT);
            n.setType(event.type());
            n.setTitle(event.title());
            n.setMessage(event.message());
            n.setLink(event.link());
            n.setIsRead(false);
            notificationRepository.save(n)
                .subscribe(saved -> {}, err ->
                    logger.warn("Persistance de la notification échouée: {}", err.getMessage()));
        });
    }

    private java.util.Optional<NotificationEvent> parse(String payload) {
        try {
            return java.util.Optional.of(objectMapper.readValue(payload, NotificationEvent.class));
        } catch (Exception e) {
            logger.warn("Notification Kafka illisible: {}", e.getMessage());
            return java.util.Optional.empty();
        }
    }
}
