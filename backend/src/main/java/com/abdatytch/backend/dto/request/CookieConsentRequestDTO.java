package com.abdatytch.backend.dto.request;

/**
 * Charge utile d'enregistrement d'un consentement cookies (endpoint public).
 */
public class CookieConsentRequestDTO {

    /** Identifiant visiteur (UUID généré côté navigateur). */
    private String visitorId;
    private Boolean analytics;
    private Boolean marketing;
    private Boolean preferences;
    private String locale;
    private String page;

    public String getVisitorId() {return visitorId;}

    public void setVisitorId(String visitorId) {this.visitorId = visitorId;}

    public Boolean getAnalytics() {return analytics;}

    public void setAnalytics(Boolean analytics) {this.analytics = analytics;}

    public Boolean getMarketing() {return marketing;}

    public void setMarketing(Boolean marketing) {this.marketing = marketing;}

    public Boolean getPreferences() {return preferences;}

    public void setPreferences(Boolean preferences) {this.preferences = preferences;}

    public String getLocale() {return locale;}

    public void setLocale(String locale) {this.locale = locale;}

    public String getPage() {return page;}

    public void setPage(String page) {this.page = page;}
}
