package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant des métriques temporelles pour l'historique.
 * Stocke les métriques système à intervalles réguliers pour l'affichage de graphiques.
 */
@Table("time_series_metrics")
public class TimeSeriesMetrics extends BaseEntity {

    /**
     * Timestamp de la mesure.
     */
    private java.time.LocalDateTime timestamp;

    /**
     * Utilisation CPU (%).
     */
    private Double cpuUsage;

    /**
     * Utilisation mémoire (%).
     */
    private Double memoryUsage;

    /**
     * Utilisation disque (%).
     */
    private Double diskUsage;

    /**
     * Nombre de requêtes API.
     */
    private Long apiRequests;

    /**
     * Taux d'erreur (%).
     */
    private Double errorRate;

    /**
     * Temps de réponse moyen (ms).
     */
    private Long avgResponseTime;

    /**
     * Nombre d'utilisateurs actifs.
     */
    private Long activeUsers;

    /**
     * Nombre de SMS envoyés.
     */
    private Long smsSent;

    /**
     * Disponibilité serveur (%).
     */
    private Double serverAvailability;

    public TimeSeriesMetrics() {}

    // Getters et Setters

    public java.time.LocalDateTime getTimestamp() {return timestamp;}

    public void setTimestamp(java.time.LocalDateTime timestamp) {this.timestamp = timestamp;}

    public Double getCpuUsage() {return cpuUsage;}

    public void setCpuUsage(Double cpuUsage) {this.cpuUsage = cpuUsage;}

    public Double getMemoryUsage() {return memoryUsage;}

    public void setMemoryUsage(Double memoryUsage) {this.memoryUsage = memoryUsage;}

    public Double getDiskUsage() {return diskUsage;}

    public void setDiskUsage(Double diskUsage) {this.diskUsage = diskUsage;}

    public Long getApiRequests() {return apiRequests;}

    public void setApiRequests(Long apiRequests) {this.apiRequests = apiRequests;}

    public Double getErrorRate() {return errorRate;}

    public void setErrorRate(Double errorRate) {this.errorRate = errorRate;}

    public Long getAvgResponseTime() {return avgResponseTime;}

    public void setAvgResponseTime(Long avgResponseTime) {this.avgResponseTime = avgResponseTime;}

    public Long getActiveUsers() {return activeUsers;}

    public void setActiveUsers(Long activeUsers) {this.activeUsers = activeUsers;}

    public Long getSmsSent() {return smsSent;}

    public void setSmsSent(Long smsSent) {this.smsSent = smsSent;}

    public Double getServerAvailability() {return serverAvailability;}

    public void setServerAvailability(Double serverAvailability) {this.serverAvailability = serverAvailability;}
}
