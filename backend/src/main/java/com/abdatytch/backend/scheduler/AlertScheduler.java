package com.abdatytch.backend.scheduler;

import com.abdatytch.backend.entity.AlertRule;
import com.abdatytch.backend.repository.AlertRuleRepository;
import com.abdatytch.backend.service.IAlertService;
import com.abdatytch.backend.service.ISystemMetricsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Scheduler pour vérifier les seuils de métriques et déclencher les alertes.
 * Exécute périodiquement les vérifications des règles d'alerte configurées.
 */
@Component
public class AlertScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AlertScheduler.class);

    private final AlertRuleRepository alertRuleRepository;
    private final ISystemMetricsService systemMetricsService;
    private final IAlertService alertService;
    private final com.abdatytch.backend.event.NotificationEventPublisher notificationPublisher;

    private final ReactiveDistributedLock lock;

    @Autowired
    public AlertScheduler(
            AlertRuleRepository alertRuleRepository,
            ISystemMetricsService systemMetricsService,
            IAlertService alertService,
            com.abdatytch.backend.event.NotificationEventPublisher notificationPublisher,
            ReactiveDistributedLock lock) {
        this.alertRuleRepository = alertRuleRepository;
        this.systemMetricsService = systemMetricsService;
        this.alertService = alertService;
        this.notificationPublisher = notificationPublisher;
        this.lock = lock;
    }

    /**
     * Vérifie les seuils de métriques toutes les minutes.
     */
    @Scheduled(fixedRate = 60000) // Toutes les 60 secondes
    public void checkMetricThresholds() {
        logger.debug("Vérification des seuils de métriques");
        
        lock.tryAcquire("alert-check", java.time.Duration.ofSeconds(55))
            .filter(Boolean::booleanValue)
            .flatMapMany(acquired -> alertRuleRepository.findByRuleStatus("ENABLED"))
            .flatMap(alertRule -> {
                return systemMetricsService.getSystemMetrics()
                    .map(metrics -> {
                        if (checkAlertRule(alertRule, metrics)) {
                            triggerAlert(alertRule, metrics).subscribe();
                        }
                        return null;
                    });
            })
            .collectList()
            .subscribe(
                result -> logger.debug("Vérification des seuils terminée"),
                error -> logger.error("Erreur lors de la vérification des seuils", error)
            );
    }

    /**
     * Vérifie si une règle d'alerte doit être déclenchée.
     * 
     * @param alertRule la règle d'alerte
     * @param metrics les métriques actuelles
     * @return true si l'alerte doit être déclenchée
     */
    private boolean checkAlertRule(AlertRule alertRule, Map<String, Object> metrics) {
        // Vérifier le cooldown
        if (alertRule.getLastTriggered() != null && alertRule.getCooldownMinutes() != null) {
            LocalDateTime cooldownExpiry = alertRule.getLastTriggered().plusMinutes(alertRule.getCooldownMinutes());
            if (LocalDateTime.now().isBefore(cooldownExpiry)) {
                return false;
            }
        }

        String metricType = alertRule.getMetricType();
        Double threshold = alertRule.getThreshold();
        String operator = alertRule.getOperator();
        
        Object metricValue = metrics.get(metricType);
        if (metricValue == null) {
            logger.warn("Métrique non trouvée: {}", metricType);
            return false;
        }

        double currentValue;
        if (metricValue instanceof Number) {
            currentValue = ((Number) metricValue).doubleValue();
        } else {
            logger.warn("Type de métrique invalide: {}", metricValue.getClass());
            return false;
        }

        boolean shouldAlert = false;
        switch (operator.toUpperCase()) {
            case "GREATER_THAN":
                shouldAlert = currentValue > threshold;
                break;
            case "LESS_THAN":
                shouldAlert = currentValue < threshold;
                break;
            case "EQUAL":
                shouldAlert = currentValue == threshold;
                break;
            default:
                logger.warn("Opérateur invalide: {}", operator);
        }

        if (shouldAlert) {
            logger.info("Seuil dépassé - Métrique: {}, Valeur actuelle: {}, Seuil: {}, Opérateur: {}", 
                metricType, currentValue, threshold, operator);
        }

        return shouldAlert;
    }

    /**
     * Déclenche une alerte.
     * 
     * @param alertRule la règle d'alerte
     * @param metrics les métriques actuelles
     * @return un Mono vide
     */
    private Mono<Void> triggerAlert(AlertRule alertRule, Map<String, Object> metrics) {
        logger.info("Déclenchement de l'alerte: {}", alertRule.getName());
        
        // Mettre à jour la règle d'alerte
        alertRule.setLastTriggered(LocalDateTime.now());
        alertRule.setTriggerCount((alertRule.getTriggerCount() != null ? alertRule.getTriggerCount() : 0L) + 1);
        
        return alertRuleRepository.save(alertRule)
            .flatMap(savedRule -> {
                // Construire le message d'alerte
                String message = buildAlertMessage(savedRule, metrics);

                // Notification push temps réel vers les panels admin (via Kafka → WS).
                notificationPublisher.publish(new com.abdatytch.backend.event.NotificationEvent(
                    "ALERT",
                    "Alerte : " + savedRule.getName(),
                    message,
                    "/admin/alerts",
                    System.currentTimeMillis()));

                // Envoyer l'alerte (canaux configurés : email, etc.)
                return alertService.sendAlert(
                    savedRule.getNotificationChannels(),
                    savedRule.getRecipients(),
                    "ALERTE: " + savedRule.getName(),
                    message
                );
            });
    }

    /**
     * Construit le message d'alerte.
     * 
     * @param alertRule la règle d'alerte
     * @param metrics les métriques actuelles
     * @return le message d'alerte
     */
    private String buildAlertMessage(AlertRule alertRule, Map<String, Object> metrics) {
        StringBuilder message = new StringBuilder();
        message.append("<h2>").append(alertRule.getName()).append("</h2>");
        message.append("<p><strong>Description:</strong> ").append(alertRule.getDescription()).append("</p>");
        message.append("<p><strong>Métrique:</strong> ").append(alertRule.getMetricType()).append("</p>");
        message.append("<p><strong>Valeur actuelle:</strong> ").append(metrics.get(alertRule.getMetricType())).append("</p>");
        message.append("<p><strong>Seuil:</strong> ").append(alertRule.getThreshold()).append("</p>");
        message.append("<p><strong>Heure:</strong> ").append(LocalDateTime.now()).append("</p>");
        
        return message.toString();
    }
}
