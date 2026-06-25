package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.response.MediaResponseDTO;
import com.abdatytch.backend.entity.Media;
import com.abdatytch.backend.mapper.IMediaMapper;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour les médias.
 */
@Component
public class MediaMapper implements IMediaMapper {

    @Override
    public MediaResponseDTO toResponseDTO(Media entity) {
        if (entity == null) {
            return null;
        }

        MediaResponseDTO dto = new MediaResponseDTO();
        dto.setId(entity.getId());
        dto.setFilename(entity.getFilename());
        dto.setOriginalFilename(entity.getOriginalFilename());
        dto.setFileType(entity.getFileType());
        dto.setFileSize(entity.getFileSize());
        dto.setUrl(entity.getUrl());
        dto.setThumbnailUrl(entity.getThumbnailUrl());
        dto.setUploadedBy(entity.getUploadedBy());
        dto.setDomain(entity.getMediaDomain());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
