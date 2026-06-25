package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * DTO de requête pour la création / mise à jour d'un article de blog.
 * Reçu depuis le panel d'administration.
 */
public class BlogPostRequestDTO {

    @NotBlank(message = "Le titre en français est obligatoire")
    private String titleFr;

    @NotBlank(message = "Le titre en anglais est obligatoire")
    private String titleEn;

    @NotBlank(message = "Le slug est obligatoire")
    private String slug;

    private String excerptFr;
    private String excerptEn;
    private String contentFr;
    private String contentEn;

    /** Identifiant de l'auteur (facultatif ; peut être renseigné côté serveur). */
    private String authorId;

    private String category;

    /** Liste des tags (exposée en tableau, stockée en chaîne côté entité). */
    private List<String> tags;

    private String featuredImage;

    /** Statut éditorial souhaité : "draft" ou "published". Par défaut "draft". */
    private String status;

    public BlogPostRequestDTO() {}

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

    public List<String> getTags() {return tags;}

    public void setTags(List<String> tags) {this.tags = tags;}

    public String getFeaturedImage() {return featuredImage;}

    public void setFeaturedImage(String featuredImage) {this.featuredImage = featuredImage;}

    public String getStatus() {return status;}

    public void setStatus(String status) {this.status = status;}
}
