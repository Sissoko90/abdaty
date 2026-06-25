package com.abdatytch.backend.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Publie les {@link NotificationEvent} sur le topic Kafka des notifications admin.
 *
 * BEST-EFFORT : la publication ne doit JAMAIS faire échouer l'opération métier
 * appelante (ex. l'enregistrement d'un message de contact). Toute erreur Kafka
 * est journalisée puis ignorée.
 */
@Component
public class NotificationEventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(NotificationEventPublisher.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.notifications.kafka.topic:admin-notifications}")
    private String topic;

    public NotificationEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    /** Publie un événement de notification (non bloquant, tolérant aux pannes). */
    public void publish(NotificationEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topic, event.type(), payload)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        logger.warn("Publication Kafka de la notification échouée ({}): {}",
                            event.type(), ex.getMessage());
                    }
                });
        } catch (Exception e) {
            logger.warn("Sérialisation/publication de la notification impossible ({}): {}",
                event.type(), e.getMessage());
        }
    }
}
