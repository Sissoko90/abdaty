package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour un bloc de contenu éditorial.
 */
public class SiteContentResponseDTO {

    private String id;
    private String section;
    private String contentKey;
    private String valueFr;
    private String valueEn;
    private String contentType;
    private Integer displayOrder;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SiteContentResponseDTO() {}

    // Getters et Setters

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

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

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}

    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
