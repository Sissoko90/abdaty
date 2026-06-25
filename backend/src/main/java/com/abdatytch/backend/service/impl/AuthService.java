package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.*;
import com.abdatytch.backend.dto.response.AuthResponseDTO;
import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import com.abdatytch.backend.entity.RefreshToken;
import com.abdatytch.backend.entity.User;
import com.abdatytch.backend.entity.VerificationCode;
import com.abdatytch.backend.enums.UserStatus;
import com.abdatytch.backend.enums.VerificationCodeType;
import com.abdatytch.backend.exception.BadRequestException;
import com.abdatytch.backend.exception.ConflictException;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.exception.UnauthorizedException;
import com.abdatytch.backend.mapper.IUserMapper;
import com.abdatytch.backend.repository.RefreshTokenRepository;
import com.abdatytch.backend.repository.UserRepository;
import com.abdatytch.backend.repository.VerificationCodeRepository;
import com.abdatytch.backend.service.IAuthService;
import com.abdatytch.backend.service.IEmailService;
import com.abdatytch.backend.service.IJwtService;
import com.abdatytch.backend.service.IRedisLoginAttemptService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.transaction.annotation.Transactional;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import com.abdatytch.backend.utils.UsernameGenerator;

/**
 * Service d'authentification.
 * Gère l'enregistrement, la connexion, le rafraîchissement de token, la réinitialisation de mot de passe, etc.
 * Implémente le caching, la résilience et les métriques.
 */
