package com.abdatytch.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service de logging des événements de sécurité.
 * Enregistre les événements de sécurité avec des détails pour l'audit et l'analyse.
 */
@Component
public class SecurityEventLogger {

    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Value("${security.logging.enabled:true}")
    private boolean securityLoggingEnabled;

    @Value("${security.logging.level:INFO}")
    private String securityLogLevel;

    /**
     * Enregistre un événement de sécurité.
     * 
     * @param eventType le type d'événement
     * @param ipAddress l'adresse IP
     * @param details les détails de l'événement
     */
    public void logSecurityEvent(String eventType, String ipAddress, String details) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] EVENT: %s | IP: %s | DETAILS: %s", 
            timestamp, eventType, ipAddress, details);

        switch (securityLogLevel.toUpperCase()) {
            case "DEBUG":
                securityLogger.debug(logMessage);
                break;
            case "INFO":
                securityLogger.info(logMessage);
                break;
            case "WARN":
                securityLogger.warn(logMessage);
                break;
            case "ERROR":
                securityLogger.error(logMessage);
                break;
            default:
                securityLogger.info(logMessage);
        }
    }

    /**
     * Enregistre une tentative d'attaque.
     * 
     * @param attackType le type d'attaque
     * @param ipAddress l'adresse IP
     * @param details les détails
     */
    public void logAttackAttempt(String attackType, String ipAddress, String details) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] ATTACK: %s | IP: %s | DETAILS: %s | ACTION: BLOCKED", 
            timestamp, attackType, ipAddress, details);

        securityLogger.warn(logMessage);
    }

    /**
     * Enregistre une authentification réussie.
     * 
     * @param username le nom d'utilisateur
     * @param ipAddress l'adresse IP
     */
    public void logSuccessfulAuth(String username, String ipAddress) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] AUTH: SUCCESS | USER: %s | IP: %s", 
            timestamp, username, ipAddress);

        securityLogger.info(logMessage);
    }

    /**
     * Enregistre un échec d'authentification.
     * 
     * @param username le nom d'utilisateur
     * @param ipAddress l'adresse IP
     * @param reason la raison de l'échec
     */
    public void logFailedAuth(String username, String ipAddress, String reason) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] AUTH: FAILED | USER: %s | IP: %s | REASON: %s", 
            timestamp, username, ipAddress, reason);

        securityLogger.warn(logMessage);
    }

    /**
     * Enregistre un accès autorisé.
     * 
     * @param endpoint l'endpoint
     * @param method la méthode HTTP
     * @param ipAddress l'adresse IP
     * @param username le nom d'utilisateur (optionnel)
     */
    public void logAuthorizedAccess(String endpoint, String method, String ipAddress, String username) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String userPart = username != null ? username : "ANONYMOUS";
        String logMessage = String.format("[%s] ACCESS: ALLOWED | ENDPOINT: %s | METHOD: %s | USER: %s | IP: %s", 
            timestamp, endpoint, method, userPart, ipAddress);

        securityLogger.debug(logMessage);
    }

    /**
     * Enregistre un accès refusé.
     * 
     * @param endpoint l'endpoint
     * @param method la méthode HTTP
     * @param ipAddress l'adresse IP
     * @param reason la raison du refus
     */
    public void logDeniedAccess(String endpoint, String method, String ipAddress, String reason) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] ACCESS: DENIED | ENDPOINT: %s | METHOD: %s | IP: %s | REASON: %s", 
            timestamp, endpoint, method, ipAddress, reason);

        securityLogger.warn(logMessage);
    }

    /**
     * Enregistre un rate limit dépassé.
     * 
     * @param ipAddress l'adresse IP
     * @param limitType le type de limite (minute, heure, jour)
     * @param count le nombre de requêtes
     */
    public void logRateLimitExceeded(String ipAddress, String limitType, long count) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] RATE_LIMIT: EXCEEDED | IP: %s | TYPE: %s | COUNT: %d", 
            timestamp, ipAddress, limitType, count);

        securityLogger.warn(logMessage);
    }

    /**
     * Enregistre un IP bloquée.
     * 
     * @param ipAddress l'adresse IP
     * @param reason la raison du blocage
     */
    public void logIPBlocked(String ipAddress, String reason) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] IP_BLOCK: BLOCKED | IP: %s | REASON: %s", 
            timestamp, ipAddress, reason);

        securityLogger.warn(logMessage);
    }

    /**
     * Enregistre un IP déblocquée.
     * 
     * @param ipAddress l'adresse IP
     * @param reason la raison du déblocage
     */
    public void logIPUnblocked(String ipAddress, String reason) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] IP_BLOCK: UNBLOCKED | IP: %s | REASON: %s", 
            timestamp, ipAddress, reason);

        securityLogger.info(logMessage);
    }

    /**
     * Enregistre un événement de circuit breaker.
     * 
     * @param eventType le type d'événement
     * @param state l'état du circuit breaker
     */
    public void logCircuitBreakerEvent(String eventType, String state) {
        if (!securityLoggingEnabled) {
            return;
        }

        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] CIRCUIT_BREAKER: %s | STATE: %s", 
            timestamp, eventType, state);

        securityLogger.info(logMessage);
    }
}
