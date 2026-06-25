package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant une règle d'alerte.
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, status).
 */
@Table("alert_rules")
public class AlertRule extends BaseEntity {

    /**
     * Nom de la règle d'alerte.
     */
    private String name;

    /**
     * Description de la règle.
     */
    private String description;

    /**
     * Type de métrique (CPU, MEMORY, DISK, ERROR_RATE, RESPONSE_TIME, etc.).
     */
    private String metricType;

    /**
     * Seuil d'alerte.
     */
    private Double threshold;

    /**
     * Opérateur de comparaison (GREATER_THAN, LESS_THAN, EQUAL).
     */
    private String operator;

    /**
     * Durée pendant laquelle le seuil doit être dépassé avant déclenchement (en secondes).
     */
    private Integer duration;

    /**
     * Canaux de notification (EMAIL, SMS, SLACK).
     */
    private String notificationChannels;

    /**
     * Destinataires de l'alerte (emails, numéros SMS, webhooks).
     */
    private String recipients;

    /**
     * Statut de la règle (ENABLED, DISABLED).
     */
    private String ruleStatus;

    /**
     * Dernière fois que l'alerte a été déclenchée.
     */
    private java.time.LocalDateTime lastTriggered;

    /**
     * Nombre de fois que l'alerte a été déclenchée.
     */
    private Long triggerCount;

    /**
     * Cooldown entre deux alertes (en minutes).
     */
    private Integer cooldownMinutes;

    public AlertRule() {}

    // Getters et Setters

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getDescription() {return description;}

    public void setDescription(String description) {this.description = description;}

    public String getMetricType() {return metricType;}

    public void setMetricType(String metricType) {this.metricType = metricType;}

    public Double getThreshold() {return threshold;}

    public void setThreshold(Double threshold) {this.threshold = threshold;}

    public String getOperator() {return operator;}

    public void setOperator(String operator) {this.operator = operator;}

    public Integer getDuration() {return duration;}

    public void setDuration(Integer duration) {this.duration = duration;}

    public String getNotificationChannels() {return notificationChannels;}

    public void setNotificationChannels(String notificationChannels) {this.notificationChannels = notificationChannels;}

    public String getRecipients() {return recipients;}

    public void setRecipients(String recipients) {this.recipients = recipients;}

    public String getRuleStatus() {return ruleStatus;}

    public void setRuleStatus(String ruleStatus) {this.ruleStatus = ruleStatus;}

    public java.time.LocalDateTime getLastTriggered() {return lastTriggered;}

    public void setLastTriggered(java.time.LocalDateTime lastTriggered) {this.lastTriggered = lastTriggered;}

    public Long getTriggerCount() {return triggerCount;}

    public void setTriggerCount(Long triggerCount) {this.triggerCount = triggerCount;}

    public Integer getCooldownMinutes() {return cooldownMinutes;}

    public void setCooldownMinutes(Integer cooldownMinutes) {this.cooldownMinutes = cooldownMinutes;}
}
