package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.response.GeoBlockingResponseDTO;
import com.abdatytch.backend.entity.GeoBlocking;

/**
 * Interface du mapper pour GeoBlocking.
 * Définit les méthodes de conversion entre l'entité et le DTO.
 */
public interface IGeoBlockingMapper {

    /**
     * Convertit GeoBlocking en GeoBlockingResponseDTO.
     * 
     * @param entity l'entité GeoBlocking
     * @return le DTO GeoBlockingResponseDTO
     */
    GeoBlockingResponseDTO toResponseDTO(GeoBlocking entity);

    /**
     * Convertit GeoBlockingResponseDTO en GeoBlocking.
     * 
     * @param dto le DTO GeoBlockingResponseDTO
     * @return l'entité GeoBlocking
     */
    GeoBlocking toEntity(GeoBlockingResponseDTO dto);
}
