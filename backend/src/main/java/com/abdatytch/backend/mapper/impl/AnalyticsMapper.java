package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.response.AnalyticsResponseDTO;
import com.abdatytch.backend.entity.AnalyticsData;
import com.abdatytch.backend.mapper.IAnalyticsMapper;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour AnalyticsData.
 * Convertit entre l'entité AnalyticsData et le DTO AnalyticsResponseDTO.
 */
@Component
public class AnalyticsMapper implements IAnalyticsMapper {

    @Override
    public AnalyticsResponseDTO toResponseDTO(AnalyticsData entity) {
        if (entity == null) {
            return null;
        }
        
        AnalyticsResponseDTO dto = new AnalyticsResponseDTO();
        dto.setId(entity.getId());
        dto.setIpAddress(entity.getIpAddress());
        dto.setUserAgent(entity.getUserAgent());
        dto.setUserId(entity.getUserId());
        dto.setRequestPath(entity.getRequestPath());
        dto.setRequestMethod(entity.getRequestMethod());
        dto.setReferer(entity.getReferer());
        dto.setDeviceType(entity.getDeviceType());
        dto.setBrowserName(entity.getBrowserName());
        dto.setBrowserVersion(entity.getBrowserVersion());
        dto.setOsName(entity.getOsName());
        dto.setOsVersion(entity.getOsVersion());
        dto.setCountry(entity.getCountry());
        dto.setCountryIsoCode(entity.getCountryIsoCode());
        dto.setRegion(entity.getRegion());
        dto.setCity(entity.getCity());
        dto.setIsp(entity.getIsp());
        dto.setAsn(entity.getAsn());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    @Override
    public AnalyticsData toEntity(AnalyticsResponseDTO dto) {
        if (dto == null) {
            return null;
        }
        
        AnalyticsData entity = new AnalyticsData();
        entity.setId(dto.getId());
        entity.setIpAddress(dto.getIpAddress());
        entity.setUserAgent(dto.getUserAgent());
        entity.setUserId(dto.getUserId());
        entity.setRequestPath(dto.getRequestPath());
        entity.setRequestMethod(dto.getRequestMethod());
        entity.setReferer(dto.getReferer());
        entity.setDeviceType(dto.getDeviceType());
        entity.setBrowserName(dto.getBrowserName());
        entity.setBrowserVersion(dto.getBrowserVersion());
        entity.setOsName(dto.getOsName());
        entity.setOsVersion(dto.getOsVersion());
        entity.setCountry(dto.getCountry());
        entity.setCountryIsoCode(dto.getCountryIsoCode());
        entity.setRegion(dto.getRegion());
        entity.setCity(dto.getCity());
        entity.setIsp(dto.getIsp());
        entity.setAsn(dto.getAsn());
        entity.setCreatedAt(dto.getCreatedAt());
        return entity;
    }
}
