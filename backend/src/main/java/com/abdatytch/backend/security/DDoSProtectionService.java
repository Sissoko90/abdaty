package com.abdatytch.backend.security;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Service de protection DDoS avec circuit breaker.
 * Protège contre les attaques par déni de service en limitant le nombre de requêtes.
 */
@Service
public class DDoSProtectionService {

    private static final Logger logger = LoggerFactory.getLogger(DDoSProtectionService.class);

    @Value("${security.ddos.circuit.breaker.enabled:true}")
    private boolean ddosCircuitBreakerEnabled;

    @Value("${security.ddos.circuit.breaker.failure.rate:70}")
    private float failureRateThreshold;

    @Value("${security.ddos.circuit.breaker.wait.duration.ms:30000}")
    private long waitDurationMs;

    @Value("${security.ddos.circuit.breaker.request.threshold:1000}")
    private int requestThreshold;

    private CircuitBreakerRegistry circuitBreakerRegistry;
    private CircuitBreaker circuitBreaker;

    public DDoSProtectionService() {
        // Le constructeur est vide, l'initialisation se fait dans @PostConstruct
    }

    @PostConstruct
    public void init() {
        // Configurer le circuit breaker après l'injection des valeurs
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(failureRateThreshold)
            .waitDurationInOpenState(Duration.ofMillis(waitDurationMs))
            .permittedNumberOfCallsInHalfOpenState(3)
            .slidingWindowSize(10)
            .minimumNumberOfCalls(5)
            .build();

        this.circuitBreakerRegistry = CircuitBreakerRegistry.of(config);
        this.circuitBreaker = circuitBreakerRegistry.circuitBreaker("ddosProtection");

        // Ajouter des listeners pour les événements du circuit breaker
        circuitBreaker.getEventPublisher()
            .onStateTransition(event -> {
                logger.info("Circuit breaker DDoS: {} -> {}", 
                    event.getStateTransition().getFromState(),
                    event.getStateTransition().getToState());
            })
            .onFailureRateExceeded(event -> {
                logger.warn("Taux d'échec DDoS dépassé: {}%", event.getFailureRate());
            });

        logger.info("Service de protection DDoS initialisé avec failureRateThreshold: {}%", failureRateThreshold);
    }

    /**
     * Applique le circuit breaker à un Mono.
     * 
     * @param mono le Mono à protéger
     * @param <T> le type du Mono
     * @return le Mono protégé
     */
    public <T> Mono<T> executeWithCircuitBreaker(Mono<T> mono) {
        if (!ddosCircuitBreakerEnabled) {
            return mono;
        }

        return mono.transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
            .doOnError(e -> {
                logger.error("Erreur lors de l'exécution avec circuit breaker DDoS", e);
            });
    }

    /**
     * Obtient l'état actuel du circuit breaker.
     * 
     * @return l'état du circuit breaker
     */
    public CircuitBreaker.State getState() {
        return circuitBreaker.getState();
    }

    /**
     * Réinitialise le circuit breaker.
     */
    public void reset() {
        circuitBreaker.reset();
        logger.info("Circuit breaker DDoS réinitialisé");
    }

    /**
     * Obtient les métriques du circuit breaker.
     * 
     * @return les métriques
     */
    public CircuitBreaker.Metrics getMetrics() {
        return circuitBreaker.getMetrics();
    }
}
