package com.abdatytch.backend.websocket;

import com.abdatytch.backend.event.NotificationBroadcaster;
import com.abdatytch.backend.service.IJwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.CloseStatus;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Handler WebSocket de PUSH des notifications admin en temps réel.
 *
 * Chaque session s'abonne au flux partagé du {@link NotificationBroadcaster} :
 * dès qu'un événement (nouveau message de contact, alerte…) est consommé depuis
 * Kafka, il est sérialisé en JSON et poussé à tous les panels admin connectés.
 */
@Component
public class NotificationWebSocketHandler implements WebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(NotificationWebSocketHandler.class);

    private final NotificationBroadcaster broadcaster;
    private final ObjectMapper objectMapper;
    private final IJwtService jwtService;

    public NotificationWebSocketHandler(NotificationBroadcaster broadcaster, ObjectMapper objectMapper,
                                        IJwtService jwtService) {
        this.broadcaster = broadcaster;
        this.objectMapper = objectMapper;
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        // Autorisation : token (access) passé en query param, rôle ADMIN requis.
        // (Un WebSocket navigateur ne peut pas envoyer d'en-tête Authorization.)
        if (!isAuthorizedAdmin(session)) {
            logger.debug("Connexion WS notifications refusée (non-admin): {}", session.getId());
            return session.close(CloseStatus.POLICY_VIOLATION);
        }
        logger.debug("Connexion WebSocket notifications: {}", session.getId());

        Flux<WebSocketMessage> outbound = broadcaster.flux()
            .map(event -> {
                try {
                    return session.textMessage(objectMapper.writeValueAsString(event));
                } catch (Exception e) {
                    return session.textMessage("{\"error\":\"serialization\"}");
                }
            });

        // On émet le flux sortant ET on draine les messages entrants (ping/close).
        return session.send(outbound)
            .and(session.receive().then());
    }

    /** Valide le token (query param access_token) : signature/expiration, type access, rôle ADMIN. */
    private boolean isAuthorizedAdmin(WebSocketSession session) {
        try {
            List<String> tokens = UriComponentsBuilder.fromUri(session.getHandshakeInfo().getUri())
                .build().getQueryParams().get("access_token");
            if (tokens == null || tokens.isEmpty()) {
                return false;
            }
            String token = tokens.get(0);
            if (!jwtService.validateToken(token) || jwtService.isTokenExpired(token)
                || !"access".equals(jwtService.extractTokenType(token))) {
                return false;
            }
            return "ADMIN".equalsIgnoreCase(jwtService.extractRole(token));
        } catch (Exception e) {
            return false;
        }
    }
}
