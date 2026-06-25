package com.abdatytch.backend.dto.request;

/**
 * DTO de requête pour la création / mise à jour d'un paramètre du site.
 *
 * Pour une création (POST), la clé est fournie dans ce DTO. Pour une mise à jour
 * (PUT /key/{key}), la clé provient du chemin et le champ {@code key} est ignoré.
 */
public class SiteSettingRequestDTO {

    private String key;
    private String value;
    private String type;
    private String category;

    public SiteSettingRequestDTO() {}

    public String getKey() {return key;}

    public void setKey(String key) {this.key = key;}

    public String getValue() {return value;}

    public void setValue(String value) {this.value = value;}

    public String getType() {return type;}

    public void setType(String type) {this.type = type;}

    public String getCategory() {return category;}

    public void setCategory(String category) {this.category = category;}
}
