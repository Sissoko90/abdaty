package com.abdatytch.backend.dto.response;

/**
 * DTO de réponse pour les statistiques de logs.
 */
public class LogStatisticsDTO {

    private Long totalLogs;
    private Long errorCount;
    private Long warningCount;
    private Long infoCount;

    public LogStatisticsDTO() {}

    // Getters et Setters

    public Long getTotalLogs() {return totalLogs;}

    public void setTotalLogs(Long totalLogs) {this.totalLogs = totalLogs;}

    public Long getErrorCount() {return errorCount;}

    public void setErrorCount(Long errorCount) {this.errorCount = errorCount;}

    public Long getWarningCount() {return warningCount;}

    public void setWarningCount(Long warningCount) {this.warningCount = warningCount;}

    public Long getInfoCount() {return infoCount;}

    public void setInfoCount(Long infoCount) {this.infoCount = infoCount;}
}
