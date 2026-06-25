package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.request.DocumentationRequestDTO;
import com.abdatytch.backend.dto.response.DocumentationResponseDTO;
import com.abdatytch.backend.entity.DocumentationEntry;

/**
 * Interface du mapper pour les entrées de documentation.
 */
public interface IDocumentationMapper {

    /** Convertit une entité en DTO de réponse. */
    DocumentationResponseDTO toResponseDTO(DocumentationEntry entity);

    /** Construit une nouvelle entité à partir d'un DTO de requête. */
    DocumentationEntry toEntity(DocumentationRequestDTO dto);

    /** Applique les champs d'un DTO de requête sur une entité existante. */
    void updateEntity(DocumentationEntry entity, DocumentationRequestDTO dto);
}
