package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.entity.Notification;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.INotificationMapper;
import com.abdatytch.backend.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de NotificationService : le contrôle d'accès passe par
 * findByIdAndUserId — on ne peut agir que sur SES propres notifications.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock NotificationRepository notificationRepository;
    @Mock INotificationMapper notificationMapper;

    NotificationService service;

    @BeforeEach
    void setUp() {
        service = new NotificationService(notificationRepository, notificationMapper);
    }

    @Test
    void markAsRead_whenOwned_marksReadAndSaves() {
        Notification n = new Notification();
        n.setUserId("u1");
        n.setIsRead(false);
        when(notificationRepository.findByIdAndUserId("n1", "u1")).thenReturn(Mono.just(n));
        when(notificationRepository.save(any(Notification.class))).thenReturn(Mono.just(n));

        StepVerifier.create(service.markAsRead("u1", "n1"))
            .assertNext(msg -> org.junit.jupiter.api.Assertions.assertNotNull(msg))
            .verifyComplete();

        assertTrue(n.getIsRead()); // marquée comme lue avant la sauvegarde
        verify(notificationRepository).save(n);
    }

    @Test
    void markAsRead_whenNotOwnedOrMissing_throwsNotFound() {
        when(notificationRepository.findByIdAndUserId("n1", "intruder")).thenReturn(Mono.empty());

        StepVerifier.create(service.markAsRead("intruder", "n1"))
            .expectError(ResourceNotFoundException.class)
            .verify();

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void delete_whenNotOwnedOrMissing_throwsNotFound() {
        when(notificationRepository.findByIdAndUserId("n1", "intruder")).thenReturn(Mono.empty());

        StepVerifier.create(service.delete("intruder", "n1"))
            .expectError(ResourceNotFoundException.class)
            .verify();

        verify(notificationRepository, never()).delete(any());
    }
}
