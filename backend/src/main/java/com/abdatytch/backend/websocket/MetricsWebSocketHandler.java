package com.abdatytch.backend.websocket;

import com.abdatytch.backend.service.ISystemMetricsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Handler WebSocket pour le streaming en temps réel des métriques système.
 */
@Component
public class MetricsWebSocketHandler implements WebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(MetricsWebSocketHandler.class);

    private final ISystemMetricsService systemMetricsService;
    private final ObjectMapper objectMapper;

    @Autowired
    public MetricsWebSocketHandler(ISystemMetricsService systemMetricsService, ObjectMapper objectMapper) {
        this.systemMetricsService = systemMetricsService;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        logger.info("Nouvelle connexion WebSocket pour les métriques: {}", session.getId());
        
        // Envoyer les métriques toutes les secondes
        Flux<WebSocketMessage> metricsStream = Flux.interval(Duration.ofSeconds(1))
            .flatMap(tick -> systemMetricsService.getSystemMetrics())
            .map(metrics -> {
                try {
                    return session.textMessage(objectMapper.writeValueAsString(metrics));
                } catch (Exception e) {
                    logger.error("Erreur lors de la sérialisation des métriques", e);
                    return session.textMessage("{\"error\":\"Serialization error\"}");
                }
            })
            .doOnNext(message -> logger.debug("Métriques envoyées via WebSocket"))
            .doOnError(error -> logger.error("Erreur dans le flux WebSocket", error))
            .doOnComplete(() -> logger.info("Flux WebSocket terminé"));

        return session.send(metricsStream)
            .and(session.receive()
                .doOnNext(message -> logger.debug("Message reçu du client: {}", message.getPayloadAsText()))
                .doOnComplete(() -> logger.info("Connexion WebSocket fermée par le client")));
    }
}
