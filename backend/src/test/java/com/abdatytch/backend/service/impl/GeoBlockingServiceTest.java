package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.mapper.IGeoBlockingMapper;
import com.abdatytch.backend.repository.AnalyticsDataRepository;
import com.abdatytch.backend.repository.GeoBlockingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de GeoBlockingService : les statistiques s'appuient sur des
 * SELECT COUNT (dont analyticsDataRepository.count()) et non un findAll() en mémoire.
 */
@ExtendWith(MockitoExtension.class)
class GeoBlockingServiceTest {

    @Mock GeoBlockingRepository geoBlockingRepository;
    @Mock AnalyticsDataRepository analyticsDataRepository;
    @Mock IGeoBlockingMapper geoBlockingMapper;

    GeoBlockingService service;

    @BeforeEach
    void setUp() {
        service = new GeoBlockingService(geoBlockingRepository, analyticsDataRepository, geoBlockingMapper);
    }

    @Test
    void getStatistics_aggregatesViaCountQueries() {
        when(geoBlockingRepository.count()).thenReturn(Mono.just(20L));
        when(geoBlockingRepository.countByAccessStatus("BLOCKED")).thenReturn(Mono.just(5L));
        when(geoBlockingRepository.countByAccessStatus("ALLOWED")).thenReturn(Mono.just(15L));
        when(analyticsDataRepository.count()).thenReturn(Mono.just(1000L));

        StepVerifier.create(service.getStatistics())
            .assertNext(stats -> {
                assertEquals(20L, stats.getTotalCountries().longValue());
                assertEquals(5L, stats.getBlockedCountries().longValue());
                assertEquals(15L, stats.getAllowedCountries().longValue());
                assertEquals(1000L, stats.getTotalRequests().longValue());
            })
            .verifyComplete();

        // Plus de full scan pour compter les analytics.
        verify(analyticsDataRepository, never()).findAll();
    }
}
