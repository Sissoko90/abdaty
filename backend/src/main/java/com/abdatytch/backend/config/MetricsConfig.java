package com.abdatytch.backend.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Configuration des métriques avec Micrometer et Prometheus.
 * Définit les métriques personnalisées et les timers pour le monitoring.
 */
@Configuration
public class MetricsConfig {

    @Value("${metrics.enabled:true}")
    private boolean metricsEnabled;

    /**
     * Configure un timer personnalisé pour mesurer le temps d'exécution des méthodes.
     * 
     * @param registry le registre des métriques
     * @return un timer configuré
     */
    @Bean
    public Timer methodExecutionTimer(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Timer.builder("method.execution.time")
            .description("Temps d'exécution des méthodes")
            .tag("type", "custom")
            .register(registry);
    }

    /**
     * Configure un timer pour mesurer le temps de réponse des API externes.
     * 
     * @param registry le registre des métriques
     * @return un timer configuré
     */
    @Bean
    public Timer externalApiCallTimer(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Timer.builder("external.api.call.time")
            .description("Temps de réponse des appels API externes")
            .tag("type", "external")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }

    /**
     * Configure un timer pour mesurer le temps d'exécution des requêtes de base de données.
     * 
     * @param registry le registre des métriques
     * @return un timer configuré
     */
    @Bean
    public Timer databaseQueryTimer(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Timer.builder("database.query.time")
            .description("Temps d'exécution des requêtes de base de données")
            .tag("type", "database")
            .publishPercentiles(0.5, 0.95, 0.99)
            .sla(java.time.Duration.ofMillis(100), java.time.Duration.ofMillis(500), java.time.Duration.ofMillis(1000))
            .register(registry);
    }

    /**
     * Configure un compteur pour les SMS envoyés.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter smsSentCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("sms.sent.total")
            .description("Nombre total de SMS envoyés")
            .tag("type", "sms")
            .register(registry);
    }

    /**
     * Configure un compteur pour les requêtes API.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter apiRequestsCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("api.requests.total")
            .description("Nombre total de requêtes API")
            .tag("type", "api")
            .register(registry);
    }

    /**
     * Configure un compteur pour les erreurs API.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter apiErrorsCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("api.errors.total")
            .description("Nombre total d'erreurs API")
            .tag("type", "error")
            .register(registry);
    }

    /**
     * Configure un gauge pour les utilisateurs actifs.
     * 
     * @param registry le registre des métriques
     * @return un AtomicLong pour stocker le nombre d'utilisateurs actifs
     */
    @Bean
    public AtomicLong activeUsersGauge(MeterRegistry registry) {
        if (!metricsEnabled) return new AtomicLong(0);
        AtomicLong activeUsers = new AtomicLong(0);
        Gauge.builder("users.active.count", activeUsers, AtomicLong::get)
            .description("Nombre d'utilisateurs actifs")
            .tag("type", "users")
            .register(registry);
        return activeUsers;
    }

    /**
     * Configure un gauge pour les SMS envoyés.
     * 
     * @param registry le registre des métriques
     * @return un AtomicLong pour stocker le nombre de SMS envoyés
     */
    @Bean
    public AtomicLong smsSentGauge(MeterRegistry registry) {
        if (!metricsEnabled) return new AtomicLong(0);
        AtomicLong smsSent = new AtomicLong(0);
        Gauge.builder("sms.sent.count", smsSent, AtomicLong::get)
            .description("Nombre de SMS envoyés")
            .tag("type", "sms")
            .register(registry);
        return smsSent;
    }

    /**
     * Configure un timer pour les opérations Redis.
     * 
     * @param registry le registre des métriques
     * @return un timer configuré
     */
    @Bean
    public Timer redisOperationTimer(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Timer.builder("redis.operation.time")
            .description("Temps d'exécution des opérations Redis")
            .tag("type", "redis")
            .publishPercentiles(0.5, 0.95, 0.99)
            .sla(java.time.Duration.ofMillis(10), java.time.Duration.ofMillis(50), java.time.Duration.ofMillis(100))
            .register(registry);
    }

