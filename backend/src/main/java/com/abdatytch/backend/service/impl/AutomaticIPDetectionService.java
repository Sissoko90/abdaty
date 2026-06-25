package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.response.SuspiciousIPDTO;
import com.abdatytch.backend.service.IAutomaticIPDetectionService;
import com.abdatytch.backend.service.IRedisLoginAttemptService;
import com.abdatytch.backend.service.ISuspiciousIPService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Implémentation du service pour la détection automatique des IPs suspectes.
 * Détecte automatiquement les IPs suspectes basées sur les patterns de tentatives.
 */
@Service
public class AutomaticIPDetectionService implements IAutomaticIPDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(AutomaticIPDetectionService.class);

    private final IRedisLoginAttemptService redisLoginAttemptService;
    private final ISuspiciousIPService suspiciousIPService;

    private final AtomicLong maxAttempts = new AtomicLong(5); // 5 tentatives
    private final AtomicLong timeWindowSeconds = new AtomicLong(300); // 5 minutes

    @Autowired
    public AutomaticIPDetectionService(
            IRedisLoginAttemptService redisLoginAttemptService,
            ISuspiciousIPService suspiciousIPService) {
        this.redisLoginAttemptService = redisLoginAttemptService;
        this.suspiciousIPService = suspiciousIPService;
    }

    @Override
    public Mono<SuspiciousIPDTO> analyzeLoginAttempt(String ipAddress, String username, boolean success) {
        logger.debug("Analyse de tentative de connexion - IP: {}, Utilisateur: {}, Succès: {}", 
            ipAddress, username, success);

        if (success) {
            // Si la connexion a réussi, réinitialiser les tentatives
            return redisLoginAttemptService.resetLoginAttempts(ipAddress)
                .thenReturn(null);
        } else {
            // Si échec, incrémenter les tentatives
            return redisLoginAttemptService.incrementLoginAttempt(ipAddress)
                .flatMap(attempts -> {
                    logger.debug("Tentatives pour IP {}: {}", ipAddress, attempts);
                    return detectSuspiciousIP(ipAddress);
                });
        }
    }

    @Override
    public Mono<SuspiciousIPDTO> detectSuspiciousIP(String ipAddress) {
        logger.debug("Détection d'IP suspecte: {}", ipAddress);
        
        return redisLoginAttemptService.getLoginAttempts(ipAddress)
            .flatMap(attempts -> {
                if (attempts >= maxAttempts.get()) {
                    logger.warn("IP suspecte détectée: {} - Tentatives: {}", ipAddress, attempts);
                    
                    // Déterminer le niveau de menace
                    String threatLevel = determineThreatLevel(attempts);
                    String reason = "Multiple failed login attempts (" + attempts + " attempts)";
                    
                    return suspiciousIPService.detectAndRegisterSuspiciousIP(ipAddress, reason, threatLevel);
                }
                return Mono.empty();
            });
    }

    @Override
    public void setDetectionThresholds(long maxAttempts, long timeWindowSeconds) {
        logger.info("Mise à jour des seuils de détection - maxAttempts: {}, timeWindow: {}s", 
            maxAttempts, timeWindowSeconds);
        this.maxAttempts.set(maxAttempts);
        this.timeWindowSeconds.set(timeWindowSeconds);
    }

    @Override
    public long[] getDetectionThresholds() {
        return new long[] {maxAttempts.get(), timeWindowSeconds.get()};
    }

    /**
     * Détermine le niveau de menace basé sur le nombre de tentatives.
     * 
     * @param attempts le nombre de tentatives
     * @return le niveau de menace
     */
    private String determineThreatLevel(long attempts) {
        long threshold = maxAttempts.get();
        
        if (attempts >= threshold * 4) {
            return "CRITICAL";
        } else if (attempts >= threshold * 3) {
            return "HIGH";
        } else if (attempts >= threshold * 2) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}
