package com.abdatytch.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

import java.nio.file.Paths;

/**
 * Configuration servant le répertoire d'upload en ressources statiques.
 *
 * Les fichiers stockés dans {@code <upload-dir>/...} sont exposés en lecture
 * sous l'URL publique {@code <public-base-url>/...} (par défaut /uploads/**).
 * L'accès en lecture à ces URLs est autorisé publiquement dans SecurityConfig.
 *
 * Remarque : on n'utilise PAS @EnableWebFlux afin de conserver l'autoconfiguration
 * Spring Boot ; ce bean WebFluxConfigurer est simplement détecté et appliqué.
 */
@Configuration
public class MediaResourceConfig implements WebFluxConfigurer {

    @Value("${app.media.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.media.public-base-url:/uploads}")
    private String publicBaseUrl;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Emplacement physique du dossier d'upload (résolu en chemin absolu).
        String location = "file:" + Paths.get(uploadDir).toAbsolutePath().normalize() + "/";

        // Motif d'URL public, ex: "/uploads/**".
        String base = publicBaseUrl.endsWith("/")
            ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        String pattern = base + "/**";

        registry.addResourceHandler(pattern)
            .addResourceLocations(location);
    }
}
