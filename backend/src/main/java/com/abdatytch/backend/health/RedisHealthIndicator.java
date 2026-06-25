package com.abdatytch.backend.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.ReactiveHealthIndicator;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Indicateur de santé de Redis, intégré à l'agrégat Actuator
 * (/actuator/health → composant « redis »).
 */
@Component
public class RedisHealthIndicator implements ReactiveHealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(RedisHealthIndicator.class);

    private final ReactiveRedisTemplate<String, Object> redisTemplate;

    public RedisHealthIndicator(ReactiveRedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Health> health() {
        return redisTemplate.opsForValue()
            .set("health_check", "ping", Duration.ofSeconds(5))
            .flatMap(success -> redisTemplate.opsForValue().get("health_check")
                .map(value -> "ping".equals(value)
                    ? Health.up().withDetail("redis", "Connected").build()
                    : Health.down().withDetail("redis", "Invalid response").build())
                .defaultIfEmpty(Health.down().withDetail("redis", "No response").build()))
            .onErrorResume(e -> {
                logger.warn("Redis health check failed: {}", e.getMessage());
                return Mono.just(Health.down(e).withDetail("redis", "unreachable").build());
            });
    }
}
