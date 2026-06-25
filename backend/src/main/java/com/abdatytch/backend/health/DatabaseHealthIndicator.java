package com.abdatytch.backend.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.ReactiveHealthIndicator;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Indicateur de santé de la base de données, intégré à l'agrégat Actuator
 * (/actuator/health → composant « database »).
 */
@Component
public class DatabaseHealthIndicator implements ReactiveHealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseHealthIndicator.class);

    private final R2dbcEntityTemplate r2dbcEntityTemplate;

    public DatabaseHealthIndicator(R2dbcEntityTemplate r2dbcEntityTemplate) {
        this.r2dbcEntityTemplate = r2dbcEntityTemplate;
    }

    @Override
    public Mono<Health> health() {
        return r2dbcEntityTemplate.getDatabaseClient()
            .sql("SELECT 1")
            .fetch()
            .first()
            .map(result -> Health.up().withDetail("database", "MySQL").build())
            .onErrorResume(e -> {
                logger.warn("Database health check failed: {}", e.getMessage());
                return Mono.just(Health.down(e).withDetail("database", "MySQL").build());
            });
    }
}
