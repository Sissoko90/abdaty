package com.abdatytch.backend.health;

import org.apache.kafka.clients.producer.Producer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.ReactiveHealthIndicator;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;

/**
 * Indicateur de santé de Kafka, intégré à l'agrégat Actuator
 * (/actuator/health → composant « kafka »). La création du producer (bloquante)
 * est déportée sur boundedElastic.
 */
@Component
public class KafkaHealthIndicator implements ReactiveHealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(KafkaHealthIndicator.class);

    private final ProducerFactory<String, Object> producerFactory;

    public KafkaHealthIndicator(ProducerFactory<String, Object> producerFactory) {
        this.producerFactory = producerFactory;
    }

    @Override
    public Mono<Health> health() {
        return Mono.fromCallable(() -> {
            try (Producer<String, Object> producer = producerFactory.createProducer()) {
                producer.partitionsFor("admin-notifications"); // force un aller-retour broker
                return Health.up().withDetail("kafka", "Connected").build();
            } catch (Exception e) {
                logger.warn("Kafka health check failed: {}", e.getMessage());
                return Health.down(e).withDetail("kafka", "unreachable").build();
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        // Le health endpoint doit rester réactif : si le broker est injoignable,
        // partitionsFor() bloque jusqu'à max.block.ms (60 s) → on coupe à 5 s.
        .timeout(Duration.ofSeconds(5))
        .onErrorResume(e -> {
            logger.warn("Kafka health check timeout/erreur: {}", e.getMessage());
            return Mono.just(Health.down(e).withDetail("kafka", "unreachable").build());
        });
    }
}
