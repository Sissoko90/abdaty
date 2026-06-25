package com.abdatytch.backend.security;

import com.abdatytch.backend.service.IJwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import reactor.test.StepVerifier;

import static org.mockito.Mockito.when;

/**
 * Tests unitaires de l'AuthenticationManager : l'identité authentifiée provient
 * du JWT VALIDÉ (principal = userId — correctif IDOR), et seul un token de type
 * « access » est accepté (un refresh token présenté en Bearer est rejeté).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthenticationManagerTest {

    @Mock IJwtService jwtService;

    AuthenticationManager authenticationManager;

    @BeforeEach
    void setUp() {
        authenticationManager = new AuthenticationManager(jwtService);
    }

    private Authentication bearer(String token) {
        return new UsernamePasswordAuthenticationToken(token, null);
    }

    @Test
    void authenticate_validAccessToken_setsUserIdPrincipalAndRole() {
        String token = "valid-access";
        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.isTokenExpired(token)).thenReturn(false);
        when(jwtService.extractTokenType(token)).thenReturn("access");
        when(jwtService.extractUserId(token)).thenReturn("user-123");
        when(jwtService.extractRole(token)).thenReturn("ADMIN");

        StepVerifier.create(authenticationManager.authenticate(bearer(token)))
            .assertNext(auth -> {
                // Le principal est l'userId (issu du token validé), pas un en-tête client.
                org.junit.jupiter.api.Assertions.assertEquals("user-123", auth.getName());
                org.junit.jupiter.api.Assertions.assertTrue(
                    auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
            })
            .verifyComplete();
    }

    @Test
    void authenticate_refreshTokenAsBearer_isRejected() {
        String token = "refresh-token";
        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.isTokenExpired(token)).thenReturn(false);
        when(jwtService.extractTokenType(token)).thenReturn("refresh");

        StepVerifier.create(authenticationManager.authenticate(bearer(token)))
            .expectError(RuntimeException.class)
            .verify();
    }

    @Test
    void authenticate_invalidToken_isRejected() {
        when(jwtService.validateToken("bad")).thenReturn(false);

        StepVerifier.create(authenticationManager.authenticate(bearer("bad")))
            .expectError(RuntimeException.class)
            .verify();
    }

    @Test
    void authenticate_expiredToken_isRejected() {
        String token = "expired";
        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.isTokenExpired(token)).thenReturn(true);

        StepVerifier.create(authenticationManager.authenticate(bearer(token)))
            .expectError(RuntimeException.class)
            .verify();
    }
}
