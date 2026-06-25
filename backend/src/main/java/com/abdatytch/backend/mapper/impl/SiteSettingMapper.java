package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.response.SiteSettingResponseDTO;
import com.abdatytch.backend.entity.SiteSetting;
import com.abdatytch.backend.mapper.ISiteSettingMapper;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour les paramètres du site.
 */
@Component
public class SiteSettingMapper implements ISiteSettingMapper {

    @Override
    public SiteSettingResponseDTO toResponseDTO(SiteSetting entity) {
        if (entity == null) {
            return null;
        }

        SiteSettingResponseDTO dto = new SiteSettingResponseDTO();
        dto.setId(entity.getId());
        dto.setKey(entity.getSettingKey());
        dto.setValue(entity.getSettingValue());
        dto.setType(entity.getSettingType());
        dto.setCategory(entity.getCategory());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
