package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour un paramètre du site.
 */
public class SiteSettingResponseDTO {

    private String id;
    private String key;
    private String value;
    private String type;
    private String category;
    private LocalDateTime updatedAt;

    public SiteSettingResponseDTO() {}

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getKey() {return key;}

    public void setKey(String key) {this.key = key;}

    public String getValue() {return value;}

    public void setValue(String value) {this.value = value;}

    public String getType() {return type;}

    public void setType(String type) {this.type = type;}

    public String getCategory() {return category;}

    public void setCategory(String category) {this.category = category;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}

    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
