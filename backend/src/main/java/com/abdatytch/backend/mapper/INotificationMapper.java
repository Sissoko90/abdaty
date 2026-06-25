package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.response.NotificationResponseDTO;
import com.abdatytch.backend.entity.Notification;

/**
 * Interface du mapper pour les notifications.
 */
public interface INotificationMapper {

    /** Convertit une entité en DTO de réponse. */
    NotificationResponseDTO toResponseDTO(Notification entity);
}
