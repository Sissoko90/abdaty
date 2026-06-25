package com.abdatytch.backend.dto.response;

/**
 * DTO de réponse pour une IP suspecte.
 */
public class SuspiciousIPDTO {

    private String id;
    private String ipAddress;
    private String city;
    private String region;
    private String country;
    private String countryCode;
    private Double latitude;
    private Double longitude;
    private String isp;
    private String threatLevel;
    private Long attemptCount;
    private java.time.LocalDateTime lastAttempt;
    private String blockStatus;
    private String suspicionReason;
    private String details;

    public SuspiciousIPDTO() {}

    // Getters et Setters

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

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
