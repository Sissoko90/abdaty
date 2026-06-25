package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Consentement cookies d'un visiteur (RGPD). Hérite de BaseEntity.
 * Chaque enregistrement = un choix exprimé via le bandeau cookies.
 */
@Table("cookie_consents")
public class CookieConsent extends BaseEntity {

    /** Identifiant visiteur (UUID généré côté navigateur). */
    private String visitorId;

    /** Cookies essentiels : toujours acceptés. */
    private Boolean necessary;

    /** Cookies de mesure d'audience. */
    private Boolean analytics;

    /** Cookies marketing / publicité. */
    private Boolean marketing;

    /** Cookies de préférences. */
    private Boolean preferences;

    private String ipAddress;
    private String userAgent;
    private String locale;
    private String page;

    public CookieConsent() {
        this.necessary = true;
        this.analytics = false;
        this.marketing = false;
        this.preferences = false;
    }

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

    public String getUserAgent() {return userAgent;}

    public void setUserAgent(String userAgent) {this.userAgent = userAgent;}

    public String getLocale() {return locale;}

    public void setLocale(String locale) {this.locale = locale;}

    public String getPage() {return page;}

    public void setPage(String page) {this.page = page;}
}
