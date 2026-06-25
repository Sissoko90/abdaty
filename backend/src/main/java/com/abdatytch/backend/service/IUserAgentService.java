package com.abdatytch.backend.service;

import java.util.Map;

/**
 * Interface du service User Agent.
 * Définit les méthodes pour extraire les informations sur l'appareil et le navigateur à partir du User-Agent.
 */
public interface IUserAgentService {

    /**
     * Obtient les informations complètes sur l'appareil et le navigateur à partir du User-Agent.
     * 
     * @param userAgent le User-Agent string
     * @return une Map contenant les informations (type d'appareil, OS, navigateur, versions, etc.)
     */
    Map<String, Object> parseUserAgent(String userAgent);

    /**
     * Obtient les informations sur le navigateur à partir du User-Agent.
     * 
     * @param userAgent le User-Agent string
     * @return une Map contenant les informations du navigateur
     */
    Map<String, Object> getBrowserInfo(String userAgent);

    /**
     * Obtient les informations sur le système d'exploitation à partir du User-Agent.
     * 
     * @param userAgent le User-Agent string
     * @return une Map contenant les informations de l'OS
     */
    Map<String, Object> getOsInfo(String userAgent);

    /**
     * Obtient les informations sur l'appareil à partir du User-Agent.
     * 
     * @param userAgent le User-Agent string
     * @return une Map contenant les informations de l'appareil
     */
    Map<String, Object> getDeviceInfo(String userAgent);
}
