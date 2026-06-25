package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.response.SiteSettingResponseDTO;
import com.abdatytch.backend.entity.SiteSetting;

/**
 * Interface du mapper pour les paramètres du site.
 */
public interface ISiteSettingMapper {

    /** Convertit une entité en DTO de réponse. */
    SiteSettingResponseDTO toResponseDTO(SiteSetting entity);
}
