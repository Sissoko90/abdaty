package com.abdatytch.backend.dto.response;

import java.util.Map;

/**
 * DTO de réponse pour les métriques d'analytics agrégées.
 */
public class AnalyticsMetricsDTO {

    private Long totalRequests;
    private Long uniqueUsers;
    private Map<String, Long> requestsByCountry;
    private Map<String, Long> requestsByDeviceType;
    private Map<String, Long> requestsByBrowser;
    private Map<String, Long> requestsByOS;
    private Map<String, Long> requestsByRegion;
    private Map<String, Long> requestsByPath;
    private Map<String, Long> requestsByISP;
    private String period;
    private String startDate;
    private String endDate;

    public AnalyticsMetricsDTO() {}

    // Getters et Setters

    public Long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(Long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public Long getUniqueUsers() {
        return uniqueUsers;
    }

    public void setUniqueUsers(Long uniqueUsers) {
        this.uniqueUsers = uniqueUsers;
    }

    public Map<String, Long> getRequestsByCountry() {
        return requestsByCountry;
    }

    public void setRequestsByCountry(Map<String, Long> requestsByCountry) {
        this.requestsByCountry = requestsByCountry;
    }

    public Map<String, Long> getRequestsByDeviceType() {
        return requestsByDeviceType;
    }

    public void setRequestsByDeviceType(Map<String, Long> requestsByDeviceType) {
        this.requestsByDeviceType = requestsByDeviceType;
    }

    public Map<String, Long> getRequestsByBrowser() {
        return requestsByBrowser;
    }

    public void setRequestsByBrowser(Map<String, Long> requestsByBrowser) {
        this.requestsByBrowser = requestsByBrowser;
    }

    public Map<String, Long> getRequestsByOS() {
        return requestsByOS;
    }

    public void setRequestsByOS(Map<String, Long> requestsByOS) {
        this.requestsByOS = requestsByOS;
    }

    public Map<String, Long> getRequestsByRegion() {
        return requestsByRegion;
    }

    public void setRequestsByRegion(Map<String, Long> requestsByRegion) {
        this.requestsByRegion = requestsByRegion;
    }

    public Map<String, Long> getRequestsByPath() {
        return requestsByPath;
    }

    public void setRequestsByPath(Map<String, Long> requestsByPath) {
        this.requestsByPath = requestsByPath;
    }

    public Map<String, Long> getRequestsByISP() {
        return requestsByISP;
    }

    public void setRequestsByISP(Map<String, Long> requestsByISP) {
        this.requestsByISP = requestsByISP;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
