package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.LoginRequestDTO;
import com.abdatytch.backend.dto.request.RegisterRequestDTO;
import com.abdatytch.backend.entity.RefreshToken;
import com.abdatytch.backend.entity.User;
import com.abdatytch.backend.enums.UserStatus;
import com.abdatytch.backend.exception.ConflictException;
import com.abdatytch.backend.exception.UnauthorizedException;
import com.abdatytch.backend.mapper.IUserMapper;
import com.abdatytch.backend.repository.RefreshTokenRepository;
import com.abdatytch.backend.repository.UserRepository;
import com.abdatytch.backend.repository.VerificationCodeRepository;
import com.abdatytch.backend.service.IEmailService;
import com.abdatytch.backend.service.IJwtService;
import com.abdatytch.backend.service.IRedisLoginAttemptService;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de la logique d'authentification critique (anti-bruteforce,
 * gestion des statuts de compte, unicité à l'inscription). Dépendances mockées,
 * vérification réactive via StepVerifier — aucun contexte Spring / base requis.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock VerificationCodeRepository verificationCodeRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock IEmailService emailService;
    @Mock IJwtService jwtService;
    @Mock IUserMapper userMapper;
    @Mock PasswordEncoder passwordEncoder;
    @Mock IRedisLoginAttemptService loginAttemptService;

    AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, verificationCodeRepository, refreshTokenRepository,
            emailService, jwtService, userMapper, passwordEncoder, new SimpleMeterRegistry(), loginAttemptService);
        // Par défaut, aucun utilisateur existant (les tests spécifiques surchargent).
        // Évite un null sur les opérateurs assemblés tôt (ex. .then(findByEmail(...))).
        when(userRepository.findByEmail(anyString())).thenReturn(Mono.empty());
        // Anti-bruteforce : par défaut IP non bloquée + compteurs best-effort.
        when(loginAttemptService.shouldBlockIP(anyString(), anyLong())).thenReturn(Mono.just(false));
        when(loginAttemptService.incrementLoginAttempt(anyString())).thenReturn(Mono.just(1L));
        when(loginAttemptService.setExpiration(anyString(), anyLong())).thenReturn(Mono.empty());
        when(loginAttemptService.resetLoginAttempts(anyString())).thenReturn(Mono.empty());
    }

    // --- login ---

    @Test
    void login_whenTooManyAttempts_isBlocked() {
        when(loginAttemptService.shouldBlockIP(eq("1.2.3.4"), anyLong())).thenReturn(Mono.just(true));

        StepVerifier.create(authService.login(login("user@test.com", "x"), "1.2.3.4"))
            .expectErrorMatches(e -> e instanceof UnauthorizedException
                && MessageConstants.TOO_MANY_LOGIN_ATTEMPTS.equals(e.getMessage()))
            .verify();

        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void login_whenUserNotFound_invalidCredentialsAndRecordsFailure() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Mono.empty());

        StepVerifier.create(authService.login(login("user@test.com", "x"), "1.2.3.4"))
            .expectErrorMatches(e -> e instanceof UnauthorizedException
                && MessageConstants.INVALID_CREDENTIALS.equals(e.getMessage()))
            .verify();

        verify(loginAttemptService).incrementLoginAttempt("1.2.3.4");
    }

    @Test
    void login_whenWrongPassword_invalidCredentialsAndRecordsFailure() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Mono.just(user(UserStatus.ACTIVE, "ENC")));
        when(passwordEncoder.matches("bad", "ENC")).thenReturn(false);

        StepVerifier.create(authService.login(login("user@test.com", "bad"), "1.2.3.4"))
            .expectErrorMatches(e -> e instanceof UnauthorizedException
                && MessageConstants.INVALID_CREDENTIALS.equals(e.getMessage()))
            .verify();

        verify(loginAttemptService).incrementLoginAttempt("1.2.3.4");
    }

    @Test
    void login_whenDeactivated_returnsAccountDeactivated() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Mono.just(user(UserStatus.DEACTIVATED, "ENC")));
        when(passwordEncoder.matches("good", "ENC")).thenReturn(true);

        StepVerifier.create(authService.login(login("user@test.com", "good"), "1.2.3.4"))
            .expectErrorMatches(e -> e instanceof UnauthorizedException
                && MessageConstants.ACCOUNT_DEACTIVATED.equals(e.getMessage()))
            .verify();
    }

    @Test
    void login_whenBanned_returnsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Mono.just(user(UserStatus.BANNED, "ENC")));
        when(passwordEncoder.matches("good", "ENC")).thenReturn(true);

        StepVerifier.create(authService.login(login("user@test.com", "good"), "1.2.3.4"))
            .expectErrorMatches(e -> e instanceof UnauthorizedException
                && MessageConstants.FORBIDDEN_ACCESS.equals(e.getMessage()))
            .verify();
    }

    @Test
    void login_whenValid_returnsTokensAndResetsAttempts() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Mono.just(user(UserStatus.ACTIVE, "ENC")));
        when(passwordEncoder.matches("good", "ENC")).thenReturn(true);
        when(jwtService.generateAccessToken(anyString(), anyString(), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(anyString(), anyString())).thenReturn("refresh-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> Mono.just(i.getArgument(0)));

        StepVerifier.create(authService.login(login("user@test.com", "good"), "1.2.3.4"))
            .assertNext(resp -> {
                assertEquals("access-token", resp.getAccessToken());
                assertEquals("refresh-token", resp.getRefreshToken());
            })
            .verifyComplete();

        verify(loginAttemptService).resetLoginAttempts("1.2.3.4");
    }

    // --- register ---

    @Test
    void register_whenEmailExists_conflict() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Mono.just(user(UserStatus.ACTIVE, "ENC")));

        StepVerifier.create(authService.register(register("user@test.com", null)))
            .expectErrorMatches(e -> e instanceof ConflictException
                && MessageConstants.EMAIL_ALREADY_EXISTS.equals(e.getMessage()))
            .verify();
    }

    @Test
    void register_whenPhoneExists_conflict() {
        when(userRepository.findByPhoneNumber("+22300000000")).thenReturn(Mono.just(user(UserStatus.ACTIVE, "ENC")));

        StepVerifier.create(authService.register(register("new@test.com", "+22300000000")))
            .expectErrorMatches(e -> e instanceof ConflictException
                && MessageConstants.PHONE_NUMBER_ALREADY_EXISTS.equals(e.getMessage()))
            .verify();
    }

    // --- helpers ---

    private User user(UserStatus status, String encodedPassword) {
        User u = new User();
        u.setId("u1");
        u.setEmail("user@test.com");
        u.setPassword(encodedPassword);
        u.setRole("USER");
        u.setFirstName("Test");
        u.setStatus(status);
        return u;
    }

    private LoginRequestDTO login(String email, String password) {
        LoginRequestDTO d = new LoginRequestDTO();
        d.setEmail(email);
        d.setPassword(password);
        return d;
    }

    private RegisterRequestDTO register(String email, String phone) {
        RegisterRequestDTO r = new RegisterRequestDTO();
        r.setEmail(email);
        r.setPassword("Passw0rd!");
        r.setFirstName("Test");
        r.setLastName("User");
        r.setPhoneNumber(phone);
        return r;
    }
}
