package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * Représentation d'un consentement cookies renvoyée au frontend admin.
 */
public class CookieConsentDTO {

    private String id;
    private String visitorId;
    private Boolean necessary;
    private Boolean analytics;
    private Boolean marketing;
    private Boolean preferences;
    private String ipAddress;
    private String locale;
    private String page;
    private LocalDateTime createdAt;

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getVisitorId() {return visitorId;}

    public void setVisitorId(String visitorId) {this.visitorId = visitorId;}

    public Boolean getNecessary() {return necessary;}

    public void setNecessary(Boolean necessary) {this.necessary = necessary;}

    public Boolean getAnalytics() {return analytics;}

    public void setAnalytics(Boolean analytics) {this.analytics = analytics;}

    public Boolean getMarketing() {return marketing;}

    public void setMarketing(Boolean marketing) {this.marketing = marketing;}

    public Boolean getPreferences() {return preferences;}

    public void setPreferences(Boolean preferences) {this.preferences = preferences;}

    public String getIpAddress() {return ipAddress;}

    public void setIpAddress(String ipAddress) {this.ipAddress = ipAddress;}

    public String getLocale() {return locale;}

    public void setLocale(String locale) {this.locale = locale;}

    public String getPage() {return page;}

    public void setPage(String page) {this.page = page;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
