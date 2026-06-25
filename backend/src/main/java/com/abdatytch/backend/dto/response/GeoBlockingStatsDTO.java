package com.abdatytch.backend.dto.response;

/**
 * DTO de réponse pour les statistiques de geo-blocking.
 */
public class GeoBlockingStatsDTO {

    private Long totalCountries;
    private Long blockedCountries;
    private Long allowedCountries;
    private Long totalRequests;

    public GeoBlockingStatsDTO() {}

    // Getters et Setters

    public Long getTotalCountries() {return totalCountries;}

    public void setTotalCountries(Long totalCountries) {this.totalCountries = totalCountries;}

    public Long getBlockedCountries() {return blockedCountries;}


    public void setBlockedCountries(Long blockedCountries) {this.blockedCountries = blockedCountries;}

    public Long getAllowedCountries() {return allowedCountries;}

    public void setAllowedCountries(Long allowedCountries) {this.allowedCountries = allowedCountries;}

    public Long getTotalRequests() {return totalRequests;}

    public void setTotalRequests(Long totalRequests) {this.totalRequests = totalRequests;}
}
