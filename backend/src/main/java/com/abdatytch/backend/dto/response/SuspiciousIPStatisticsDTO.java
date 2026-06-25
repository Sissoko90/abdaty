package com.abdatytch.backend.dto.response;

/**
 * DTO de réponse pour les statistiques des IPs suspectes.
 */
public class SuspiciousIPStatisticsDTO {

    private Long totalSuspiciousIPs;
    private Long totalBlockedIPs;
    private Long criticalThreats;
    private Long totalAttempts;

    public SuspiciousIPStatisticsDTO() {}

    // Getters et Setters

    public Long getTotalSuspiciousIPs() {return totalSuspiciousIPs;}

    public void setTotalSuspiciousIPs(Long totalSuspiciousIPs) {this.totalSuspiciousIPs = totalSuspiciousIPs;}

    public Long getTotalBlockedIPs() {return totalBlockedIPs;}

    public void setTotalBlockedIPs(Long totalBlockedIPs) {this.totalBlockedIPs = totalBlockedIPs;}

    public Long getCriticalThreats() {return criticalThreats;}

    public void setCriticalThreats(Long criticalThreats) {this.criticalThreats = criticalThreats;}

    public Long getTotalAttempts() {return totalAttempts;}

    public void setTotalAttempts(Long totalAttempts) {this.totalAttempts = totalAttempts;}
}
