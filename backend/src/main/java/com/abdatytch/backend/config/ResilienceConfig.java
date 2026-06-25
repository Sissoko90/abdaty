package com.abdatytch.backend.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Configuration de la résilience avec Resilience4j.
 * Définit les paramètres pour les circuit breakers, retries et time limiters.
 */
@Configuration
public class ResilienceConfig {

    @Value("${resilience4j.circuitbreaker.instances.default.failure-rate-threshold:}")
    private int failureRateThreshold;

    @Value("${resilience4j.circuitbreaker.instances.default.wait-duration-in-open-state:}")
    private Duration waitDurationInOpenState;

    @Value("${resilience4j.circuitbreaker.instances.default.sliding-window-size:}")
    private int slidingWindowSize;

    @Value("${resilience4j.circuitbreaker.instances.default.minimum-number-of-calls:}")
    private int minimumNumberOfCalls;

    @Value("${resilience4j.circuitbreaker.instances.default.permitted-number-of-calls-in-half-open-state:}")
    private int permittedNumberOfCallsInHalfOpenState;

    @Value("${resilience4j.retry.instances.default.max-attempts:}")
    private int maxAttempts;

    @Value("${resilience4j.retry.instances.default.wait-duration:}")
    private Duration waitDuration;

    @Value("${resilience4j.timelimiter.instances.default.timeout-duration:}")
    private Duration timeoutDuration;

    /**
     * Configure le registry des circuit breakers.
     * Définit les paramètres par défaut: taux d'échec, durée d'ouverture, etc.
     * 
     * @return le CircuitBreakerRegistry configuré
     */
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        // Configuration du circuit breaker
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            // Taux d'échec pour ouvrir le circuit
            .failureRateThreshold(failureRateThreshold)
            // Durée d'attente avant de passer en half-open
            .waitDurationInOpenState(waitDurationInOpenState)
            // Pourcentage d'appels autorisés en half-open
            .slidingWindowType(io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
            .slidingWindowSize(slidingWindowSize)
            // Durée minimale entre deux appels pour le calcul du taux d'échec
            .minimumNumberOfCalls(minimumNumberOfCalls)
            .permittedNumberOfCallsInHalfOpenState(permittedNumberOfCallsInHalfOpenState)
            .slowCallRateThreshold(50)
            .slowCallDurationThreshold(Duration.ofSeconds(5))
            .build();
        
        return CircuitBreakerRegistry.of(config);
    }

    /**
     * Configure le registry des retries.
     * Définit les paramètres par défaut: nombre de tentatives, délai entre tentatives, etc.
     * 
     * @return le RetryRegistry configuré
     */
    @Bean
    public RetryRegistry retryRegistry() {
        // Configuration du retry
        RetryConfig config = RetryConfig.custom()
            // Nombre maximal de tentatives
            .maxAttempts(maxAttempts)
            // Délai entre les tentatives
            .waitDuration(waitDuration)
            // Exceptions qui déclenchent un retry
            .retryExceptions(RuntimeException.class, java.io.IOException.class)
            // Exceptions qui ne déclenchent pas de retry
            .ignoreExceptions(IllegalArgumentException.class)
            .build();
        
        return RetryRegistry.of(config);
    }

    /**
     * Configure le time limiter pour limiter le temps d'exécution des appels.
     * Définit le timeout par défaut.
     * 
     * @return le TimeLimiterConfig configuré
     */
    @Bean
    public TimeLimiterConfig timeLimiterConfig() {
        return TimeLimiterConfig.custom()
            // Timeout
            .timeoutDuration(timeoutDuration)
            .build();
    }
}
