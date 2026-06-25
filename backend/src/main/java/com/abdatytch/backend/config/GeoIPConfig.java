package com.abdatytch.backend.config;

import com.maxmind.geoip2.DatabaseReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;

/**
 * Configuration de MaxMind GeoIP2.
 * Charge les bases de données GeoIP pour la géolocalisation.
 */
@Configuration
public class GeoIPConfig {

    private static final Logger logger = LoggerFactory.getLogger(GeoIPConfig.class);

    @Value("${app.geoip.database-path:/opt/geoip}")
    private String databasePath;

    @Value("${app.geoip.city-database:GeoLite2-City.mmdb}")
    private String cityDatabase;

    @Value("${app.geoip.asn-database:GeoLite2-ASN.mmdb}")
    private String asnDatabase;

    @Value("${app.geoip.country-database:GeoLite2-Country.mmdb}")
    private String countryDatabase;

    /**
     * Crée le DatabaseReader pour la base de données City.
     * 
     * @return le DatabaseReader City
     */
    @Bean
    public DatabaseReader cityDatabaseReader() {
        try {
            File databaseFile = new File(databasePath, cityDatabase);
            logger.info("Chargement de la base de données GeoIP City depuis: {}", databaseFile.getAbsolutePath());
            return new DatabaseReader.Builder(databaseFile).build();
        } catch (IOException e) {
            logger.error("Erreur lors du chargement de la base de données City", e);
            throw new RuntimeException("Impossible de charger la base de données City", e);
        }
    }

    /**
     * Crée le DatabaseReader pour la base de données ASN.
     * 
     * @return le DatabaseReader ASN
     */
    @Bean
    public DatabaseReader asnDatabaseReader() {
        try {
            File databaseFile = new File(databasePath, asnDatabase);
            logger.info("Chargement de la base de données GeoIP ASN depuis: {}", databaseFile.getAbsolutePath());
            return new DatabaseReader.Builder(databaseFile).build();
        } catch (IOException e) {
            logger.error("Erreur lors du chargement de la base de données ASN", e);
            throw new RuntimeException("Impossible de charger la base de données ASN", e);
        }
    }

    /**
     * Crée le DatabaseReader pour la base de données Country.
     * 
     * @return le DatabaseReader Country
     */
    @Bean
    public DatabaseReader countryDatabaseReader() {
        try {
            File databaseFile = new File(databasePath, countryDatabase);
            logger.info("Chargement de la base de données GeoIP Country depuis: {}", databaseFile.getAbsolutePath());
            return new DatabaseReader.Builder(databaseFile).build();
        } catch (IOException e) {
            logger.error("Erreur lors du chargement de la base de données Country", e);
            throw new RuntimeException("Impossible de charger la base de données Country", e);
        }
    }
}
