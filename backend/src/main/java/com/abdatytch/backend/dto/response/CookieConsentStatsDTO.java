package com.abdatytch.backend.dto.response;

/**
 * Statistiques agrégées des consentements cookies (tableau de bord admin).
 */
public class CookieConsentStatsDTO {

    private Long total;
    private Long analyticsAccepted;
    private Long marketingAccepted;
    private Long preferencesAccepted;
    private Long rejectedAll;
    /** Taux d'acceptation analytics en pourcentage (0-100). */
    private Double analyticsRate;

    public Long getTotal() {return total;}

    public void setTotal(Long total) {this.total = total;}

    public Long getAnalyticsAccepted() {return analyticsAccepted;}

    public void setAnalyticsAccepted(Long analyticsAccepted) {this.analyticsAccepted = analyticsAccepted;}

    public Long getMarketingAccepted() {return marketingAccepted;}

    public void setMarketingAccepted(Long marketingAccepted) {this.marketingAccepted = marketingAccepted;}

    public Long getPreferencesAccepted() {return preferencesAccepted;}

    public void setPreferencesAccepted(Long preferencesAccepted) {this.preferencesAccepted = preferencesAccepted;}

    public Long getRejectedAll() {return rejectedAll;}

    public void setRejectedAll(Long rejectedAll) {this.rejectedAll = rejectedAll;}

    public Double getAnalyticsRate() {return analyticsRate;}

    public void setAnalyticsRate(Double analyticsRate) {this.analyticsRate = analyticsRate;}
}
