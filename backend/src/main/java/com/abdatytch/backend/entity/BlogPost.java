package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

/**
 * Entité représentant un article de blog.
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, status).
 *
 * Note : le contenu est bilingue (français / anglais) afin d'alimenter le site
 * multilingue (next-intl). Le statut éditorial est porté par {@code postStatus}
 * ("draft" / "published") et NON par {@code status} de BaseEntity, qui reste
 * réservé au cycle de vie technique de l'entité (ACTIVE/INACTIVE...).
 *
 * Les noms de champs en camelCase sont automatiquement convertis en colonnes
 * snake_case par Spring Data R2DBC (ex: titleFr -> title_fr).
 */
@Table("blog_posts")
public class BlogPost extends BaseEntity {

    /** Titre de l'article en français. */
    private String titleFr;

    /** Titre de l'article en anglais. */
    private String titleEn;

    /** Identifiant lisible et unique utilisé dans l'URL (ex: "mon-article"). */
    private String slug;

    /** Résumé (chapô) en français. */
    private String excerptFr;

    /** Résumé (chapô) en anglais. */
    private String excerptEn;

    /** Contenu complet en français (HTML / Markdown). */
    private String contentFr;

    /** Contenu complet en anglais (HTML / Markdown). */
    private String contentEn;

    /** Identifiant de l'auteur (référence users.id). */
    private String authorId;

    /** Catégorie de l'article (ex: "Technologie", "Sécurité"). */
    private String category;

    /**
     * Liste des tags, stockée sous forme de chaîne séparée par des virgules
     * (MySQL ne dispose pas de type tableau natif). La conversion vers/depuis
     * une liste est réalisée dans le mapper.
     */
    private String tags;

    /** URL de l'image à la une. */
    private String featuredImage;

    /** Statut éditorial : "draft" (brouillon) ou "published" (publié). */
    private String postStatus;

    /** Date de publication (renseignée lors du passage en "published"). */
    private LocalDateTime publishedAt;

    public BlogPost() {
        this.postStatus = "draft";
    }

    // Getters et Setters

    public String getTitleFr() {return titleFr;}

    public void setTitleFr(String titleFr) {this.titleFr = titleFr;}

    public String getTitleEn() {return titleEn;}

    public void setTitleEn(String titleEn) {this.titleEn = titleEn;}

    public String getSlug() {return slug;}

    public void setSlug(String slug) {this.slug = slug;}

    public String getExcerptFr() {return excerptFr;}

    public void setExcerptFr(String excerptFr) {this.excerptFr = excerptFr;}

    public String getExcerptEn() {return excerptEn;}

    public void setExcerptEn(String excerptEn) {this.excerptEn = excerptEn;}

    public String getContentFr() {return contentFr;}

    public void setContentFr(String contentFr) {this.contentFr = contentFr;}

    public String getContentEn() {return contentEn;}

    public void setContentEn(String contentEn) {this.contentEn = contentEn;}

    public String getAuthorId() {return authorId;}

    public void setAuthorId(String authorId) {this.authorId = authorId;}

    public String getCategory() {return category;}

    public void setCategory(String category) {this.category = category;}

    public String getTags() {return tags;}

    public void setTags(String tags) {this.tags = tags;}

    public String getFeaturedImage() {return featuredImage;}

    public void setFeaturedImage(String featuredImage) {this.featuredImage = featuredImage;}

    public String getPostStatus() {return postStatus;}

    public void setPostStatus(String postStatus) {this.postStatus = postStatus;}

    public LocalDateTime getPublishedAt() {return publishedAt;}

    public void setPublishedAt(LocalDateTime publishedAt) {this.publishedAt = publishedAt;}
}