@Service
public class AuthService implements IAuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final String CACHE_NAME = "auth";

    private final UserRepository userRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final IEmailService emailService;
    private final IJwtService jwtService;
    private final IUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final MeterRegistry meterRegistry;
    private final Timer authOperationTimer;
    private final IRedisLoginAttemptService loginAttemptService;

    @Value("${app.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.security.jwt.refresh-expiration}")
    private long refreshExpiration;

    @Value("${app.validation.verification-code-expiration-minutes}")
    private int verificationCodeExpirationMinutes;

    // Anti-bruteforce : nombre d'échecs de connexion par IP avant blocage temporaire.
    @Value("${app.security.login.max-attempts:5}")
    private long maxLoginAttempts;

    // Durée du blocage (et fenêtre de comptage) en secondes après dépassement.
    @Value("${app.security.login.block-duration-seconds:900}")
    private long loginBlockSeconds;

    @Autowired
    public AuthService(
            UserRepository userRepository,
            VerificationCodeRepository verificationCodeRepository,
            RefreshTokenRepository refreshTokenRepository,
            IEmailService emailService,
            IJwtService jwtService,
            IUserMapper userMapper,
            PasswordEncoder passwordEncoder,
            MeterRegistry meterRegistry,
            IRedisLoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.verificationCodeRepository = verificationCodeRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.meterRegistry = meterRegistry;
        this.authOperationTimer = meterRegistry.timer("auth.operation.time");
        this.loginAttemptService = loginAttemptService;
    }

    /**
     * Enregistre un nouvel utilisateur.
     * 
     * @param registerRequest les données d'enregistrement
     * @return un Mono contenant le message de succès
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "registerFallback")
    @Retry(name = "authService")
    public Mono<MessageResponseDTO> register(RegisterRequestDTO registerRequest) {
        logger.debug("Tentative d'enregistrement pour l'email: {}", registerRequest.getEmail());
        
        Timer.Sample sample = Timer.start(meterRegistry);
        // Unicité du téléphone (optionnel) vérifiée EN RÉACTIF — remplace l'ancien
        // @UniquePhoneNumber qui faisait un .block() sur l'event-loop Netty.
        return ensurePhoneNumberUnique(registerRequest.getPhoneNumber())
            .then(userRepository.findByEmail(registerRequest.getEmail()))
            .<User>flatMap(existingUser -> {
                sample.stop(authOperationTimer);
                return Mono.error(new ConflictException(MessageConstants.EMAIL_ALREADY_EXISTS));
            })
            .switchIfEmpty(Mono.defer(() -> {
                User user = new User();
                user.setUsername(UsernameGenerator.generateUsername(registerRequest.getFirstName(), registerRequest.getLastName()));
                user.setEmail(registerRequest.getEmail());
                user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
                user.setFirstName(registerRequest.getFirstName());
                user.setLastName(registerRequest.getLastName());
                user.setPhoneNumber(registerRequest.getPhoneNumber());
                user.setRole("USER");
                user.setStatus(UserStatus.INACTIVE);
                
                return userRepository.save(user);
            }))
            .flatMap(savedUser -> generateAndSendVerificationCode(savedUser.getEmail(), VerificationCodeType.REGISTRATION)
                .then(Mono.defer(() -> {
                    sample.stop(authOperationTimer);
                    logger.debug("Utilisateur enregistré avec succès: {}", savedUser.getEmail());
                    return Mono.just(new MessageResponseDTO(MessageConstants.REGISTRATION_SUCCESSFUL));
                })))
            .doOnError(error -> {
                sample.stop(authOperationTimer);
                logger.error("Erreur lors de l'enregistrement", error);
            });
    }

    /**
     * Vérifie en réactif l'unicité du numéro de téléphone (optionnel).
     * Complète à vide si le numéro est absent ou libre, erreur {@link ConflictException} sinon.
     */
    private Mono<Void> ensurePhoneNumberUnique(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return Mono.empty();
        }
        return userRepository.findByPhoneNumber(phoneNumber)
            .flatMap(existing -> Mono.<Void>error(new ConflictException(MessageConstants.PHONE_NUMBER_ALREADY_EXISTS)))
            .then();
    }

    /**
     * Connecte un utilisateur.
     * 
     * @param loginRequest les données de connexion
     * @return un Mono contenant la réponse d'authentification
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "authFallback")
    @Retry(name = "authService")
    public Mono<AuthResponseDTO> login(LoginRequestDTO loginRequest, String clientIp) {
        logger.debug("Tentative de connexion pour l'email: {}", loginRequest.getEmail());

        // Anti-bruteforce : si l'IP a dépassé le seuil d'échecs, on refuse d'emblée.
        // Fail-OPEN si Redis est indisponible (onErrorReturn false) : on préfère
        // laisser passer plutôt que verrouiller tout le monde quand le cache tombe.
        return loginAttemptService.shouldBlockIP(clientIp, maxLoginAttempts)
            .onErrorReturn(false)
            .flatMap(blocked -> Boolean.TRUE.equals(blocked)
                ? Mono.error(new UnauthorizedException(MessageConstants.TOO_MANY_LOGIN_ATTEMPTS))
                : doLogin(loginRequest, clientIp));
    }

    /** Logique de connexion proprement dite (après le contrôle anti-bruteforce). */
    private Mono<AuthResponseDTO> doLogin(LoginRequestDTO loginRequest, String clientIp) {
        return Mono.defer(() -> {
            Timer.Sample sample = Timer.start(meterRegistry);
            return userRepository.findByEmail(loginRequest.getEmail())
                .switchIfEmpty(Mono.defer(() ->
                    recordFailedLogin(clientIp).then(Mono.error(new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS)))))
                .flatMap(user -> {
                    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                        return recordFailedLogin(clientIp)
                            .then(Mono.error(new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS)));
                    }

                    // Compte désactivé par l'admin : message clair, AUCUN code envoyé.
                    if (user.getStatus() == UserStatus.DEACTIVATED) {
                        return Mono.error(new UnauthorizedException(MessageConstants.ACCOUNT_DEACTIVATED));
                    }

                    // Compte non vérifié (inscription) : on (re)envoie un code de vérification.
                    if (user.getStatus() == UserStatus.INACTIVE) {
                        return generateAndSendVerificationCode(user.getEmail(), VerificationCodeType.LOGIN)
                            .then(Mono.error(new UnauthorizedException(MessageConstants.ACCOUNT_NOT_VERIFIED)));
                    }

                    if (user.getStatus() == UserStatus.BANNED || user.getStatus() == UserStatus.BLOCKED) {
                        return Mono.error(new UnauthorizedException(MessageConstants.FORBIDDEN_ACCESS));
                    }

                    String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
                    String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

                    // Connexion réussie : on réinitialise le compteur d'échecs de l'IP.
                    return loginAttemptService.resetLoginAttempts(clientIp).onErrorResume(e -> Mono.empty())
                        .then(saveRefreshToken(user.getId(), refreshToken))
                        .then(Mono.defer(() -> {
                            sample.stop(authOperationTimer);
                            logger.debug("Connexion réussie pour l'utilisateur: {}", user.getEmail());
                            return Mono.just(new AuthResponseDTO(accessToken, refreshToken));
                        }));
                })
                .doOnError(error -> {
                    sample.stop(authOperationTimer);
                    logger.error("Erreur lors de la connexion", error);
                });
        });
    }

    /**
     * Incrémente le compteur d'échecs de connexion de l'IP et (re)pose la fenêtre
     * d'expiration. Best-effort : si Redis est indisponible, on n'échoue pas.
     */
    private Mono<Void> recordFailedLogin(String clientIp) {
        return loginAttemptService.incrementLoginAttempt(clientIp)
            .flatMap(count -> loginAttemptService.setExpiration(clientIp, loginBlockSeconds))
            .onErrorResume(e -> Mono.empty());
    }

    /**
     * Rafraîchit le token d'accès.
     * 
     * @param refreshTokenRequest les données de rafraîchissement
     * @return un Mono contenant la nouvelle réponse d'authentification
     */
    // @Transactional (réactif) : la rotation supprime l'ancien refresh token PUIS
    // en insère un nouveau ; sans transaction, un échec après le delete laissait
    // l'utilisateur sans aucun token (déconnexion forcée). Atomique désormais.
    @Transactional
    @CircuitBreaker(name = "authService", fallbackMethod = "authFallback")
    @Retry(name = "authService")
    public Mono<AuthResponseDTO> refreshToken(RefreshTokenRequestDTO refreshTokenRequest) {
        logger.info("Tentative de rafraîchissement de token");
        
        Timer.Sample sample = Timer.start(meterRegistry);
        return refreshTokenRepository.findByToken(refreshTokenRequest.getRefreshToken())
            .switchIfEmpty(Mono.error(new UnauthorizedException(MessageConstants.REFRESH_TOKEN_INVALID)))
            .flatMap(token -> {
                if (token.isExpired() || token.isRevoked()) {
                    return Mono.error(new UnauthorizedException(MessageConstants.REFRESH_TOKEN_INVALID));
                }
                
                String userId = token.getUserId();
                return userRepository.findById(userId)
                    .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
                    .flatMap(user -> {
                        if (user.getStatus() == UserStatus.BANNED || user.getStatus() == UserStatus.BLOCKED) {
                            return Mono.error(new UnauthorizedException(MessageConstants.FORBIDDEN_ACCESS));
                        }
                        
                        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
                        String newRefreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
                        
                        return refreshTokenRepository.deleteById(token.getId())
                            .then(saveRefreshToken(userId, newRefreshToken))
                            .then(Mono.defer(() -> {
                                sample.stop(authOperationTimer);
                                logger.debug("Token rafraîchi avec succès pour l'utilisateur: {}", user.getEmail());
                                return Mono.just(new AuthResponseDTO(newAccessToken, newRefreshToken));
                            }));
                    });
            })
            .doOnError(error -> {
                sample.stop(authOperationTimer);
                logger.error("Erreur lors du rafraîchissement de token", error);
            });
    }

    /**
     * Demande la réinitialisation du mot de passe.
     * 
     * @param forgotPasswordRequest les données d'oubli de mot de passe
     * @return un Mono contenant le message de succès
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "forgotPasswordFallback")
    @Retry(name = "authService")
    public Mono<MessageResponseDTO> forgotPassword(ForgotPasswordRequestDTO forgotPasswordRequest) {
        logger.debug("Demande de réinitialisation de mot de passe reçue");
        
        Timer.Sample sample = Timer.start(meterRegistry);
        return userRepository.findByEmail(forgotPasswordRequest.getEmail())
            .flatMap(user -> generateAndSendVerificationCode(user.getEmail(), VerificationCodeType.PASSWORD_RESET)
                .then(Mono.defer(() -> {
                    sample.stop(authOperationTimer);
                    logger.debug("Code de réinitialisation envoyé");
                    return Mono.just(new MessageResponseDTO(MessageConstants.PASSWORD_RESET_CODE_SENT));
                })))
            .switchIfEmpty(Mono.defer(() -> {
                sample.stop(authOperationTimer);
                logger.debug("Email non trouvé mais message envoyé pour sécurité");
                return Mono.just(new MessageResponseDTO(MessageConstants.PASSWORD_RESET_CODE_SENT));
            }))
            .doOnError(error -> {
                sample.stop(authOperationTimer);
                logger.error("Erreur lors de la demande de réinitialisation", error);
            });
    }

    /**
     * Réinitialise le mot de passe.
     * 
     * @param resetPasswordRequest les données de réinitialisation
     * @return un Mono contenant le message de succès
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "resetPasswordFallback")
    @Retry(name = "authService")
    public Mono<MessageResponseDTO> resetPassword(ResetPasswordRequestDTO resetPasswordRequest) {
        logger.info("Tentative de réinitialisation de mot de passe");
        
        Timer.Sample sample = Timer.start(meterRegistry);
        return Mono.defer(() -> {
            if (!resetPasswordRequest.getNewPassword().equals(resetPasswordRequest.getConfirmPassword())) {
                sample.stop(authOperationTimer);
                return Mono.error(new BadRequestException(MessageConstants.PASSWORD_MISMATCH));
            }
            
            return verificationCodeRepository.findByCode(resetPasswordRequest.getCode())
                .switchIfEmpty(Mono.error(new BadRequestException(MessageConstants.VERIFICATION_CODE_INVALID)))
                        .flatMap(code -> {
                            if (code.isExpired() || code.isUsed()) {
                                return Mono.error(new BadRequestException(MessageConstants.VERIFICATION_CODE_INVALID));
                            }
                            
                            if (!code.getType().equals(VerificationCodeType.PASSWORD_RESET)) {
                                return Mono.error(new BadRequestException(MessageConstants.VERIFICATION_CODE_INVALID));
                            }
                            
                            return userRepository.findByEmail(code.getEmail())
                                .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
                                .flatMap(user -> {
                                    user.setPassword(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
                                    code.setUsed(true);
                                    
                                    return userRepository.save(user)
                                        .zipWith(verificationCodeRepository.save(code))
                                        .then(Mono.defer(() -> {
                                            sample.stop(authOperationTimer);
                                            logger.debug("Mot de passe réinitialisé avec succès pour: {}", user.getEmail());
                                            return Mono.just(new MessageResponseDTO(MessageConstants.PASSWORD_RESET_SUCCESSFUL));
                                        }));
                                });
                        });
                })
                .doOnError(error -> {
                    sample.stop(authOperationTimer);
                    logger.error("Erreur lors de la réinitialisation du mot de passe", error);
                });
    }

    /**
     * Vérifie un code de validation.
     * 
     * @param verifyCodeRequest les données de vérification
     * @return un Mono contenant le message de succès
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "verifyCodeFallback")
    @Retry(name = "authService")
    public Mono<MessageResponseDTO> verifyCode(VerifyCodeRequestDTO verifyCodeRequest) {
        logger.debug("Tentative de vérification du code pour l'email: {}", verifyCodeRequest.getEmail());
        
        return Mono.defer(() -> {
            Timer.Sample sample = Timer.start(meterRegistry);
            return verificationCodeRepository.findByEmailAndType(verifyCodeRequest.getEmail(), VerificationCodeType.REGISTRATION)
                .switchIfEmpty(Mono.error(new BadRequestException(MessageConstants.VERIFICATION_CODE_INVALID)))
                .flatMap(code -> {
                    if (!code.getCode().equals(verifyCodeRequest.getCode())) {
                        return Mono.error(new BadRequestException(MessageConstants.VERIFICATION_CODE_INVALID));
                    }
                    
                    if (code.isExpired() || code.isUsed()) {
                        return Mono.error(new BadRequestException(MessageConstants.VERIFICATION_CODE_INVALID));
                    }
                    
                    return userRepository.findByEmail(verifyCodeRequest.getEmail())
                        .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
                        .flatMap(user -> {
                            if (user.getStatus() == UserStatus.ACTIVE) {
                                return Mono.error(new BadRequestException(MessageConstants.ACCOUNT_ALREADY_VERIFIED));
                            }
                            
                            user.setStatus(UserStatus.ACTIVE);
                            code.setUsed(true);
                            
                            return userRepository.save(user)
                                .zipWith(verificationCodeRepository.save(code))
                                .then(Mono.defer(() -> {
                                    sample.stop(authOperationTimer);
                                    logger.debug("Compte vérifié avec succès pour: {}", user.getEmail());
                                    return Mono.just(new MessageResponseDTO(MessageConstants.VERIFICATION_CODE_VALID));
                                }));
                        });
                })
                .doOnError(error -> {
                    sample.stop(authOperationTimer);
                    logger.error("Erreur lors de la vérification du code", error);
                });
        });
    }

    /**
     * Récupère les informations de l'utilisateur authentifié.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @return un Mono contenant les informations de l'utilisateur
     */
    @Cacheable(value = CACHE_NAME, key = "'authMe:' + #userId")
    @CircuitBreaker(name = "authService", fallbackMethod = "authMeFallback")
    @Retry(name = "authService")
    public Mono<UserResponseDTO> authMe(String userId) {
        logger.info("Récupération des informations d'authentification pour l'utilisateur: {}", userId);
        
        return Mono.defer(() -> {
            Timer.Sample sample = Timer.start(meterRegistry);
            return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
                .map(userMapper::toResponseDTO)
                .doOnSuccess(response -> {
                    sample.stop(authOperationTimer);
                    logger.info("Informations d'authentification récupérées pour l'utilisateur: {}", userId);
                })
                .doOnError(error -> {
                    sample.stop(authOperationTimer);
                    logger.error("Erreur lors de la récupération des informations d'authentification", error);
                });
        });
    }

    /**
     * Déconnecte un utilisateur en détruisant sa session.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param refreshToken le refresh token à révoquer
     * @return un Mono contenant le message de succès
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "authFallback")
    @Retry(name = "authService")
    public Mono<MessageResponseDTO> logout(String userId, String refreshToken) {
        logger.info("Tentative de déconnexion pour l'utilisateur: {}", userId);
        
        Timer.Sample sample = Timer.start(meterRegistry);
        return refreshTokenRepository.findByToken(refreshToken)
            .switchIfEmpty(Mono.error(new UnauthorizedException(MessageConstants.REFRESH_TOKEN_INVALID)))
            .flatMap(token -> {
                if (!token.getUserId().equals(userId)) {
                    sample.stop(authOperationTimer);
                    return Mono.error(new UnauthorizedException(MessageConstants.FORBIDDEN_ACCESS));
                }
                
                token.setRevoked(true);
                return refreshTokenRepository.save(token)
                    .then(Mono.defer(() -> {
                        sample.stop(authOperationTimer);
                        logger.info("Utilisateur déconnecté avec succès: {}", userId);
                        return Mono.just(new MessageResponseDTO(MessageConstants.LOGOUT_SUCCESSFUL));
                    }));
            })
            .doOnError(error -> {
                sample.stop(authOperationTimer);
                logger.error("Erreur lors de la déconnexion", error);
            });
    }

    /**
     * Génère et envoie un code de validation par email.
     * 
     * @param email l'adresse email
     * @param type le type de code
     * @return un Mono vide
     */
    private Mono<Void> generateAndSendVerificationCode(String email, VerificationCodeType type) {
        return verificationCodeRepository.deleteByEmail(email)
            .then(Mono.defer(() -> {
                String code = generateVerificationCode();
                LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(verificationCodeExpirationMinutes);
                
                VerificationCode verificationCode = new VerificationCode(code, email, type, expiresAt);
                
                return verificationCodeRepository.save(verificationCode)
                    .flatMap(savedCode -> userRepository.findByEmail(email)
                        .flatMap(user -> emailService.sendVerificationEmailWithTemplate(email, code, type, user.getFirstName())));
            }));
    }

    /**
     * Génère un code de validation à 6 chiffres.
     * 
     * @return le code de validation
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    /**
     * Sauvegarde un refresh token.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param token le token de rafraîchissement
     * @return un Mono vide
     */
    private Mono<Void> saveRefreshToken(String userId, String token) {
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(refreshExpiration / 1000);
        RefreshToken refreshToken = new RefreshToken(token, userId, expiresAt);
        return refreshTokenRepository.save(refreshToken).then();
    }

    // Méthodes de fallback

    public Mono<MessageResponseDTO> registerFallback(RegisterRequestDTO request, Exception exception) {
        logger.error("Fallback: échec de l'enregistrement");
        throw new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE, exception);
    }

    public Mono<AuthResponseDTO> authFallback(Object request, Exception exception) {
        logger.error("Fallback: échec de l'opération d'authentification");
        throw new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE, exception);
    }

    /** Fallback dédié à login(LoginRequestDTO, String) — signature à 2 arguments. */
    public Mono<AuthResponseDTO> authFallback(LoginRequestDTO request, String clientIp, Exception exception) {
        return authFallback((Object) request, exception);
    }

    public Mono<MessageResponseDTO> forgotPasswordFallback(ForgotPasswordRequestDTO request, Exception exception) {
        logger.error("Fallback: échec de la demande de réinitialisation");
        throw new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE, exception);
    }

    public Mono<MessageResponseDTO> resetPasswordFallback(ResetPasswordRequestDTO request, Exception exception) {
        logger.error("Fallback: échec de la réinitialisation du mot de passe");
        throw new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE, exception);
    }

    public Mono<MessageResponseDTO> verifyCodeFallback(VerifyCodeRequestDTO request, Exception exception) {
        logger.error("Fallback: échec de la vérification du code");
        throw new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE, exception);
    }

    public Mono<UserResponseDTO> authMeFallback(String userId, Exception exception) {
        logger.error("Fallback: échec de la récupération des informations d'authentification");
        throw new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE, exception);
    }
}
