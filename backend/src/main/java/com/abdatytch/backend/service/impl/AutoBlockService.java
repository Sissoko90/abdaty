package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.response.SuspiciousIPDTO;
import com.abdatytch.backend.service.IAutoBlockService;
import com.abdatytch.backend.service.IRedisLoginAttemptService;
import com.abdatytch.backend.service.ISuspiciousIPService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Implémentation du service pour l'auto-blocage des IPs.
 * Bloque automatiquement les IPs dépassant un seuil de tentatives.
 */
@Service
public class AutoBlockService implements IAutoBlockService {

    private static final Logger logger = LoggerFactory.getLogger(AutoBlockService.class);

    private final IRedisLoginAttemptService redisLoginAttemptService;
    private final ISuspiciousIPService suspiciousIPService;

    private final AtomicLong autoBlockThreshold = new AtomicLong(10); // 10 tentatives
    private final AtomicBoolean autoBlockEnabled = new AtomicBoolean(true);

    @Autowired
    public AutoBlockService(
            IRedisLoginAttemptService redisLoginAttemptService,
            ISuspiciousIPService suspiciousIPService) {
        this.redisLoginAttemptService = redisLoginAttemptService;
        this.suspiciousIPService = suspiciousIPService;
    }

    @Override
    public Mono<SuspiciousIPDTO> checkAndAutoBlock(String ipAddress) {
        if (!autoBlockEnabled.get()) {
            logger.debug("Auto-blocage désactivé, IP non bloquée: {}", ipAddress);
            return Mono.empty();
        }

        logger.debug("Vérification d'auto-blocage pour l'IP: {}", ipAddress);
        
        return redisLoginAttemptService.getLoginAttempts(ipAddress)
            .flatMap(attempts -> {
                if (attempts >= autoBlockThreshold.get()) {
                    logger.warn("Auto-blocage déclenché pour IP: {} - Tentatives: {}", ipAddress, attempts);
                    return suspiciousIPService.blockIP(ipAddress);
                }
                return Mono.empty();
            });
    }

    @Override
    public void setAutoBlockThreshold(long threshold) {
        logger.info("Mise à jour du seuil d'auto-blocage: {}", threshold);
        this.autoBlockThreshold.set(threshold);
    }

    @Override
    public long getAutoBlockThreshold() {
        return autoBlockThreshold.get();
    }

    @Override
    public void setAutoBlockEnabled(boolean enabled) {
        logger.info("Auto-blocage: {}", enabled ? "activé" : "désactivé");
        this.autoBlockEnabled.set(enabled);
    }

    @Override
    public boolean isAutoBlockEnabled() {
        return autoBlockEnabled.get();
    }
}
