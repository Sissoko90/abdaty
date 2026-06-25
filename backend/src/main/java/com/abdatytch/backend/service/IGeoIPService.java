package com.abdatytch.backend.service;

import java.util.Map;

/**
 * Interface du service GeoIP.
 * Définit les méthodes pour extraire les informations géographiques à partir d'une adresse IP.
 */
public interface IGeoIPService {

    /**
     * Obtient les informations géographiques complètes pour une adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return une Map contenant les informations géographiques (pays, région, ville, quartier, ISP, etc.)
     */
    Map<String, Object> getGeoLocationInfo(String ipAddress);

    /**
     * Obtient les informations de pays pour une adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return une Map contenant les informations de pays
     */
    Map<String, Object> getCountryInfo(String ipAddress);

    /**
     * Obtient les informations ISP/ASN pour une adresse IP.
     * 
     * @param ipAddress l'adresse IP
     * @return une Map contenant les informations ISP
     */
    Map<String, Object> getIspInfo(String ipAddress);
}
