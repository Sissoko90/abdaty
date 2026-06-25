package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.service.IApiVersionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Implémentation du service de versionning des API.
 * Gère les versions de l'API et fournit le préfixe de route.
 */
@Service
public class ApiVersionService implements IApiVersionService {

    @Value("${app.api.prefix:/api}")
    private String apiPrefix;

    @Value("${app.api.version:v1}")
    private String currentVersion;

    private static final Set<String> SUPPORTED_VERSIONS = Set.of("v1", "v2");

    @Override
    public String getCurrentVersion() {
        return currentVersion;
    }

    @Override
    public void setCurrentVersion(String version) {
        if (!isVersionSupported(version)) {
            throw new IllegalArgumentException("Version non supportée: " + version);
        }
        this.currentVersion = version;
    }

    @Override
    public boolean isVersionSupported(String version) {
        return SUPPORTED_VERSIONS.contains(version);
    }

    @Override
    public String getRoutePrefix() {
        return apiPrefix + "/" + currentVersion;
    }
}
