package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.response.MediaResponseDTO;
import com.abdatytch.backend.entity.Media;

/**
 * Interface du mapper pour les médias.
 */
public interface IMediaMapper {

    /** Convertit une entité Media en DTO de réponse. */
    MediaResponseDTO toResponseDTO(Media entity);
}
