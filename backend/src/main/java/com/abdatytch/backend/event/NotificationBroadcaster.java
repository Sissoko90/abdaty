package com.abdatytch.backend.event;

import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * Diffuseur en mémoire des notifications vers les sessions WebSocket connectées
 * sur CETTE instance.
 *
 * Le consumer Kafka émet ici ; chaque session WebSocket s'abonne au {@link #flux()}.
 * En multi-réplicas, chaque instance consomme l'événement (groupe Kafka unique par
 * instance) et alimente son propre broadcaster → tous les clients sont notifiés,
 * quelle que soit l'instance à laquelle ils sont connectés.
 */
@Component
public class NotificationBroadcaster {

    // multicast + directBestEffort : diffusion LIVE uniquement. Aucun rejeu aux
    // nouveaux abonnés (l'historique est servi par REST /notifications/admin) ;
    // un événement émis sans abonné connecté est simplement ignoré.
    private final Sinks.Many<NotificationEvent> sink = Sinks.many().multicast().directBestEffort();

    /** Émet une notification vers toutes les sessions abonnées (best-effort). */
    public void emit(NotificationEvent event) {
        sink.tryEmitNext(event);
    }

    /** Flux partagé des notifications, consommé par chaque session WebSocket. */
    public Flux<NotificationEvent> flux() {
        return sink.asFlux();
    }
}
