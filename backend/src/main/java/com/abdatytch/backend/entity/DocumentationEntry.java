package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant une entrée de documentation.
 * Hérite de BaseEntity (id, createdAt, updatedAt, version, status).
 *
 * La documentation est hiérarchique : une entrée peut référencer une entrée
 * parente via {@code parentId} (auto-référence vers documentation.id), ce qui
 * permet de construire une arborescence (sections / sous-sections).
 *
 * Contenu bilingue (fr/en) pour alimenter le site multilingue.
 */
@Table("documentation")
public class DocumentationEntry extends BaseEntity {

    /** Titre en français. */
    private String titleFr;

    /** Titre en anglais. */
    private String titleEn;

    /** Slug unique utilisé dans l'URL. */
    private String slug;

    /** Contenu en français (HTML / Markdown). */
    private String contentFr;

    /** Contenu en anglais (HTML / Markdown). */
    private String contentEn;

    /** Identifiant de l'entrée parente (null pour une entrée racine). */
    private String parentId;

    /** Ordre d'affichage parmi les entrées de même niveau. */
    private Integer displayOrder;

    /** Indique si l'entrée est visible publiquement. */
    private Boolean active;

    public DocumentationEntry() {
        this.displayOrder = 0;
        this.active = true;
    }

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