    /**
     * Configure un compteur pour les connexions Redis.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter redisConnectionCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("redis.connections.total")
            .description("Nombre total de connexions Redis")
            .tag("type", "redis")
            .register(registry);
    }

    /**
     * Configure un gauge pour les connexions Redis actives.
     * 
     * @param registry le registre des métriques
     * @return un AtomicLong pour stocker le nombre de connexions actives
     */
    @Bean
    public AtomicLong redisConnectionsGauge(MeterRegistry registry) {
        if (!metricsEnabled) return new AtomicLong(0);
        AtomicLong connections = new AtomicLong(0);
        Gauge.builder("redis.connections.active", connections, AtomicLong::get)
            .description("Nombre de connexions Redis actives")
            .tag("type", "redis")
            .register(registry);
        return connections;
    }

    /**
     * Configure un timer pour les opérations Kafka.
     * 
     * @param registry le registre des métriques
     * @return un timer configuré
     */
    @Bean
    public Timer kafkaOperationTimer(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Timer.builder("kafka.operation.time")
            .description("Temps d'exécution des opérations Kafka")
            .tag("type", "kafka")
            .publishPercentiles(0.5, 0.95, 0.99)
            .sla(java.time.Duration.ofMillis(50), java.time.Duration.ofMillis(200), java.time.Duration.ofMillis(500))
            .register(registry);
    }

    /**
     * Configure un compteur pour les messages Kafka produits.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter kafkaMessagesProducedCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("kafka.messages.produced.total")
            .description("Nombre total de messages Kafka produits")
            .tag("type", "kafka")
            .register(registry);
    }

    /**
     * Configure un compteur pour les messages Kafka consommés.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter kafkaMessagesConsumedCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("kafka.messages.consumed.total")
            .description("Nombre total de messages Kafka consommés")
            .tag("type", "kafka")
            .register(registry);
    }

    /**
     * Configure un gauge pour le lag des consommateurs Kafka.
     * 
     * @param registry le registre des métriques
     * @return un AtomicLong pour stocker le lag
     */
    @Bean
    public AtomicLong kafkaConsumerLagGauge(MeterRegistry registry) {
        if (!metricsEnabled) return new AtomicLong(0);
        AtomicLong lag = new AtomicLong(0);
        Gauge.builder("kafka.consumer.lag", lag, AtomicLong::get)
            .description("Lag des consommateurs Kafka")
            .tag("type", "kafka")
            .register(registry);
        return lag;
    }

    /**
     * Configure un compteur pour les connexions base de données.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter databaseConnectionCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("database.connections.total")
            .description("Nombre total de connexions base de données")
            .tag("type", "database")
            .register(registry);
    }

    /**
     * Configure un gauge pour les connexions base de données actives.
     * 
     * @param registry le registre des métriques
     * @return un AtomicLong pour stocker le nombre de connexions actives
     */
    @Bean
    public AtomicLong databaseConnectionsGauge(MeterRegistry registry) {
        if (!metricsEnabled) return new AtomicLong(0);
        AtomicLong connections = new AtomicLong(0);
        Gauge.builder("database.connections.active", connections, AtomicLong::get)
            .description("Nombre de connexions base de données actives")
            .tag("type", "database")
            .register(registry);
        return connections;
    }

    /**
     * Configure un compteur pour les requêtes base de données lentes.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter databaseSlowQueriesCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("database.queries.slow.total")
            .description("Nombre total de requêtes lentes")
            .tag("type", "database")
            .register(registry);
    }

    /**
     * Configure un timer pour les opérations Vault.
     * 
     * @param registry le registre des métriques
     * @return un timer configuré
     */
    @Bean
    public Timer vaultOperationTimer(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Timer.builder("vault.operation.time")
            .description("Temps d'exécution des opérations Vault")
            .tag("type", "vault")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }

    /**
     * Configure un compteur pour les requêtes Vault.
     * 
     * @param registry le registre des métriques
     * @return un compteur configuré
     */
    @Bean
    public Counter vaultRequestsCounter(MeterRegistry registry) {
        if (!metricsEnabled) return null;
        return Counter.builder("vault.requests.total")
            .description("Nombre total de requêtes Vault")
            .tag("type", "vault")
            .register(registry);
    }
}
