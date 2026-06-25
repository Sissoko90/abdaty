package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de requête pour la création / mise à jour d'un bloc de contenu.
 */
public class SiteContentRequestDTO {

    @NotBlank(message = "La section est obligatoire")
    private String section;

    @NotBlank(message = "La clé de contenu est obligatoire")
    private String contentKey;

    private String valueFr;
    private String valueEn;

    /** Type de contenu : text, html, image, json, number, boolean (par défaut text). */
    private String contentType;

    /** Ordre d'affichage (par défaut 0). */
    private Integer displayOrder;

    /** Visibilité publique (par défaut true). */
    private Boolean active;

    public SiteContentRequestDTO() {}

    // Getters et Setters

    public String getSection() {return section;}

    public void setSection(String section) {this.section = section;}

    public String getContentKey() {return contentKey;}

    public void setContentKey(String contentKey) {this.contentKey = contentKey;}

    public String getValueFr() {return valueFr;}

    public void setValueFr(String valueFr) {this.valueFr = valueFr;}

    public String getValueEn() {return valueEn;}

    public void setValueEn(String valueEn) {this.valueEn = valueEn;}

    public String getContentType() {return contentType;}

    public void setContentType(String contentType) {this.contentType = contentType;}

    public Integer getDisplayOrder() {return displayOrder;}

    public void setDisplayOrder(Integer displayOrder) {this.displayOrder = displayOrder;}

    public Boolean getActive() {return active;}

    public void setActive(Boolean active) {this.active = active;}
}
