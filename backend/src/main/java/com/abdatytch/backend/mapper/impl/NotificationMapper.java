package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.response.NotificationResponseDTO;
import com.abdatytch.backend.entity.Notification;
import com.abdatytch.backend.mapper.INotificationMapper;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour les notifications.
 */
@Component
public class NotificationMapper implements INotificationMapper {

    @Override
    public NotificationResponseDTO toResponseDTO(Notification entity) {
        if (entity == null) {
            return null;
        }

        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(entity.getId());
        dto.setType(entity.getType());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setLink(entity.getLink());
        dto.setIsRead(entity.getIsRead());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
