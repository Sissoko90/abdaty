package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.response.AnalyticsResponseDTO;
import com.abdatytch.backend.entity.AnalyticsData;

/**
 * Interface du mapper pour AnalyticsData.
 * Définit les méthodes de conversion entre l'entité et le DTO.
 */
public interface IAnalyticsMapper {

    /**
     * Convertit AnalyticsData en AnalyticsResponseDTO.
     * 
     * @param entity l'entité AnalyticsData
     * @return le DTO AnalyticsResponseDTO
     */
    AnalyticsResponseDTO toResponseDTO(AnalyticsData entity);

    /**
     * Convertit AnalyticsResponseDTO en AnalyticsData.
     * 
     * @param dto le DTO AnalyticsResponseDTO
     * @return l'entité AnalyticsData
     */
    AnalyticsData toEntity(AnalyticsResponseDTO dto);
}
