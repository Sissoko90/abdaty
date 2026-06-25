package com.abdatytch.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration de Vault pour la gestion des secrets en production.
 * Active la lecture des secrets depuis Vault en environnement de production.
 * En développement, utilise le fichier .env.
 */
@Configuration
public class VaultConfig {

    private static final Logger logger = LoggerFactory.getLogger(VaultConfig.class);

    @Value("${spring.cloud.vault.enabled:}")
    private boolean vaultEnabled;

    @Value("${spring.cloud.vault.uri:}")
    private String vaultUri;

    @Value("${spring.cloud.vault.token:}")
    private String vaultToken;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    /**
     * Vérifie si Vault est activé et configuré correctement.
     */
    public VaultConfig() {
        logger.info("Configuration Vault initialisée");
    }

    /**
     * Vérifie si Vault est activé pour l'environnement actuel.
     * 
     * @return true si Vault est activé, false sinon
     */
    public boolean isVaultEnabled() {
        boolean enabled = vaultEnabled && !"dev".equalsIgnoreCase(activeProfile);
        if (enabled) {
            logger.info("Vault activé pour l'environnement: {}", activeProfile);
            logger.info("Vault URI: {}", vaultUri);
        } else {
            logger.info("Vault désactivé, utilisation du fichier .env pour l'environnement: {}", activeProfile);
        }
        return enabled;
    }

    /**
     * Obtient l'URI de Vault.
     * 
     * @return l'URI de Vault
     */
    public String getVaultUri() {
        return vaultUri;
    }

    /**
     * Obtient le token Vault.
     * 
     * @return le token Vault
     */
    public String getVaultToken() {
        return vaultToken;
    }
}
