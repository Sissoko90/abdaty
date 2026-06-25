package com.abdatytch.backend.config;

import com.abdatytch.backend.websocket.LogsWebSocketHandler;
import com.abdatytch.backend.websocket.MetricsWebSocketHandler;
import com.abdatytch.backend.websocket.NotificationWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration WebSocket pour le streaming en temps réel : métriques, logs et
 * notifications push admin.
 *
 * NB : sans {@code @Bean}, le HandlerMapping et l'adapter n'étaient PAS enregistrés
 * → aucun endpoint WebSocket ne fonctionnait. Corrigé ici.
 */
@Configuration
public class WebSocketConfig {

    private final MetricsWebSocketHandler metricsWebSocketHandler;
    private final LogsWebSocketHandler logsWebSocketHandler;
    private final NotificationWebSocketHandler notificationWebSocketHandler;

    @Autowired
    public WebSocketConfig(
            MetricsWebSocketHandler metricsWebSocketHandler,
            LogsWebSocketHandler logsWebSocketHandler,
            NotificationWebSocketHandler notificationWebSocketHandler) {
        this.metricsWebSocketHandler = metricsWebSocketHandler;
        this.logsWebSocketHandler = logsWebSocketHandler;
        this.notificationWebSocketHandler = notificationWebSocketHandler;
    }

    /**
     * Configure le mapping des endpoints WebSocket.
     *
     * @return le HandlerMapping
     */
    @Bean
    public HandlerMapping webSocketHandlerMapping() {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws/metrics", metricsWebSocketHandler);
        map.put("/ws/logs", logsWebSocketHandler);
        map.put("/ws/notifications", notificationWebSocketHandler);

        SimpleUrlHandlerMapping handlerMapping = new SimpleUrlHandlerMapping();
        handlerMapping.setOrder(1);
        handlerMapping.setUrlMap(map);
        return handlerMapping;
    }

    /**
     * Configure l'adaptateur WebSocket.
     *
     * @return le WebSocketHandlerAdapter
     */
    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}
