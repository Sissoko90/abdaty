package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.request.SiteContentRequestDTO;
import com.abdatytch.backend.dto.response.SiteContentResponseDTO;
import com.abdatytch.backend.entity.SiteContent;

/**
 * Interface du mapper pour le contenu éditorial unifié.
 */
public interface ISiteContentMapper {

    /** Convertit une entité en DTO de réponse. */
    SiteContentResponseDTO toResponseDTO(SiteContent entity);

    /** Construit une nouvelle entité à partir d'un DTO de requête. */
    SiteContent toEntity(SiteContentRequestDTO dto);

    /** Applique les champs d'un DTO de requête sur une entité existante. */
    void updateEntity(SiteContent entity, SiteContentRequestDTO dto);
}
