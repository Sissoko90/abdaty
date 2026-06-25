package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de requête pour la création / mise à jour d'une entrée de documentation.
 */
public class DocumentationRequestDTO {

    @NotBlank(message = "Le titre en français est obligatoire")
    private String titleFr;

    @NotBlank(message = "Le titre en anglais est obligatoire")
    private String titleEn;

    @NotBlank(message = "Le slug est obligatoire")
    private String slug;

    private String contentFr;
    private String contentEn;

    /** Identifiant de l'entrée parente (null pour une racine). */
    private String parentId;

    /** Ordre d'affichage (par défaut 0). */
    private Integer displayOrder;

    /** Visibilité publique (par défaut true). */
    private Boolean active;

    public DocumentationRequestDTO() {}

    // Getters et Setters

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
}
