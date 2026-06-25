package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.dto.response.NotificationResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service de gestion des notifications (espace utilisateur).
 */
public interface INotificationService {

    /** Liste les notifications de l'utilisateur, les plus récentes d'abord. */
    Flux<NotificationResponseDTO> getUserNotifications(String userId);

    /** Marque une notification comme lue (404 si absente / non possédée). */
    Mono<MessageResponseDTO> markAsRead(String userId, String id);

    /** Marque toutes les notifications de l'utilisateur comme lues. */
    Mono<MessageResponseDTO> markAllAsRead(String userId);

    /** Supprime une notification de l'utilisateur (404 si absente). */
    Mono<MessageResponseDTO> delete(String userId, String id);
}
