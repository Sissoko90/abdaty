package com.abdatytch.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration de Swagger/OpenAPI pour la documentation de l'API.
 * Définit les informations de l'API, la sécurité et les serveurs.
 */
@Configuration
public class SwaggerConfig {

    @Value("${app.api.prefix}")
    private String apiPrefix;

    @Value("${app.api.version}")
    private String apiVersion;

    @Value("${server.port}")
    private String serverPort;

    /**
     * Configure la documentation OpenAPI personnalisée.
     * Définit les informations de l'API, la sécurité JWT et la documentation externe.
     * 
     * @return la configuration OpenAPI
     */
    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        final String apiPath = apiPrefix + "/" + apiVersion;
        
        return new OpenAPI()
            // Informations de l'API
            .info(new Info()
                .title("Abdaty Technologie API")
                .description("API RESTful pour la gestion des services d'Abdaty Technologie")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Abdaty Technologie")
                    .email("contact@abdatytch.com")
                    .url("https://abdatytch.com"))
                .license(new License()
                    .name("MIT License")
                    .url("https://choosealicense.com/licenses/mit/")))
            
            // Configuration de la sécurité JWT
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Token JWT pour l'authentification")))
            
            // Serveurs disponibles
            .servers(List.of(
                new Server().url("http://localhost:" + serverPort + apiPath).description("Serveur de développement"),
                new Server().url("https://api.abdatytechnologie.com" + apiPath).description("Serveur de production")))
            
            // Documentation externe
            .externalDocs(new ExternalDocumentation()
                .description("Documentation complète d'Abdaty Technologie")
                .url("https://docs.abdatytechnologie.com"));
    }
}
