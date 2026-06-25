package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.response.GeoBlockingResponseDTO;
import com.abdatytch.backend.entity.GeoBlocking;
import com.abdatytch.backend.mapper.IGeoBlockingMapper;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour GeoBlocking.
 * Convertit entre l'entité GeoBlocking et le DTO GeoBlockingResponseDTO.
 */
@Component
public class GeoBlockingMapper implements IGeoBlockingMapper {

    @Override
    public GeoBlockingResponseDTO toResponseDTO(GeoBlocking entity) {
        if (entity == null) {
            return null;
        }
        
        GeoBlockingResponseDTO dto = new GeoBlockingResponseDTO();
        dto.setId(entity.getId());
        dto.setCountryCode(entity.getCountryCode());
        dto.setCountryName(entity.getCountryName());
        dto.setContinentCode(entity.getContinentCode());
        dto.setContinentName(entity.getContinentName());
        dto.setAccessStatus(entity.getAccessStatus());
        dto.setThreatScore(entity.getThreatScore());
        dto.setRequestCount(entity.getRequestCount());
        dto.setFlagEmoji(entity.getFlagEmoji());
        return dto;
    }

    @Override
    public GeoBlocking toEntity(GeoBlockingResponseDTO dto) {
        if (dto == null) {
            return null;
        }
        
        GeoBlocking entity = new GeoBlocking();
        entity.setId(dto.getId());
        entity.setCountryCode(dto.getCountryCode());
        entity.setCountryName(dto.getCountryName());
        entity.setContinentCode(dto.getContinentCode());
        entity.setContinentName(dto.getContinentName());
        entity.setAccessStatus(dto.getAccessStatus());
        entity.setThreatScore(dto.getThreatScore());
        entity.setRequestCount(dto.getRequestCount());
        entity.setFlagEmoji(dto.getFlagEmoji());
        return entity;
    }
}
