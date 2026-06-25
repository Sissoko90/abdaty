package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.dto.response.NotificationResponseDTO;
import com.abdatytch.backend.service.INotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controller pour les notifications de l'utilisateur connecté (dashboard).
 *
 * L'identifiant du destinataire est dérivé du JWT validé (@AuthenticationPrincipal),
 * garantissant qu'un utilisateur n'accède qu'à ses propres notifications.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/notifications")
@Tag(name = "Notifications", description = "Notifications de l'utilisateur")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final INotificationService notificationService;

    @Autowired
    public NotificationController(INotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lister mes notifications", description = "Liste les notifications de l'utilisateur, les plus récentes d'abord")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<NotificationResponseDTO> getMyNotifications(
            @AuthenticationPrincipal String userId) {
        logger.info("Liste des notifications pour l'utilisateur: {}", userId);
        return notificationService.getUserNotifications(userId);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Marquer comme lue", description = "Marque une notification comme lue")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification marquée comme lue"),
        @ApiResponse(responseCode = "404", description = "Notification introuvable")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> markAsRead(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Identifiant de la notification") @PathVariable String id) {
        logger.info("Marquage comme lue de la notification {} pour {}", id, userId);
        return notificationService.markAsRead(userId, id)
            .map(ResponseEntity::ok);
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tout marquer comme lu", description = "Marque toutes les notifications de l'utilisateur comme lues")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Notifications marquées comme lues"))
    public Mono<ResponseEntity<MessageResponseDTO>> markAllAsRead(
            @AuthenticationPrincipal String userId) {
        logger.info("Marquage de toutes les notifications comme lues pour {}", userId);
        return notificationService.markAllAsRead(userId)
            .map(ResponseEntity::ok);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Supprimer une notification", description = "Supprime une notification de l'utilisateur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification supprimée"),
        @ApiResponse(responseCode = "404", description = "Notification introuvable")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> delete(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Identifiant de la notification") @PathVariable String id) {
        logger.info("Suppression de la notification {} pour {}", id, userId);
        return notificationService.delete(userId, id)
            .map(ResponseEntity::ok);
    }

    // ---------------------------------------------------------------------------
    // Notifications « broadcast » admin (nouveaux messages de contact, alertes…),
    // persistées sous le destinataire sentinelle ADMIN_RECIPIENT et poussées en
    // temps réel via /ws/notifications. Historique réservé aux ADMIN.
    // ---------------------------------------------------------------------------

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Historique des notifications admin", description = "Notifications globales (contact, alertes), les plus récentes d'abord")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<NotificationResponseDTO> getAdminNotifications() {
        return notificationService.getUserNotifications(
            com.abdatytch.backend.event.NotificationKafkaConsumer.ADMIN_RECIPIENT);
    }

    @PutMapping("/admin/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Marquer une notification admin comme lue")
    public Mono<ResponseEntity<MessageResponseDTO>> markAdminAsRead(
            @Parameter(description = "Identifiant de la notification") @PathVariable String id) {
        return notificationService.markAsRead(
                com.abdatytch.backend.event.NotificationKafkaConsumer.ADMIN_RECIPIENT, id)
            .map(ResponseEntity::ok);
    }

    @PutMapping("/admin/read-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tout marquer comme lu (notifications admin)")
    public Mono<ResponseEntity<MessageResponseDTO>> markAllAdminAsRead() {
        return notificationService.markAllAsRead(
                com.abdatytch.backend.event.NotificationKafkaConsumer.ADMIN_RECIPIENT)
            .map(ResponseEntity::ok);
    }
}
