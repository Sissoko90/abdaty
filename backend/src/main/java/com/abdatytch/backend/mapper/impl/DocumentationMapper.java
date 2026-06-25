package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.request.DocumentationRequestDTO;
import com.abdatytch.backend.dto.response.DocumentationResponseDTO;
import com.abdatytch.backend.entity.DocumentationEntry;
import com.abdatytch.backend.mapper.IDocumentationMapper;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour les entrées de documentation.
 */
@Component
public class DocumentationMapper implements IDocumentationMapper {

    @Override
    public DocumentationResponseDTO toResponseDTO(DocumentationEntry entity) {
        if (entity == null) {
            return null;
        }

        DocumentationResponseDTO dto = new DocumentationResponseDTO();
        dto.setId(entity.getId());
        dto.setTitleFr(entity.getTitleFr());
        dto.setTitleEn(entity.getTitleEn());
        dto.setSlug(entity.getSlug());
        dto.setContentFr(entity.getContentFr());
        dto.setContentEn(entity.getContentEn());
        dto.setParentId(entity.getParentId());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setActive(entity.getActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Override
    public DocumentationEntry toEntity(DocumentationRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        DocumentationEntry entity = new DocumentationEntry();
        applyRequest(entity, dto);
        return entity;
    }

    @Override
    public void updateEntity(DocumentationEntry entity, DocumentationRequestDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        applyRequest(entity, dto);
    }

    /**
     * Copie les champs du DTO vers l'entité. Les champs nuls de display_order /
     * active conservent les valeurs par défaut de l'entité (0 / true).
     */
    private void applyRequest(DocumentationEntry entity, DocumentationRequestDTO dto) {
        entity.setTitleFr(dto.getTitleFr());
        entity.setTitleEn(dto.getTitleEn());
        entity.setSlug(dto.getSlug());
        entity.setContentFr(dto.getContentFr());
        entity.setContentEn(dto.getContentEn());
        entity.setParentId(dto.getParentId());
        if (dto.getDisplayOrder() != null) {
            entity.setDisplayOrder(dto.getDisplayOrder());
        }
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }
}
