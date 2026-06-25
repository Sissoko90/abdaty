package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.entity.TimeSeriesMetrics;
import com.abdatytch.backend.repository.TimeSeriesMetricsRepository;
import com.abdatytch.backend.service.ITrendAnalysisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Implémentation du service pour l'analyse de tendances.
 * Analyse les métriques temporelles pour détecter les tendances et anomalies.
 */
@Service
public class TrendAnalysisService implements ITrendAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(TrendAnalysisService.class);

    private final TimeSeriesMetricsRepository timeSeriesMetricsRepository;

    @Autowired
    public TrendAnalysisService(TimeSeriesMetricsRepository timeSeriesMetricsRepository) {
        this.timeSeriesMetricsRepository = timeSeriesMetricsRepository;
    }

    @Override
    public Mono<String> analyzeTrend(String metricName, LocalDateTime startDate, LocalDateTime endDate) {
        logger.debug("Analyse de tendance pour la métrique: {}", metricName);
        
        return timeSeriesMetricsRepository.findByTimestampBetween(startDate, endDate)
            .collectList()
            .map(metrics -> {
                if (metrics.isEmpty()) {
                    return "STABLE";
                }
                
                double[] values = extractMetricValues(metrics, metricName);
                if (values.length < 2) {
                    return "STABLE";
                }
                
                // Calculer la tendance avec une régression linéaire simple
                double trend = calculateSimpleTrend(values);
                
                if (trend > 0.1) {
                    return "UP";
                } else if (trend < -0.1) {
                    return "DOWN";
                } else {
                    return "STABLE";
                }
            });
    }

    @Override
    public Mono<Double> calculateAverage(String metricName, LocalDateTime startDate, LocalDateTime endDate) {
        logger.debug("Calcul de la moyenne pour la métrique: {}", metricName);
        
        return timeSeriesMetricsRepository.findByTimestampBetween(startDate, endDate)
            .map(metric -> extractMetricValue(metric, metricName))
            .filter(value -> value != null)
            .collectList()
            .map(values -> {
                if (values.isEmpty()) return 0.0;
                return values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            });
    }

    @Override
    public Mono<Map<String, Object>> detectAnomalies(String metricName, double threshold) {
        logger.debug("Détection d'anomalies pour la métrique: {}", metricName);
        
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        
        return timeSeriesMetricsRepository.findByTimestampAfter(oneHourAgo)
            .collectList()
            .map(metrics -> {
                Map<String, Object> anomalies = new HashMap<>();
                
                // Calculer la moyenne et l'écart-type
                double[] values = extractMetricValues(metrics, metricName);
                if (values.length < 2) {
                    anomalies.put("anomalies", 0);
                    anomalies.put("details", "Not enough data");
                    return anomalies;
                }
                
                double mean = calculateMean(values);
                double stdDev = calculateStdDev(values, mean);
                
                // Détecter les valeurs au-delà de 2 écarts-types
                int anomalyCount = 0;
                for (int i = 0; i < values.length; i++) {
                    if (Math.abs(values[i] - mean) > 2 * stdDev && Math.abs(values[i] - mean) > threshold) {
                        anomalyCount++;
                    }
                }
                
                anomalies.put("anomalies", anomalyCount);
                anomalies.put("mean", mean);
                anomalies.put("stdDev", stdDev);
                
                return anomalies;
            });
    }

    @Override
    public Mono<Map<String, Object>> predictValues(String metricName, int periods) {
        logger.debug("Prédiction des valeurs pour la métrique: {} - Périodes: {}", metricName, periods);
        
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        
        return timeSeriesMetricsRepository.findByTimestampAfter(oneDayAgo)
            .collectList()
            .map(metrics -> {
                Map<String, Object> prediction = new HashMap<>();
                
                double[] values = extractMetricValues(metrics, metricName);
                if (values.length < 2) {
                    prediction.put("predicted", new double[periods]);
                    prediction.put("error", "Not enough data for prediction");
                    return prediction;
                }
                
                // Prédiction simple basée sur la moyenne mobile
                double movingAverage = calculateMovingAverage(values, 5);
                double[] predictions = new double[periods];
                
                for (int i = 0; i < periods; i++) {
                    predictions[i] = movingAverage; // Simplification
                }
                
                prediction.put("predicted", predictions);
                prediction.put("method", "moving_average");
                
                return prediction;
            });
    }

    @Override
    public Mono<Map<String, Object>> getTrendsSummary() {
        logger.debug("Récupération du résumé des tendances");
        
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        
        return timeSeriesMetricsRepository.findByTimestampAfter(oneHourAgo)
            .collectList()
            .map(metrics -> {
                Map<String, Object> summary = new HashMap<>();
                
                if (metrics.isEmpty()) {
                    summary.put("status", "no_data");
                    return summary;
                }
                
                summary.put("cpuTrend", analyzeTrendOnData(metrics, "cpuUsage"));
                summary.put("memoryTrend", analyzeTrendOnData(metrics, "memoryUsage"));
                summary.put("errorRateTrend", analyzeTrendOnData(metrics, "errorRate"));
                summary.put("responseTimeTrend", analyzeTrendOnData(metrics, "avgResponseTime"));
                
                summary.put("status", "ok");
                
                return summary;
            });
    }

    /**
     * Extrait les valeurs d'une métrique d'une liste de TimeSeriesMetrics.
     * 
     * @param metrics la liste des métriques
     * @param metricName le nom de la métrique
     * @return les valeurs
     */
    private double[] extractMetricValues(java.util.List<TimeSeriesMetrics> metrics, String metricName) {
        return metrics.stream()
            .mapToDouble(m -> extractMetricValue(m, metricName))
            .toArray();
    }

    /**
     * Extrait la valeur d'une métrique d'un TimeSeriesMetrics.
     * 
     * @param metric le métrique
     * @param metricName le nom de la métrique
     * @return la valeur
     */
    private double extractMetricValue(TimeSeriesMetrics metric, String metricName) {
        switch (metricName) {
            case "cpuUsage": return metric.getCpuUsage() != null ? metric.getCpuUsage() : 0;
            case "memoryUsage": return metric.getMemoryUsage() != null ? metric.getMemoryUsage() : 0;
            case "diskUsage": return metric.getDiskUsage() != null ? metric.getDiskUsage() : 0;
            case "apiRequests": return metric.getApiRequests() != null ? metric.getApiRequests() : 0;
            case "errorRate": return metric.getErrorRate() != null ? metric.getErrorRate() : 0;
            case "avgResponseTime": return metric.getAvgResponseTime() != null ? metric.getAvgResponseTime() : 0;
            case "activeUsers": return metric.getActiveUsers() != null ? metric.getActiveUsers() : 0;
            case "smsSent": return metric.getSmsSent() != null ? metric.getSmsSent() : 0;
            case "serverAvailability": return metric.getServerAvailability() != null ? metric.getServerAvailability() : 0;
            default: return 0;
        }
    }

    /**
     * Calcule une tendance simple.
     * 
     * @param values les valeurs
     * @return la tendance
     */
    private double calculateSimpleTrend(double[] values) {
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        int n = values.length;
        
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumX2 += i * i;
        }
        
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    /**
     * Calcule la moyenne.
     * 
     * @param values les valeurs
     * @return la moyenne
     */
    private double calculateMean(double[] values) {
        return java.util.Arrays.stream(values).average().orElse(0);
    }

    /**
     * Calcule l'écart-type.
     * 
     * @param values les valeurs
     * @param mean la moyenne
     * @return l'écart-type
     */
    private double calculateStdDev(double[] values, double mean) {
        double variance = java.util.Arrays.stream(values)
            .map(v -> Math.pow(v - mean, 2))
            .average()
            .orElse(0);
        return Math.sqrt(variance);
    }

    /**
     * Calcule la moyenne mobile.
     * 
     * @param values les valeurs
     * @param window la taille de la fenêtre
     * @return la moyenne mobile
     */
    private double calculateMovingAverage(double[] values, int window) {
        if (values.length < window) {
            return calculateMean(values);
        }
        
        double sum = 0;
        for (int i = values.length - window; i < values.length; i++) {
            sum += values[i];
        }
        return sum / window;
    }

    /**
     * Analyse la tendance sur les données.
     * 
     * @param metrics les métriques
     * @param metricName le nom de la métrique
     * @return la tendance
     */
    private String analyzeTrendOnData(java.util.List<TimeSeriesMetrics> metrics, String metricName) {
        double[] values = extractMetricValues(metrics, metricName);
        if (values.length < 2) return "STABLE";
        
        double trend = calculateSimpleTrend(values);
        if (trend > 0.01) return "UP";
        else if (trend < -0.01) return "DOWN";
        else return "STABLE";
    }
}
