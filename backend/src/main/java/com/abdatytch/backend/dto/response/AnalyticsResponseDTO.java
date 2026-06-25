package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour les données d'analytics.
 */
public class AnalyticsResponseDTO {

    private String id;
    private String ipAddress;
    private String userAgent;
    private String userId;
    private String requestPath;
    private String requestMethod;
    private String referer;
    private String deviceType;
    private String browserName;
    private String browserVersion;
    private String osName;
    private String osVersion;
    private String country;
    private String countryIsoCode;
    private String region;
    private String city;
    private String isp;
    private Integer asn;
    private LocalDateTime createdAt;

    public AnalyticsResponseDTO() {}

    // Getters et Setters

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}


    public String getIpAddress() {return ipAddress;}


    public void setIpAddress(String ipAddress) {this.ipAddress = ipAddress;}

    public String getUserAgent() {return userAgent;}

    public void setUserAgent(String userAgent) {this.userAgent = userAgent;}

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

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
