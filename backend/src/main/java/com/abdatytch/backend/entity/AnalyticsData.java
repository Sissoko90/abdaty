package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant les données d'analytics.
 * Stocke les informations géographiques et d'appareil pour le marketing ciblé.
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, status).
 */
@Table("analytics_data")
public class AnalyticsData extends BaseEntity {

    /**
     * Adresse IP de l'utilisateur.
     */
    private String ipAddress;

    /**
     * User-Agent du navigateur.
     */
    private String userAgent;

    /**
     * Informations géographiques (pays, région, ville, etc.) au format JSON.
     */
    private String geoLocation;

    /**
     * Informations sur l'appareil et le navigateur au format JSON.
     */
    private String deviceInfo;

    /**
     * Identifiant de l'utilisateur (si connecté).
     */
    private String userId;

    /**
     * Chemin de la requête.
     */
    private String requestPath;

    /**
     * Méthode HTTP de la requête.
     */
    private String requestMethod;

    /**
     * Référent de la requête.
     */
    private String referer;

    /**
     * Type d'appareil (Mobile, Tablet, Desktop).
     */
    private String deviceType;

    /**
     * Nom du navigateur.
     */
    private String browserName;

    /**
     * Version du navigateur.
     */
    private String browserVersion;

    /**
     * Nom du système d'exploitation.
     */
    private String osName;

    /**
     * Version du système d'exploitation.
     */
    private String osVersion;

    /**
     * Pays.
     */
    private String country;

    /**
     * Code ISO du pays.
     */
    private String countryIsoCode;

    /**
     * Région.
     */
    private String region;

    /**
     * Ville.
     */
    private String city;

    /**
     * ISP/Fournisseur d'accès.
     */
    private String isp;

    /**
     * ASN (Autonomous System Number).
     */
    private Integer asn;

    public AnalyticsData() {}

    public AnalyticsData(String ipAddress, String userAgent) {
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }

    // Getters et Setters

    public String getIpAddress() {return ipAddress;}

    public void setIpAddress(String ipAddress) {this.ipAddress = ipAddress;}

    public String getUserAgent() {return userAgent;}

    public void setUserAgent(String userAgent) {this.userAgent = userAgent;}

    public String getGeoLocation() {return geoLocation;}

    public void setGeoLocation(String geoLocation) {this.geoLocation = geoLocation;}

    public String getDeviceInfo() {return deviceInfo;}

    public void setDeviceInfo(String deviceInfo) {this.deviceInfo = deviceInfo;}

    public String getUserId() {return userId;}


    public void setUserId(String userId) {this.userId = userId;}

    public String getRequestPath() {return requestPath;}

    public void setRequestPath(String requestPath) {this.requestPath = requestPath;}

    public String getRequestMethod() {return requestMethod;}

    public void setRequestMethod(String requestMethod) {this.requestMethod = requestMethod;}

    public String getReferer() {return referer;}

    public void setReferer(String referer) {this.referer = referer;}

    public String getDeviceType() {return deviceType;}

    public void setDeviceType(String deviceType) {this.deviceType = deviceType;}

    public String getBrowserName() {return browserName;}

    public void setBrowserName(String browserName) {this.browserName = browserName;}


    public String getBrowserVersion() {return browserVersion;}

    public void setBrowserVersion(String browserVersion) {this.browserVersion = browserVersion;}

    public String getOsName() {return osName;}


    public void setOsName(String osName) {this.osName = osName;}

    public String getOsVersion() {return osVersion;}

    public void setOsVersion(String osVersion) {this.osVersion = osVersion;}

    public String getCountry() {return country;}

    public void setCountry(String country) {this.country = country;}

    public String getCountryIsoCode() {return countryIsoCode;}

    public void setCountryIsoCode(String countryIsoCode) {this.countryIsoCode = countryIsoCode;}

    public String getRegion() {return region;}

    public void setRegion(String region) {this.region = region;}

    public String getCity() {return city;}

    public void setCity(String city) {this.city = city;}

    public String getIsp() {return isp;}

    public void setIsp(String isp) {this.isp = isp;}

    public Integer getAsn() {return asn;}

    public void setAsn(Integer asn) {this.asn = asn;}
}
