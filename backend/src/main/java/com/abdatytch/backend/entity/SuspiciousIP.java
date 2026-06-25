package com.abdatytch.backend.entity;

import java.time.LocalDateTime;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant une IP suspecte.
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, status).
 */
@Table("suspicious_ips")
public class SuspiciousIP extends BaseEntity {

    /**
     * Adresse IP suspecte.
     */
    private String ipAddress;

    /**
     * Ville de l'IP.
     */
    private String city;

    /**
     * Région de l'IP.
     */
    private String region;

    /**
     * Pays de l'IP.
     */
    private String country;

    /**
     * Code ISO du pays.
     */
    private String countryCode;

    /**
     * Latitude.
     */
    private Double latitude;

    /**
     * Longitude.
     */
    private Double longitude;

    /**
     * Fournisseur (ISP).
     */
    private String isp;

    /**
     * Niveau de menace (LOW, MEDIUM, HIGH, CRITICAL).
     */
    private String threatLevel;

    /**
     * Nombre de tentatives suspectes.
     */
    private Long attemptCount;

    /**
     * Dernière tentative.
     */
    private LocalDateTime lastAttempt;

    /**
     * Statut de blocage (BLOCKED, NOT_BLOCKED).
     */
    private String blockStatus;

    /**
     * Raison de la suspicion.
     */
    private String suspicionReason;

    /**
     * Détails supplémentaires (JSON).
     */
    private String details;

    public SuspiciousIP() {}

    // Getters et Setters

    public String getIpAddress() {return ipAddress;}

    public void setIpAddress(String ipAddress) {this.ipAddress = ipAddress;}

    public String getCity() {return city;}

    public void setCity(String city) {this.city = city;}

    public String getRegion() {return region;}

    public void setRegion(String region) {this.region = region;}

    public String getCountry() {return country;}

    public void setCountry(String country) {this.country = country;}

    public String getCountryCode() {return countryCode;}

    public void setCountryCode(String countryCode) {this.countryCode = countryCode;}

    public Double getLatitude() {return latitude;}

    public void setLatitude(Double latitude) {this.latitude = latitude;}

    public Double getLongitude() {return longitude;}

    public void setLongitude(Double longitude) {this.longitude = longitude;}

    public String getIsp() {return isp;}

    public void setIsp(String isp) {this.isp = isp;}

    public String getThreatLevel() {return threatLevel;}

    public void setThreatLevel(String threatLevel) {this.threatLevel = threatLevel;}

    public Long getAttemptCount() {return attemptCount;}

    public void setAttemptCount(Long attemptCount) {this.attemptCount = attemptCount;}

    public java.time.LocalDateTime getLastAttempt() {return lastAttempt;}

    public void setLastAttempt(java.time.LocalDateTime lastAttempt) {this.lastAttempt = lastAttempt;}

    public String getBlockStatus() {return blockStatus;}

    public void setBlockStatus(String blockStatus) {this.blockStatus = blockStatus;}

    public String getSuspicionReason() {return suspicionReason;}

    public void setSuspicionReason(String suspicionReason) {this.suspicionReason = suspicionReason;}

    public String getDetails() {return details;}

    public void setDetails(String details) {this.details = details;}
}
