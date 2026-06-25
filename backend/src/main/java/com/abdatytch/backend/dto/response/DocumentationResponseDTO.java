package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour une entrée de documentation.
 */
public class DocumentationResponseDTO {

    private String id;
    private String titleFr;
    private String titleEn;
    private String slug;
    private String contentFr;
    private String contentEn;
    private String parentId;
    private Integer displayOrder;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DocumentationResponseDTO() {}

    // Getters et Setters

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getTitleFr() {return titleFr;}

    public void setTitleFr(String titleFr) {this.titleFr = titleFr;}

    public String getTitleEn() {return titleEn;}

    public void setTitleEn(String titleEn) {this.titleEn = titleEn;}

    public String getSlug() {return slug;}

    public void setSlug(String slug) {this.slug = slug;}

    public String getContentFr() {return contentFr;}

    public void setContentFr(String contentFr) {this.contentFr = contentFr;}

    public String getContentEn() {return contentEn;}

    public void setContentEn(String contentEn) {this.contentEn = contentEn;}

    public String getParentId() {return parentId;}

    public void setParentId(String parentId) {this.parentId = parentId;}

    public Integer getDisplayOrder() {return displayOrder;}

    public void setDisplayOrder(Integer displayOrder) {this.displayOrder = displayOrder;}

    public Boolean getActive() {return active;}

    public void setActive(Boolean active) {this.active = active;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}

    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
