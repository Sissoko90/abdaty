package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.dto.response.NotificationResponseDTO;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.INotificationMapper;
import com.abdatytch.backend.repository.NotificationRepository;
import com.abdatytch.backend.service.INotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Implémentation réactive du service de gestion des notifications.
 */
@Service
public class NotificationService implements INotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final INotificationMapper notificationMapper;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository,
                               INotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    public Flux<NotificationResponseDTO> getUserNotifications(String userId) {
        logger.info("Récupération des notifications de l'utilisateur: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .map(notificationMapper::toResponseDTO);
    }

    @Override
    public Mono<MessageResponseDTO> markAsRead(String userId, String id) {
        logger.info("Marquage comme lue de la notification {} pour {}", id, userId);
        return notificationRepository.findByIdAndUserId(id, userId)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(notification -> {
                notification.setIsRead(true);
                return notificationRepository.save(notification);
            })
            .thenReturn(new MessageResponseDTO("Notification marquée comme lue"));
    }

    @Override
    public Mono<MessageResponseDTO> markAllAsRead(String userId) {
        logger.info("Marquage de toutes les notifications comme lues pour {}", userId);
        return notificationRepository.markAllAsRead(userId)
            .thenReturn(new MessageResponseDTO("Toutes les notifications ont été marquées comme lues"));
    }

    @Override
    public Mono<MessageResponseDTO> delete(String userId, String id) {
        logger.info("Suppression de la notification {} pour {}", id, userId);
        return notificationRepository.findByIdAndUserId(id, userId)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(notificationRepository::delete)
            .thenReturn(new MessageResponseDTO("Notification supprimée"));
    }
}
