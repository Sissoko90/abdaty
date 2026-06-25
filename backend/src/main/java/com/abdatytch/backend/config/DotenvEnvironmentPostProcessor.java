package com.abdatytch.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Charge le fichier {@code .env} TRÈS TÔT dans le cycle de démarrage, en tant que
 * source de propriétés de l'environnement Spring.
 *
 * Pourquoi un {@link EnvironmentPostProcessor} et non un {@code @PostConstruct} :
 * la résolution de {@code spring.config.import} (dont {@code vault://}) et de la
 * configuration Vault ({@code VAULT_ENABLED}, {@code VAULT_TOKEN}, {@code VAULT_URI})
 * a lieu pendant la phase « config-data », AVANT la création du moindre bean. Un
 * chargement du {@code .env} en {@code @PostConstruct} interviendrait trop tard :
 * Vault verrait toujours {@code VAULT_ENABLED=false}. Cet EPP s'exécute avant le
 * {@code ConfigDataEnvironmentPostProcessor} (cf. {@link #getOrder()}).
 *
 * Précédence : la source {@code .env} est ajoutée en DERNIER ({@code addLast}),
 * donc la plus basse — les vraies variables d'environnement de l'OS ET les secrets
 * Vault gardent la priorité. Le {@code .env} ne sert que de FALLBACK.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Dotenv dotenv = Dotenv.configure()
            .filename(".env")
            .ignoreIfMissing()
            .ignoreIfMalformed()
            .load();

        Map<String, Object> values = new HashMap<>();
        dotenv.entries().forEach(entry -> values.put(entry.getKey(), entry.getValue()));

        if (!values.isEmpty()) {
            environment.getPropertySources().addLast(new MapPropertySource("dotenvFile", values));
        }
    }

    @Override
    public int getOrder() {
        // Avant ConfigDataEnvironmentPostProcessor (HIGHEST_PRECEDENCE + 10) afin que
        // les variables du .env soient disponibles au moment où Vault s'initialise.
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
