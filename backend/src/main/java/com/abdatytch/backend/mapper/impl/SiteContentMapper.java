package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.request.SiteContentRequestDTO;
import com.abdatytch.backend.dto.response.SiteContentResponseDTO;
import com.abdatytch.backend.entity.SiteContent;
import com.abdatytch.backend.mapper.ISiteContentMapper;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour le contenu éditorial unifié.
 */
@Component
public class SiteContentMapper implements ISiteContentMapper {

    @Override
    public SiteContentResponseDTO toResponseDTO(SiteContent entity) {
        if (entity == null) {
            return null;
        }

        SiteContentResponseDTO dto = new SiteContentResponseDTO();
        dto.setId(entity.getId());
        dto.setSection(entity.getSection());
        dto.setContentKey(entity.getContentKey());
        dto.setValueFr(entity.getValueFr());
        dto.setValueEn(entity.getValueEn());
        dto.setContentType(entity.getContentType());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setActive(entity.getActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Override
    public SiteContent toEntity(SiteContentRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        SiteContent entity = new SiteContent();
        entity.setSection(dto.getSection());
        entity.setContentKey(dto.getContentKey());
        applyMutableFields(entity, dto);
        return entity;
    }

    @Override
    public void updateEntity(SiteContent entity, SiteContentRequestDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        // section et contentKey constituent l'identité fonctionnelle : on les met
        // à jour aussi pour permettre un éventuel renommage côté admin.
        if (dto.getSection() != null) {
            entity.setSection(dto.getSection());
        }
        if (dto.getContentKey() != null) {
            entity.setContentKey(dto.getContentKey());
        }
        applyMutableFields(entity, dto);
    }

    /** Applique les champs modifiables (valeurs, type, ordre, visibilité). */
    private void applyMutableFields(SiteContent entity, SiteContentRequestDTO dto) {
        entity.setValueFr(dto.getValueFr());
        entity.setValueEn(dto.getValueEn());
        if (dto.getContentType() != null && !dto.getContentType().isBlank()) {
            entity.setContentType(dto.getContentType());
        }
        if (dto.getDisplayOrder() != null) {
            entity.setDisplayOrder(dto.getDisplayOrder());
        }
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }
}
