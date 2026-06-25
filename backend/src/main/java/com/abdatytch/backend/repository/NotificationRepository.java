package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.Notification;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les notifications.
 */
@Repository
public interface NotificationRepository extends R2dbcRepository<Notification, String> {

    /** Liste les notifications d'un utilisateur, de la plus récente à la plus ancienne. */
    Flux<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Récupère une notification par identifiant ET destinataire (contrôle d'accès). */
    Mono<Notification> findByIdAndUserId(String id, String userId);

    /** Marque toutes les notifications non lues d'un utilisateur comme lues. */
    @Modifying
    @Query("UPDATE notifications SET is_read = true WHERE user_id = :userId AND is_read = false")
    Mono<Integer> markAllAsRead(String userId);
}
