package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.exception.BadRequestException;
import com.abdatytch.backend.mapper.IMediaMapper;
import com.abdatytch.backend.repository.MediaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.codec.multipart.FilePart;
import reactor.test.StepVerifier;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de MediaService : la whitelist d'extensions refuse les types
 * dangereux AVANT toute écriture disque ou persistance (anti-XSS stocké / DoS).
 */
@ExtendWith(MockitoExtension.class)
class MediaServiceTest {

    @Mock MediaRepository mediaRepository;
    @Mock IMediaMapper mediaMapper;
    @Mock FilePart filePart;

    MediaService mediaService;

    @BeforeEach
    void setUp() {
        mediaService = new MediaService(mediaRepository, mediaMapper);
    }

    @Test
    void upload_rejectsDisallowedExtension_beforeAnyPersistence() {
        when(filePart.filename()).thenReturn("malware.exe");

        StepVerifier.create(mediaService.upload(filePart, "branding", "admin"))
            .expectErrorMatches(e -> e instanceof BadRequestException
                && e.getMessage().contains("non autorisé"))
            .verify();

        // Aucun accès dépôt : le fichier est refusé avant toute écriture.
        verifyNoInteractions(mediaRepository);
    }
}
