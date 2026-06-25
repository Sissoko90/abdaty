package com.abdatytch.backend.config;

import com.abdatytch.backend.logging.InMemoryLogAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuration de sécurité Spring Security pour l'application.
 * Configure l'authentification, l'autorisation, CORS et les filtres de sécurité.
 */
@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Value("${security.cors.enabled:true}")
    private boolean corsEnabled;

    @Value("${security.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String corsAllowedOrigins;

    @Value("${security.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
    private String corsAllowedMethods;

    @Value("${security.cors.allowed-headers:Authorization,Content-Type,Accept,Origin,X-Requested-With,X-User-Id,X-Refresh-Token}")
    private String corsAllowedHeaders;

    @Value("${security.cors.allow-credentials:true}")
    private boolean corsAllowCredentials;

    @Value("${security.csrf.enabled:false}")
    private boolean csrfEnabled;

    /** Préfixe de l'API (ex: /api), configurable via app.api.prefix. */
    @Value("${app.api.prefix:/api}")
    private String apiPrefix;

    /** Version de l'API (ex: v1), configurable via app.api.version. */
    @Value("${app.api.version:v1}")
    private String apiVersion;

    /**
     * Configure le filtre de sécurité HTTP.
     * Définit les règles d'accès, CORS, CSRF et les filtres personnalisés.
     * 
     * @param http la configuration HTTP
     * @return la chaîne de filtres de sécurité
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            com.abdatytch.backend.security.SecurityContextRepository securityContextRepository) {

        // Base réelle de l'API, ex: "/api/v1". Construite à partir de la configuration
        // pour rester cohérente avec le @RequestMapping des controllers.
        final String apiBase = apiPrefix + "/" + apiVersion;

        http
            .csrf(csrf -> {
                if (!csrfEnabled) {
                    csrf.disable();
                }
            })
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            // IMPORTANT : on attache le repository de contexte de sécurité personnalisé.
            // C'est lui qui lit l'en-tête Authorization, valide le JWT et établit
            // l'authentification réactive. Sans cette ligne, aucun token n'est pris en
            // compte et tous les endpoints authentifiés répondent 401.
            .securityContextRepository(securityContextRepository)
            .authorizeExchange(auth -> auth
                // Documentation API (Swagger UI + OpenAPI JSON) : réservée aux ADMIN.
                .pathMatchers(
                    "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/webjars/**"
                ).hasRole("ADMIN")
                // Endpoints publics : authentification, santé.
                .pathMatchers(
                    apiBase + "/auth/**",
                    // Santé + métriques Prometheus (scrapées par la stack de monitoring).
                    // PROD : isoler par le réseau / un port de management dédié plutôt
                    // que d'exposer publiquement (cf. note d'architecture monitoring).
                    "/actuator/health", "/actuator/info", "/actuator/prometheus",
                    // Fichiers médias servis statiquement (lecture publique).
                    "/uploads/**",
                    // Newsletter : inscription, désinscription et suivi (pixel/clic) publics.
                    apiBase + "/newsletter/subscribe",
                    apiBase + "/newsletter/unsubscribe/**",
                    apiBase + "/newsletter/track/**",
                    // Handshake WebSocket : un navigateur ne peut pas envoyer d'en-tête
                    // Authorization. L'autorisation se fait DANS le handler via le token
                    // passé en query param (cf. *WebSocketHandler).
                    "/ws/**"
                ).permitAll()
                // Enregistrement public d'un consentement cookies (bandeau RGPD).
                .pathMatchers(HttpMethod.POST, apiBase + "/cookie-consents").permitAll()
                // Réception publique d'un message via le formulaire de contact.
                .pathMatchers(HttpMethod.POST, apiBase + "/contact").permitAll()
                // Lecture publique du contenu éditorial (consommée par le site vitrine).
                // Les écritures (POST/PUT/PATCH/DELETE) restent protégées (cf. @PreAuthorize).
                .pathMatchers(HttpMethod.GET,
                    apiBase + "/blog/**",
                    apiBase + "/documentation/**",
                    apiBase + "/site-settings/**",
                    apiBase + "/content/**"
                ).permitAll()
                // Supervision et endpoints d'administration réservés aux ADMIN.
                .pathMatchers("/actuator/**").hasRole("ADMIN")
                .pathMatchers(apiBase + "/admin/**").hasRole("ADMIN")
                // Tout le reste nécessite une authentification ; le rôle précis est
                // vérifié au niveau des méthodes via @PreAuthorize.
                .anyExchange().authenticated()
            );

        if (corsEnabled) {
            http.addFilterBefore(corsFilter(), SecurityWebFiltersOrder.CORS);
        }

        return http.build();
    }

    /**
     * Configure le filtre CORS.
     * Permet les requêtes cross-origin.
     * 
     * @return le filtre CORS
     */
    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Arrays.asList(corsAllowedOrigins.split(",")));
        corsConfig.setAllowedMethods(Arrays.asList(corsAllowedMethods.split(",")));
        corsConfig.setAllowedHeaders(Arrays.asList(corsAllowedHeaders.split(",")));
        corsConfig.setAllowCredentials(corsAllowCredentials);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }

    /**
     * Configure le repository de contexte de sécurité.
     * 
     * @param authenticationManager le gestionnaire d'authentification
     * @return le repository de contexte de sécurité
     */
    @Bean
    public com.abdatytch.backend.security.SecurityContextRepository securityContextRepository(
            org.springframework.security.authentication.ReactiveAuthenticationManager authenticationManager) {
        return new com.abdatytch.backend.security.SecurityContextRepository(authenticationManager);
    }

    /**
     * Configure l'encodeur de mot de passe.
     * Utilise BCrypt pour le hachage des mots de passe.
     * 
     * @return l'encodeur de mot de passe
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configure l'ObjectMapper pour la sérialisation JSON.
     * 
     * @return l'ObjectMapper configuré
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    /**
     * Configure l'InMemoryLogAppender pour capturer les logs en mémoire.
     * 
     * @return l'InMemoryLogAppender configuré
     */
    @Bean
    public InMemoryLogAppender inMemoryLogAppender() {
        InMemoryLogAppender appender = new InMemoryLogAppender();
        appender.setName("InMemoryLogAppender");
        appender.start();
        return appender;
    }
}
