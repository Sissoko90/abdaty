package com.abdatytch.backend.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires du compteur anti-bruteforce (Redis) : seuil de blocage et
 * pose d'expiration à la première tentative.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RedisLoginAttemptServiceTest {

    @Mock ReactiveRedisTemplate<String, Long> redisTemplate;
    @Mock ReactiveValueOperations<String, Long> valueOps;

    RedisLoginAttemptService service;

    @BeforeEach
    void setUp() {
        service = new RedisLoginAttemptService(redisTemplate);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    void shouldBlockIP_trueWhenAttemptsReachThreshold() {
        when(valueOps.get(anyString())).thenReturn(Mono.just(5L));

        StepVerifier.create(service.shouldBlockIP("1.2.3.4", 5))
            .expectNext(true)
            .verifyComplete();
    }

    @Test
    void shouldBlockIP_falseBelowThreshold() {
        when(valueOps.get(anyString())).thenReturn(Mono.just(2L));

        StepVerifier.create(service.shouldBlockIP("1.2.3.4", 5))
            .expectNext(false)
            .verifyComplete();
    }

    @Test
    void shouldBlockIP_falseWhenNoAttempts() {
        when(valueOps.get(anyString())).thenReturn(Mono.empty()); // defaultIfEmpty(0)

        StepVerifier.create(service.shouldBlockIP("1.2.3.4", 5))
            .expectNext(false)
            .verifyComplete();
    }

    @Test
    void incrementLoginAttempt_firstAttempt_setsExpiration() {
        when(valueOps.increment(anyString())).thenReturn(Mono.just(1L));
        when(redisTemplate.expire(anyString(), any(Duration.class))).thenReturn(Mono.just(true));

        StepVerifier.create(service.incrementLoginAttempt("1.2.3.4"))
            .expectNext(1L)
            .verifyComplete();

        verify(redisTemplate).expire(anyString(), any(Duration.class));
    }

    @Test
    void incrementLoginAttempt_subsequentAttempt_noExpiration() {
        when(valueOps.increment(anyString())).thenReturn(Mono.just(3L));

        StepVerifier.create(service.incrementLoginAttempt("1.2.3.4"))
            .expectNext(3L)
            .verifyComplete();

        verify(redisTemplate, never()).expire(anyString(), any(Duration.class));
    }
}
