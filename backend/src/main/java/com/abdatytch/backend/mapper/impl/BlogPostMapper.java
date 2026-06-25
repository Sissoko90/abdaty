package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.request.BlogPostRequestDTO;
import com.abdatytch.backend.dto.response.BlogPostResponseDTO;
import com.abdatytch.backend.entity.BlogPost;
import com.abdatytch.backend.mapper.IBlogPostMapper;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du mapper pour les articles de blog.
 *
 * Gère notamment la conversion des tags : stockés en base sous forme de chaîne
 * séparée par des virgules (MySQL sans type tableau), exposés en {@code List<String>}
 * dans les DTO.
 */
@Component
public class BlogPostMapper implements IBlogPostMapper {

    @Override
    public BlogPostResponseDTO toResponseDTO(BlogPost entity) {
        if (entity == null) {
            return null;
        }

        BlogPostResponseDTO dto = new BlogPostResponseDTO();
        dto.setId(entity.getId());
        dto.setTitleFr(entity.getTitleFr());
        dto.setTitleEn(entity.getTitleEn());
        dto.setSlug(entity.getSlug());
        dto.setExcerptFr(entity.getExcerptFr());
        dto.setExcerptEn(entity.getExcerptEn());
        dto.setContentFr(entity.getContentFr());
        dto.setContentEn(entity.getContentEn());
        dto.setAuthorId(entity.getAuthorId());
        dto.setCategory(entity.getCategory());
        dto.setTags(tagsToList(entity.getTags()));
        dto.setFeaturedImage(entity.getFeaturedImage());
        dto.setStatus(entity.getPostStatus());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Override
    public BlogPost toEntity(BlogPostRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        BlogPost entity = new BlogPost();
        applyRequest(entity, dto);
        // Statut par défaut "draft" si non précisé.
        entity.setPostStatus(normalizeStatus(dto.getStatus()));
        return entity;
    }

    @Override
    public void updateEntity(BlogPost entity, BlogPostRequestDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        applyRequest(entity, dto);
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            entity.setPostStatus(normalizeStatus(dto.getStatus()));
        }
    }

    /** Copie les champs communs du DTO de requête vers l'entité (hors statut). */
    private void applyRequest(BlogPost entity, BlogPostRequestDTO dto) {
        entity.setTitleFr(dto.getTitleFr());
        entity.setTitleEn(dto.getTitleEn());
        entity.setSlug(dto.getSlug());
        entity.setExcerptFr(dto.getExcerptFr());
        entity.setExcerptEn(dto.getExcerptEn());
        entity.setContentFr(dto.getContentFr());
        entity.setContentEn(dto.getContentEn());
        entity.setAuthorId(dto.getAuthorId());
        entity.setCategory(dto.getCategory());
        entity.setTags(tagsToString(dto.getTags()));
        entity.setFeaturedImage(dto.getFeaturedImage());
    }

    /** Normalise le statut éditorial ; valeur par défaut "draft". */
    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "draft";
        }
        return status.trim().toLowerCase();
    }

    /** Convertit une liste de tags en chaîne séparée par des virgules. */
    private String tagsToString(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        return tags.stream()
            .filter(t -> t != null && !t.isBlank())
            .map(String::trim)
            .collect(Collectors.joining(","));
    }

    /** Convertit une chaîne de tags séparés par des virgules en liste. */
    private List<String> tagsToList(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
            .map(String::trim)
            .filter(t -> !t.isEmpty())
            .collect(Collectors.toList());
    }
}
