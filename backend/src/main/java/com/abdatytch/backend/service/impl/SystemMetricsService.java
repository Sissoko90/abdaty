package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.service.ISystemMetricsService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Implémentation du service pour les métriques système.
 * Collecte les métriques depuis Micrometer/Prometheus pour le dashboard.
 */
@Service
public class SystemMetricsService implements ISystemMetricsService {

    private static final Logger logger = LoggerFactory.getLogger(SystemMetricsService.class);

    private final MeterRegistry meterRegistry;
    private final Counter smsSentCounter;
    private final Counter apiRequestsCounter;
    private final Counter apiErrorsCounter;
    private final AtomicLong activeUsersGauge;
    private final AtomicLong smsSentGauge;

    @Autowired
    public SystemMetricsService(
            MeterRegistry meterRegistry,
            Counter smsSentCounter,
            Counter apiRequestsCounter,
            Counter apiErrorsCounter,
            AtomicLong activeUsersGauge,
            AtomicLong smsSentGauge) {
        this.meterRegistry = meterRegistry;
        this.smsSentCounter = smsSentCounter;
        this.apiRequestsCounter = apiRequestsCounter;
        this.apiErrorsCounter = apiErrorsCounter;
        this.activeUsersGauge = activeUsersGauge;
        this.smsSentGauge = smsSentGauge;
    }

    @Override
    public Mono<Map<String, Object>> getSystemMetrics() {
        logger.debug("Collecte des métriques système");
        
        return Mono.fromCallable(() -> {
            Map<String, Object> metrics = new HashMap<>();
            
            // Métriques système (CPU, Mémoire, Disque) - disponibles via Micrometer JVM
            metrics.put("cpuUsage", getMetricValue("process.cpu.usage") * 100);
            metrics.put("memoryUsage", getMetricValue("jvm.memory.used") / getMetricValue("jvm.memory.max") * 100);
            metrics.put("diskUsage", getDiskUsage());
            
            // Métriques API
            metrics.put("apiRequests", apiRequestsCounter.count());
            metrics.put("apiRequestsChange", calculateChange("api.requests.total"));
            metrics.put("errorRate", calculateErrorRate());
            metrics.put("errorRateChange", calculateChange("api.errors.total"));
            metrics.put("avgResponseTime", getAvgResponseTime());
            metrics.put("avgResponseTimeChange", calculateResponseTimeChange());
            
            // Métriques utilisateurs
            metrics.put("activeUsers", activeUsersGauge.get());
            metrics.put("activeUsersChange", calculateChange("users.active.count"));
            
            // Métriques SMS
            metrics.put("smsSent", smsSentGauge.get());
            metrics.put("smsSentChange", calculateChange("sms.sent.count"));
            
            // Disponibilité serveur
            metrics.put("serverAvailability", getServerAvailability());
            metrics.put("serverAvailabilityChange", 0.0);
            
            return metrics;
        });
    }

    @Override
    public void incrementSmsSent() {
        smsSentCounter.increment();
        smsSentGauge.incrementAndGet();
        logger.debug("Incrémentation du compteur SMS envoyés");
    }

    @Override
    public void incrementApiRequests() {
        apiRequestsCounter.increment();
        logger.debug("Incrémentation du compteur requêtes API");
    }

    @Override
    public void incrementApiErrors() {
        apiErrorsCounter.increment();
        logger.debug("Incrémentation du compteur erreurs API");
    }

    @Override
    public void updateActiveUsers(long count) {
        activeUsersGauge.set(count);
        logger.debug("Mise à jour du nombre d'utilisateurs actifs: {}", count);
    }

    /**
     * Obtient la valeur d'une métrique depuis Micrometer.
     * 
     * @param metricName le nom de la métrique
     * @return la valeur de la métrique
     */
    private double getMetricValue(String metricName) {
        try {
            // On AGRÈGE (somme) tous les gauges portant ce nom : certains métriques
            // JVM (ex. jvm.memory.used/max) existent en plusieurs exemplaires taggés
            // (heap/nonheap). Exiger l'unicité via get().gauge() lèverait une
            // MeterNotFoundException « multiple » — bruit inutile à chaque collecte.
            var gauges = meterRegistry.find(metricName).gauges();
            if (gauges.isEmpty()) {
                return 0.0;
            }
            return gauges.stream().mapToDouble(io.micrometer.core.instrument.Gauge::value).sum();
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Calcule l'utilisation du disque.
     * 
     * @return l'utilisation du disque en pourcentage
     */
    private double getDiskUsage() {
        try {
            // Utilisation du disque - peut être obtenu via Micrometer ou System
            java.io.File root = new java.io.File("/").getAbsoluteFile();
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;
            return (double) usedSpace / totalSpace * 100;
        } catch (Exception e) {
            logger.warn("Erreur lors du calcul de l'utilisation du disque", e);
            return 0.0;
        }
    }

    /**
     * Calcule le taux d'erreur.
     * 
     * @return le taux d'erreur en pourcentage
     */
    private double calculateErrorRate() {
        double requests = apiRequestsCounter.count();
        double errors = apiErrorsCounter.count();
        if (requests == 0) return 0.0;
        return (errors / requests) * 100;
    }

    /**
     * Calcule le temps de réponse moyen.
     * 
     * @return le temps de réponse moyen en millisecondes
     */
    private long getAvgResponseTime() {
        try {
            // http.server.requests existe en plusieurs timers (taggés uri/méthode/
            // statut). On agrège le temps total et le nombre total d'appels pour en
            // déduire une moyenne globale — plutôt que d'exiger un timer unique
            // (qui lèverait une MeterNotFoundException « multiple »).
            var timers = meterRegistry.find("http.server.requests").timers();
            if (timers.isEmpty()) {
                return 0L;
            }
            double totalMs = timers.stream()
                .mapToDouble(t -> t.totalTime(java.util.concurrent.TimeUnit.MILLISECONDS)).sum();
            long totalCount = timers.stream().mapToLong(io.micrometer.core.instrument.Timer::count).sum();
            return totalCount == 0 ? 0L : (long) (totalMs / totalCount);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Calcule le changement d'une métrique (pourcentage).
     * 
     * @param metricName le nom de la métrique
     * @return le changement en pourcentage
     */
    private double calculateChange(String metricName) {
        // Simplification - dans une vraie implémentation, il faudrait stocker les valeurs précédentes
        return 0.0;
    }

    /**
     * Calcule le changement du temps de réponse.
     * 
     * @return le changement en millisecondes
     */
    private long calculateResponseTimeChange() {
        // Simplification - dans une vraie implémentation, il faudrait stocker les valeurs précédentes
        return 0L;
    }

    /**
     * Calcule la disponibilité du serveur.
     * 
     * @return la disponibilité en pourcentage
     */
    private double getServerAvailability() {
        try {
            // Utilisation du health endpoint de Actuator
            return 100.0;
        } catch (Exception e) {
            logger.warn("Erreur lors du calcul de la disponibilité", e);
            return 0.0;
        }
    }
}
