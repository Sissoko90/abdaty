package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.response.AnalyticsMetricsDTO;
import com.abdatytch.backend.entity.AnalyticsData;
import com.abdatytch.backend.repository.AnalyticsDataRepository;
import com.abdatytch.backend.service.IAnalyticsAggregationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implémentation du service d'agrégation des analytics.
 * Agrège les données d'analytics par période pour les dashboards.
 */
@Service
public class AnalyticsAggregationService implements IAnalyticsAggregationService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsAggregationService.class);

    private final AnalyticsDataRepository analyticsDataRepository;

    @Autowired
    public AnalyticsAggregationService(AnalyticsDataRepository analyticsDataRepository) {
        this.analyticsDataRepository = analyticsDataRepository;
    }

    @Override
    public Mono<AnalyticsMetricsDTO> aggregateAnalytics(LocalDateTime startDate, LocalDateTime endDate, String period) {
        logger.info("Agrégation des analytics du {} au {} pour la période: {}", startDate, endDate, period);
        
        // Fenêtre temporelle filtrée en SQL (index created_at) au lieu d'un full
        // scan + filtrage en mémoire de toute la table analytics_data.
        return analyticsDataRepository.findByCreatedAtBetween(startDate, endDate)
            .collectList()
            .map(analyticsList -> {
                AnalyticsMetricsDTO metrics = new AnalyticsMetricsDTO();
                
                metrics.setTotalRequests((long) analyticsList.size());
                metrics.setUniqueUsers(analyticsList.stream()
                    .filter(data -> data.getUserId() != null)
                    .map(AnalyticsData::getUserId)
                    .distinct()
                    .count());
                
                metrics.setRequestsByCountry(groupByField(analyticsList, AnalyticsData::getCountry));
                metrics.setRequestsByDeviceType(groupByField(analyticsList, AnalyticsData::getDeviceType));
                metrics.setRequestsByBrowser(groupByField(analyticsList, AnalyticsData::getBrowserName));
                metrics.setRequestsByOS(groupByField(analyticsList, AnalyticsData::getOsName));
                metrics.setRequestsByRegion(groupByField(analyticsList, AnalyticsData::getRegion));
                metrics.setRequestsByPath(groupByField(analyticsList, AnalyticsData::getRequestPath));
                metrics.setRequestsByISP(groupByField(analyticsList, AnalyticsData::getIsp));
                
                metrics.setPeriod(period);
                metrics.setStartDate(startDate.toString());
                metrics.setEndDate(endDate.toString());
                
                logger.debug("Métriques agrégées: {}", metrics);
                return metrics;
            });
    }

    @Override
    public Mono<AnalyticsMetricsDTO> aggregateLast24Hours() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusHours(24);
        return aggregateAnalytics(start, now, "24h");
    }

    @Override
    public Mono<AnalyticsMetricsDTO> aggregateLast7Days() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusDays(7);
        return aggregateAnalytics(start, now, "7d");
    }

    @Override
    public Mono<AnalyticsMetricsDTO> aggregateLast30Days() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusDays(30);
        return aggregateAnalytics(start, now, "30d");
    }

    @Override
    public Mono<AnalyticsMetricsDTO> aggregateCurrentMonth() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        return aggregateAnalytics(start, now, "month");
    }

    /**
     * Groupe les données par un champ spécifique.
     * 
     * @param analyticsList la liste des données d'analytics
     * @param fieldExtractor l'extracteur de champ
     * @return une Map avec les comptes par valeur de champ
     */
    private Map<String, Long> groupByField(java.util.List<AnalyticsData> analyticsList, 
            java.util.function.Function<AnalyticsData, String> fieldExtractor) {
        return analyticsList.stream()
            .collect(Collectors.groupingBy(
                data -> fieldExtractor.apply(data) != null ? fieldExtractor.apply(data) : "Unknown",
                Collectors.counting()
            ));
    }
}
