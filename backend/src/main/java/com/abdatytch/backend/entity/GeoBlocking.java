package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant les règles de geo-blocking par pays.
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, status).
 */
@Table("geo_blocking")
public class GeoBlocking extends BaseEntity {

    /**
     * Code ISO du pays (ex: ML, FR, US).
     */
    private String countryCode;

    /**
     * Nom du pays (ex: Mali, France, United States).
     */
    private String countryName;

    /**
     * Code du continent (ex: AF, EU, NA, SA, AS, OC, AN).
     */
    private String continentCode;

    /**
     * Nom du continent (ex: Africa, Europe, North America, etc.).
     */
    private String continentName;

    /**
     * Statut d'accès: BLOCKED ou ALLOWED.
     */
    private String accessStatus;

    /**
     * Score de menace (0-10).
     */
    private Integer threatScore;

    /**
     * Nombre de requêtes depuis ce pays.
     */
    private Long requestCount;

    /**
     * Drapeau emoji du pays.
     */
    private String flagEmoji;

    public GeoBlocking() {}

    public GeoBlocking(String countryCode, String countryName) {
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.accessStatus = "ALLOWED";
        this.threatScore = 0;
        this.requestCount = 0L;
    }

    // Getters et Setters

    public String getCountryCode() {return countryCode;}

    public void setCountryCode(String countryCode) {this.countryCode = countryCode;}

    public String getCountryName() {return countryName;}

    public void setCountryName(String countryName) {this.countryName = countryName;}

    public String getContinentCode() {return continentCode;}

    public void setContinentCode(String continentCode) {this.continentCode = continentCode;}

    public String getContinentName() {return continentName;}

    public void setContinentName(String continentName) {this.continentName = continentName;}

    public String getAccessStatus() {return accessStatus;}

    public void setAccessStatus(String accessStatus) {this.accessStatus = accessStatus;}

    public Integer getThreatScore() {return threatScore;}

    public void setThreatScore(Integer threatScore) {this.threatScore = threatScore;}

    public Long getRequestCount() {return requestCount;}

    public void setRequestCount(Long requestCount) {this.requestCount = requestCount;}

    public String getFlagEmoji() {return flagEmoji;}

    public void setFlagEmoji(String flagEmoji) {this.flagEmoji = flagEmoji;}
}
