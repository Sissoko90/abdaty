package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.request.BlogPostRequestDTO;
import com.abdatytch.backend.dto.response.BlogPostResponseDTO;
import com.abdatytch.backend.entity.BlogPost;

/**
 * Interface du mapper pour les articles de blog.
 * Définit les conversions entité ⇄ DTO.
 */
public interface IBlogPostMapper {

    /**
     * Convertit une entité BlogPost en DTO de réponse.
     *
     * @param entity l'entité
     * @return le DTO de réponse (null si entrée null)
     */
    BlogPostResponseDTO toResponseDTO(BlogPost entity);

    /**
     * Construit une nouvelle entité BlogPost à partir d'un DTO de requête.
     *
     * @param dto le DTO de requête
     * @return la nouvelle entité (sans id, généré côté base)
     */
    BlogPost toEntity(BlogPostRequestDTO dto);

    /**
     * Applique les champs d'un DTO de requête sur une entité existante (mise à jour).
     *
     * @param entity l'entité cible à modifier
     * @param dto    les nouvelles valeurs
     */
    void updateEntity(BlogPost entity, BlogPostRequestDTO dto);
}
