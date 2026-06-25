package com.abdatytch.backend.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Verrou distribué en base (R2DBC) pour les tâches planifiées multi-réplicas.
 *
 * Acquisition ATOMIQUE : on tente d'abord de reprendre un verrou EXPIRÉ
 * (UPDATE … WHERE locked_until < NOW()), sinon on tente un INSERT (première prise).
 * Une clé dupliquée signifie qu'une autre instance le détient encore → échec.
 * Le verrou expire de lui-même (locked_until) afin de survivre au crash du détenteur.
 */
@Component
public class ReactiveDistributedLock {

    private static final Logger logger = LoggerFactory.getLogger(ReactiveDistributedLock.class);

    private final DatabaseClient db;
    /** Identifiant unique de cette instance (diagnostic du détenteur). */
    private final String instanceId = UUID.randomUUID().toString();

    public ReactiveDistributedLock(DatabaseClient db) {
        this.db = db;
    }

    /**
     * Tente d'acquérir le verrou nommé pour la durée {@code ttl}.
     *
     * @return {@code Mono<Boolean>} émettant true si acquis (cette instance peut
     *         exécuter la tâche), false sinon. Tolérant aux pannes (false en cas
     *         d'erreur SQL) pour ne jamais faire échouer le scheduler.
     */
    public Mono<Boolean> tryAcquire(String name, Duration ttl) {
        // Timestamps calculés en Java (et liés en paramètres) → SQL 100 % PORTABLE
        // entre MySQL (dev) et PostgreSQL (prod). Pas de DATE_ADD/NOW() spécifiques.
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime until = now.plusSeconds(Math.max(1, ttl.getSeconds()));

        String takeExpired = "UPDATE scheduler_locks SET locked_until = :until, locked_by = :by "
            + "WHERE lock_name = :name AND locked_until < :now";
        String firstTake = "INSERT INTO scheduler_locks (lock_name, locked_until, locked_by) "
            + "VALUES (:name, :until, :by)";

        return db.sql(takeExpired)
            .bind("until", until).bind("by", instanceId).bind("name", name).bind("now", now)
            .fetch().rowsUpdated()
            .flatMap(updated -> (updated != null && updated >= 1)
                ? Mono.just(true)
                : db.sql(firstTake)
                    .bind("name", name).bind("until", until).bind("by", instanceId)
                    .fetch().rowsUpdated()
                    .map(r -> true)
                    .onErrorReturn(false)) // clé dupliquée → détenu par une autre instance
            .onErrorResume(e -> {
                logger.warn("Acquisition du verrou '{}' impossible: {}", name, e.getMessage());
                return Mono.just(false);
            });
    }
}
