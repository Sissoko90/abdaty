package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.security.rsa.RsaKeyService;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tests unitaires de JwtService : génération/validation des tokens RSA et
 * extraction des claims (dont le TYPE — access vs refresh — utilisé pour rejeter
 * un refresh token présenté en Bearer). Utilise une vraie paire RSA générée dans
 * un dossier temporaire, sans contexte Spring.
 */
class JwtServiceTest {

    JwtService jwtService;

    @BeforeEach
    void setUp(@TempDir Path tempDir) {
        RsaKeyService rsaKeyService = new RsaKeyService();
        ReflectionTestUtils.setField(rsaKeyService, "keySize", 2048);
        ReflectionTestUtils.setField(rsaKeyService, "rotationEnabled", false);
        ReflectionTestUtils.setField(rsaKeyService, "rotationIntervalDays", 30);
        ReflectionTestUtils.setField(rsaKeyService, "keyStoragePath", tempDir.toString());
        rsaKeyService.init();

        jwtService = new JwtService(new SimpleMeterRegistry(), rsaKeyService);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3_600_000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604_800_000L);
    }

    @Test
    void accessToken_roundTrip_extractsClaimsAndType() {
        String token = jwtService.generateAccessToken("u1", "user@test.com", "ADMIN");

        assertTrue(jwtService.validateToken(token));
        assertFalse(jwtService.isTokenExpired(token));
        assertEquals("access", jwtService.extractTokenType(token));
        assertEquals("u1", jwtService.extractUserId(token));
        assertEquals("user@test.com", jwtService.extractEmail(token));
        assertEquals("ADMIN", jwtService.extractRole(token));
    }

    @Test
    void refreshToken_hasRefreshType() {
        String token = jwtService.generateRefreshToken("u1", "user@test.com");

        assertTrue(jwtService.validateToken(token));
        assertEquals("refresh", jwtService.extractTokenType(token));
    }

    @Test
    void validateToken_rejectsGarbage() {
        assertFalse(jwtService.validateToken("not-a-jwt-token"));
    }
}
