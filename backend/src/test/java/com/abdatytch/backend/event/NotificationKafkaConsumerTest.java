package com.abdatytch.backend.event;

import com.abdatytch.backend.entity.Notification;
import com.abdatytch.backend.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires du consumer Kafka des notifications : un payload valide est
 * diffusé (WebSocket) et persisté ; un payload invalide est ignoré sans crash.
 */
@ExtendWith(MockitoExtension.class)
class NotificationKafkaConsumerTest {

    @Mock NotificationBroadcaster broadcaster;
    @Mock NotificationRepository notificationRepository;

    NotificationKafkaConsumer consumer;
    final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        consumer = new NotificationKafkaConsumer(broadcaster, notificationRepository, objectMapper);
    }

    @Test
    void broadcast_validPayload_emitsEvent() {
        consumer.broadcast("{\"type\":\"CONTACT_MESSAGE\",\"title\":\"T\",\"message\":\"M\",\"link\":\"/x\",\"timestamp\":123}");

        verify(broadcaster).emit(argThat(e -> "CONTACT_MESSAGE".equals(e.type()) && "T".equals(e.title())));
    }

    @Test
    void broadcast_invalidPayload_isIgnored() {
        consumer.broadcast("not-json");

        verifyNoInteractions(broadcaster);
    }

    @Test
    void persist_validPayload_savesNotification() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(Mono.just(new Notification()));

        consumer.persist("{\"type\":\"ALERT\",\"title\":\"T\",\"message\":\"M\",\"link\":null,\"timestamp\":1}");

        verify(notificationRepository).save(any(Notification.class));
    }
}
