package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité unifiée représentant TOUT le contenu éditorial du site.
 * Hérite de BaseEntity (id, createdAt, updatedAt, version, status).
 *
 * Choix d'architecture (optimisation) : plutôt qu'une table par section
 * (hero, services, témoignages, FAQ, footer...), une SEULE table stocke
 * l'ensemble du contenu, multilingue. Chaque ligne est un « bloc » de contenu
 * identifié de façon unique par le couple (section, contentKey) :
 *
 *  - section     : la zone du site, ex. "hero", "services", "testimonials",
 *                  "faq", "footer", "about", "contact", "sla", "partners"...
 *  - contentKey  : l'identifiant logique du bloc dans la section. Pour un bloc
 *                  unique on utilisera p.ex. "title" / "subtitle" ; pour une
 *                  liste, un identifiant d'élément, p.ex. "item-1", "item-2".
 *  - valueFr/En  : la valeur traduite (texte brut, HTML, URL d'image, ou JSON
 *                  selon contentType — utile pour les blocs structurés).
 *  - contentType : "text" | "html" | "image" | "json" | "number" | "boolean".
 *  - displayOrder: ordre d'affichage au sein d'une section (listes).
 *  - active      : visibilité publique du bloc.
 */
@Table("site_content")
public class SiteContent extends BaseEntity {

    /** Section du site à laquelle appartient le bloc. */
    private String section;

    /** Identifiant logique du bloc au sein de la section (unique avec section). */
    private String contentKey;

    /** Valeur en français (texte, HTML, URL d'image ou JSON selon contentType). */
    private String valueFr;

    /** Valeur en anglais (texte, HTML, URL d'image ou JSON selon contentType). */
    private String valueEn;

    /** Type de contenu : text, html, image, json, number, boolean. */
    private String contentType;

    /** Ordre d'affichage dans la section. */
    private Integer displayOrder;

    /** Visibilité publique du bloc. */
    private Boolean active;

    public SiteContent() {
        this.contentType = "text";
        this.displayOrder = 0;
        this.active = true;
    }

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
