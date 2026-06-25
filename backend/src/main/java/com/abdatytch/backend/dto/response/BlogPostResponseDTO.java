package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse pour un article de blog.
 * Renvoyé aussi bien au site public (articles publiés) qu'au panel admin.
 */
public class BlogPostResponseDTO {

    private String id;
    private String titleFr;
    private String titleEn;
    private String slug;
    private String excerptFr;
    private String excerptEn;
    private String contentFr;
    private String contentEn;
    private String authorId;
    private String category;
    private List<String> tags;
    private String featuredImage;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BlogPostResponseDTO() {}

    // Getters et Setters

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

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

    public LocalDateTime getPublishedAt() {return publishedAt;}

    public void setPublishedAt(LocalDateTime publishedAt) {this.publishedAt = publishedAt;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}

    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
