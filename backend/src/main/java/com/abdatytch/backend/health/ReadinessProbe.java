package com.abdatytch.backend.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.health.contributor.Status;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Readiness probe (Kubernetes) : prêt à recevoir du trafic si la base ET Redis
 * répondent. Délègue aux {@link org.springframework.boot.health.contributor.ReactiveHealthIndicator}
 * (mêmes contrôles que /actuator/health).
 */
@RestController
@RequestMapping("/health/readiness")
public class ReadinessProbe {

    private static final Logger logger = LoggerFactory.getLogger(ReadinessProbe.class);

    private final DatabaseHealthIndicator databaseHealthIndicator;
    private final RedisHealthIndicator redisHealthIndicator;

    @Autowired
    public ReadinessProbe(
            DatabaseHealthIndicator databaseHealthIndicator,
            RedisHealthIndicator redisHealthIndicator) {
        this.databaseHealthIndicator = databaseHealthIndicator;
        this.redisHealthIndicator = redisHealthIndicator;
    }

    @GetMapping
    public Mono<Map<String, Object>> readiness() {
        logger.debug("Readiness probe check");

        return Mono.zip(databaseHealthIndicator.health(), redisHealthIndicator.health())
            .map(tuple -> {
                String dbStatus = tuple.getT1().getStatus().getCode();
                String redisStatus = tuple.getT2().getStatus().getCode();
                boolean overallHealthy = Status.UP.getCode().equals(dbStatus) && Status.UP.getCode().equals(redisStatus);

                Map<String, Object> response = new HashMap<>();
                response.put("status", overallHealthy ? "UP" : "DOWN");
                response.put("timestamp", System.currentTimeMillis());
                response.put("checks", Map.of("database", dbStatus, "redis", redisStatus));
                return response;
            })
            .onErrorResume(e -> {
                logger.error("Readiness probe failed", e);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("status", "DOWN");
                errorResponse.put("error", e.getMessage());
                return Mono.just(errorResponse);
            });
    }
}
