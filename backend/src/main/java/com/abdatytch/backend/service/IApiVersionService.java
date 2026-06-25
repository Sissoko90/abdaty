package com.abdatytch.backend.service;

/**
 * Interface du service de versionning des API.
 * Définit les méthodes pour gérer les versions de l'API.
 */
public interface IApiVersionService {

    /**
     * Obtient la version actuelle de l'API.
     * 
     * @return la version actuelle (ex: "v1", "v2")
     */
    String getCurrentVersion();

    /**
     * Définit la version actuelle de l'API.
     * 
     * @param version la version à définir
     */
    void setCurrentVersion(String version);

    /**
     * Vérifie si une version est supportée.
     * 
     * @param version la version à vérifier
     * @return true si la version est supportée, false sinon
     */
    boolean isVersionSupported(String version);

    /**
     * Obtient le préfixe de route pour la version actuelle.
     * 
     * @return le préfixe de route (ex: "/api/v1")
     */
    String getRoutePrefix();
}
