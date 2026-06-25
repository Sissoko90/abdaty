package com.abdatytch.backend.websocket;

import com.abdatytch.backend.service.ILogService;
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
 * Handler WebSocket pour le streaming en temps réel des logs.
 */
@Component
public class LogsWebSocketHandler implements WebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(LogsWebSocketHandler.class);

    private final ILogService logService;
    private final ObjectMapper objectMapper;

    @Autowired
    public LogsWebSocketHandler(ILogService logService, ObjectMapper objectMapper) {
        this.logService = logService;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        logger.info("Nouvelle connexion WebSocket pour les logs: {}", session.getId());
        
        // Envoyer les logs toutes les secondes
        Flux<WebSocketMessage> logsStream = Flux.interval(Duration.ofSeconds(1))
            .flatMap(tick -> logService.getAllLogs(0, 10)) // 10 derniers logs
            .map(logs -> {
                try {
                    return session.textMessage(objectMapper.writeValueAsString(logs));
                } catch (Exception e) {
                    logger.error("Erreur lors de la sérialisation des logs", e);
                    return session.textMessage("{\"error\":\"Serialization error\"}");
                }
            })
            .doOnNext(message -> logger.debug("Logs envoyés via WebSocket"))
            .doOnError(error -> logger.error("Erreur dans le flux WebSocket", error))
            .doOnComplete(() -> logger.info("Flux WebSocket terminé"));

        return session.send(logsStream)
            .and(session.receive()
                .doOnNext(message -> logger.debug("Message reçu du client: {}", message.getPayloadAsText()))
                .doOnComplete(() -> logger.info("Connexion WebSocket fermée par le client")));
    }
}
