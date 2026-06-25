package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.service.IRedisLoginAttemptService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Implémentation du service pour la gestion des tentatives de connexion via Redis.
 * Compte les échecs de connexion par IP avec expiration automatique.
 */
@Service
public class RedisLoginAttemptService implements IRedisLoginAttemptService {

    private static final Logger logger = LoggerFactory.getLogger(RedisLoginAttemptService.class);
    private static final String LOGIN_ATTEMPT_KEY_PREFIX = "login_attempts:";
    private static final long DEFAULT_EXPIRATION_SECONDS = 3600; // 1 heure

    private final ReactiveRedisTemplate<String, Long> redisTemplate;

    @Autowired
    public RedisLoginAttemptService(ReactiveRedisTemplate<String, Long> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Long> incrementLoginAttempt(String ipAddress) {
        String key = getKey(ipAddress);
        logger.debug("Incrémentation des tentatives de connexion pour l'IP: {}", ipAddress);
        
        return redisTemplate.opsForValue()
            .increment(key)
            .flatMap(count -> {
                if (count == 1) {
                    // Première tentative, définir l'expiration
                    return redisTemplate.expire(key, Duration.ofSeconds(DEFAULT_EXPIRATION_SECONDS))
                        .thenReturn(count);
                }
                return Mono.just(count);
            });
    }

    @Override
    public Mono<Long> getLoginAttempts(String ipAddress) {
        String key = getKey(ipAddress);
        logger.debug("Récupération des tentatives de connexion pour l'IP: {}", ipAddress);
        
        return redisTemplate.opsForValue()
            .get(key)
            .defaultIfEmpty(0L);
    }

    @Override
    public Mono<Void> resetLoginAttempts(String ipAddress) {
        String key = getKey(ipAddress);
        logger.debug("Réinitialisation des tentatives de connexion pour l'IP: {}", ipAddress);
        
        return redisTemplate.delete(key)
            .then();
    }

    @Override
    public Mono<Boolean> shouldBlockIP(String ipAddress, long threshold) {
        return getLoginAttempts(ipAddress)
            .map(attempts -> attempts >= threshold);
    }

    @Override
    public Mono<Void> setExpiration(String ipAddress, long seconds) {
        String key = getKey(ipAddress);
        logger.debug("Définition de l'expiration pour l'IP: {} - {} secondes", ipAddress, seconds);
        
        return redisTemplate.expire(key, Duration.ofSeconds(seconds))
            .then();
    }

    /**
     * Construit la clé Redis pour une adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return la clé Redis
     */
    private String getKey(String ipAddress) {
        return LOGIN_ATTEMPT_KEY_PREFIX + ipAddress;
    }
}
