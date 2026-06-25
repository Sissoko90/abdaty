package com.abdatytch.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;

/**
 * Configuration de Netty pour la performance maximale.
 * Configure les connexions et les buffers pour utiliser la capacité maximale du serveur.
 */
@Configuration
public class NettyConfig {

    @Value("${netty.max-connections:}")
    private int maxConnections;

    @Value("${netty.pending-acquire-timeout:}")
    private long pendingAcquireTimeout;

    @Value("${netty.pending-acquire-max-count:}")
    private int pendingAcquireMaxCount;

    @Value("${netty.max-idle-time:}")
    private long maxIdleTime;

    @Value("${netty.max-life-time:}")
    private long maxLifeTime;

    /**
     * Configure le provider de connexions réactif.
     * Optimise les threads et les buffers pour les opérations réseau.
     * 
     * @return le provider de connexions
     */
    @Bean
    public ConnectionProvider connectionProvider() {
        return ConnectionProvider.builder("optimized-connection-provider")
            .maxConnections(maxConnections)
            .pendingAcquireTimeout(Duration.ofMillis(pendingAcquireTimeout))
            .pendingAcquireMaxCount(pendingAcquireMaxCount)
            .maxIdleTime(Duration.ofMillis(maxIdleTime))
            .maxLifeTime(Duration.ofMillis(maxLifeTime))
            .build();
    }
}
