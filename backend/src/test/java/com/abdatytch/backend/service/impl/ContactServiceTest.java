package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.request.ContactRequestDTO;
import com.abdatytch.backend.entity.ContactMessage;
import com.abdatytch.backend.event.NotificationEventPublisher;
import com.abdatytch.backend.repository.ContactMessageRepository;
import com.abdatytch.backend.service.IEmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de ContactService : un nouveau message de contact est persisté
 * ET déclenche une notification push admin (événement Kafka « CONTACT_MESSAGE »).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ContactServiceTest {

    @Mock ContactMessageRepository repository;
    @Mock IEmailService emailService;
    @Mock NotificationEventPublisher notificationPublisher;

    ContactService contactService;

    @BeforeEach
    void setUp() {
        contactService = new ContactService(repository, emailService, notificationPublisher);
        when(emailService.sendHtmlEmail(anyString(), anyString(), anyString(), any(), any(), any()))
            .thenReturn(Mono.empty());
    }

    @Test
    void create_persistsAndPublishesContactNotification() {
        ContactRequestDTO dto = new ContactRequestDTO();
        dto.setName("Jane Doe");
        dto.setEmail("jane@test.com");
        dto.setMessage("Bonjour");
        dto.setService("web");

        when(repository.save(any(ContactMessage.class))).thenAnswer(invocation -> {
            ContactMessage saved = invocation.getArgument(0);
            saved.setId("c1");
            return Mono.just(saved);
        });

        StepVerifier.create(contactService.create(dto, "1.2.3.4"))
            .assertNext(result -> org.junit.jupiter.api.Assertions.assertNotNull(result))
            .verifyComplete();

        // L'événement de notification push doit être publié avec le bon type.
        verify(notificationPublisher).publish(argThat(e -> "CONTACT_MESSAGE".equals(e.type())));
    }
}
