package com.abdatytch.backend.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Liveness probe pour Kubernetes.
 * Vérifie si l'application est en cours d'exécution.
 */
@RestController
@RequestMapping("/health/liveness")
public class LivenessProbe {

    private static final Logger logger = LoggerFactory.getLogger(LivenessProbe.class);

    @GetMapping
    public Mono<Map<String, Object>> liveness() {
        logger.debug("Liveness probe check");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        
        return Mono.just(response);
    }
}
