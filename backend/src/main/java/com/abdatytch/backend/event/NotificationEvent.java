package com.abdatytch.backend.event;

/**
 * Événement de notification destiné aux panels admin (push temps réel).
 *
 * Publié sur Kafka lorsqu'un fait notable survient (nouveau message de contact,
 * alerte déclenchée…), consommé puis diffusé aux clients WebSocket connectés.
 *
 * @param type      catégorie ("CONTACT_MESSAGE", "ALERT", "SYSTEM"…)
 * @param title     titre court affiché dans le toast / la cloche
 * @param message   corps lisible de la notification
 * @param link      lien interne admin vers la ressource concernée (optionnel)
 * @param timestamp instant de l'événement (epoch millis)
 */
public record NotificationEvent(
    String type,
    String title,
    String message,
    String link,
    long timestamp
) {}
