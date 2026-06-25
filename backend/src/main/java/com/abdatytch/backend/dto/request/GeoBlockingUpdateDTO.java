package com.abdatytch.backend.dto.request;

/**
 * DTO de requête pour la mise à jour des règles de geo-blocking.
 */
public class GeoBlockingUpdateDTO {

    private String countryCode;
    private String continentCode;
    private String accessStatus; // BLOCKED ou ALLOWED
    private Integer threatScore;

    public GeoBlockingUpdateDTO() {}

    // Getters et Setters

    public String getCountryCode() {return countryCode;}

    public void setCountryCode(String countryCode) {this.countryCode = countryCode;}


    public String getContinentCode() {return continentCode;}

    public void setContinentCode(String continentCode) {this.continentCode = continentCode;}

    public String getAccessStatus() {return accessStatus;}

    public void setAccessStatus(String accessStatus) {this.accessStatus = accessStatus;}


    public Integer getThreatScore() {return threatScore;}

    public void setThreatScore(Integer threatScore) {this.threatScore = threatScore;}
}
