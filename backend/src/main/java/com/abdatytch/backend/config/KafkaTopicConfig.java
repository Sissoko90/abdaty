package com.abdatytch.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Déclare les topics Kafka de l'application. Le {@code KafkaAdmin} auto-configuré
 * (à partir de spring.kafka.bootstrap-servers) crée automatiquement les topics
 * exposés sous forme de bean {@link NewTopic} au démarrage.
 */
@Configuration
public class KafkaTopicConfig {

    @Value("${app.notifications.kafka.topic:admin-notifications}")
    private String notificationsTopic;

    @Bean
    public NewTopic adminNotificationsTopic() {
        // 1 partition / réplication 1 : suffisant pour un bus de notifications mono-broker.
        return TopicBuilder.name(notificationsTopic).partitions(1).replicas(1).build();
    }
}
