package com.abdatytch.backend.scheduler;

import com.abdatytch.backend.entity.TimeSeriesMetrics;
import com.abdatytch.backend.repository.TimeSeriesMetricsRepository;
import com.abdatytch.backend.service.ISystemMetricsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Scheduler pour la collecte des métriques temporelles.
 * Collecte périodiquement les métriques système pour l'historique et les graphiques.
 */
@Component
public class MetricsCollectionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(MetricsCollectionScheduler.class);

    private final ISystemMetricsService systemMetricsService;
    private final TimeSeriesMetricsRepository timeSeriesMetricsRepository;
    private final ReactiveDistributedLock lock;

    @Autowired
    public MetricsCollectionScheduler(
            ISystemMetricsService systemMetricsService,
            TimeSeriesMetricsRepository timeSeriesMetricsRepository,
            ReactiveDistributedLock lock) {
        this.systemMetricsService = systemMetricsService;
        this.timeSeriesMetricsRepository = timeSeriesMetricsRepository;
        this.lock = lock;
    }

    /**
     * Collecte les métriques toutes les minutes.
     */
    @Scheduled(fixedRate = 60000) // Toutes les 60 secondes
    public void collectMetrics() {
        logger.debug("Collecte des métriques temporelles");
        
        lock.tryAcquire("metrics-collect", java.time.Duration.ofSeconds(55))
            .filter(Boolean::booleanValue)
            .flatMap(acquired -> systemMetricsService.getSystemMetrics())
            .map(metrics -> {
                TimeSeriesMetrics timeSeriesMetrics = new TimeSeriesMetrics();
                timeSeriesMetrics.setTimestamp(LocalDateTime.now());
                timeSeriesMetrics.setCpuUsage(getDoubleValue(metrics, "cpuUsage"));
                timeSeriesMetrics.setMemoryUsage(getDoubleValue(metrics, "memoryUsage"));
                timeSeriesMetrics.setDiskUsage(getDoubleValue(metrics, "diskUsage"));
                timeSeriesMetrics.setApiRequests(getLongValue(metrics, "apiRequests"));
                timeSeriesMetrics.setErrorRate(getDoubleValue(metrics, "errorRate"));
                timeSeriesMetrics.setAvgResponseTime(getLongValue(metrics, "avgResponseTime"));
                timeSeriesMetrics.setActiveUsers(getLongValue(metrics, "activeUsers"));
                timeSeriesMetrics.setSmsSent(getLongValue(metrics, "smsSent"));
                timeSeriesMetrics.setServerAvailability(getDoubleValue(metrics, "serverAvailability"));
                
                return timeSeriesMetrics;
            })
            .flatMap(timeSeriesMetricsRepository::save)
            .subscribe(
                saved -> logger.debug("Métriques temporelles enregistrées"),
                error -> logger.error("Erreur lors de la collecte des métriques", error)
            );
    }

    /**
     * Nettoie les anciennes métriques (plus de 30 jours).
     */
    @Scheduled(cron = "0 0 2 * * ?") // Tous les jours à 2h du matin
    public void cleanupOldMetrics() {
        logger.info("Nettoyage des anciennes métriques");
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        lock.tryAcquire("metrics-cleanup", java.time.Duration.ofMinutes(10))
            .filter(Boolean::booleanValue)
            .flatMap(acquired -> timeSeriesMetricsRepository.deleteByTimestampBefore(thirtyDaysAgo))
            .subscribe(
                deleted -> logger.info("Anciennes métriques supprimées: {}", deleted),
                error -> logger.error("Erreur lors du nettoyage des métriques", error)
            );
    }

    /**
     * Extrait une valeur Double d'une Map.
     * 
     * @param map la Map
     * @param key la clé
     * @return la valeur Double ou null
     */
    private Double getDoubleValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return null;
    }

    /**
     * Extrait une valeur Long d'une Map.
     * 
     * @param map la Map
     * @param key la clé
     * @return la valeur Long ou null
     */
    private Long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return null;
    }
}
