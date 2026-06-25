package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant un paramètre de configuration du site (clé/valeur).
 * Hérite de BaseEntity (id, createdAt, updatedAt, version, status).
 *
 * Les noms de colonnes utilisent le préfixe `setting_` afin d'éviter les mots
 * réservés MySQL (`key`, `value`). Le mapping camelCase -> snake_case de R2DBC
 * produit : settingKey -> setting_key, settingValue -> setting_value, etc.
 *
 * ⚠️ Ce magasin est destiné à de la configuration d'affichage (nom du site,
 * SEO, réseaux sociaux, thème...) potentiellement lisible publiquement. Il ne
 * doit PAS contenir de secrets (clés d'API tierces, mots de passe...).
 */
@Table("site_settings")
public class SiteSetting extends BaseEntity {

    /** Clé unique du paramètre (ex: "site.name", "social.twitter"). */
    private String settingKey;

    /** Valeur du paramètre (sérialisée en texte). */
    private String settingValue;

    /** Type de la valeur : "string", "number", "boolean", "json". */
    private String settingType;

    /** Catégorie : "general", "seo", "social", "theme"... */
    private String category;

    public SiteSetting() {}

    public SiteSetting(String settingKey, String settingValue, String settingType, String category) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.settingType = settingType;
        this.category = category;
    }

    // Getters et Setters

    public String getSettingKey() {return settingKey;}

    public void setSettingKey(String settingKey) {this.settingKey = settingKey;}

    public String getSettingValue() {return settingValue;}

    public void setSettingValue(String settingValue) {this.settingValue = settingValue;}

    public String getSettingType() {return settingType;}

    public void setSettingType(String settingType) {this.settingType = settingType;}

    public String getCategory() {return category;}

    public void setCategory(String category) {this.category = category;}
}
