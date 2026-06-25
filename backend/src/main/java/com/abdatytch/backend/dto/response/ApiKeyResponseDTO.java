package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse pour une clé API.
 *
 * Le champ {@code key} contient :
 *  - la clé COMPLÈTE uniquement dans la réponse de création ;
 *  - une version MASQUÉE (préfixe + •) dans les réponses de liste.
 */
public class ApiKeyResponseDTO {

    private String id;
    private String name;
    private String key;
    private String status;
    private List<String> permissions;
    private Integer rateLimit;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;

    public ApiKeyResponseDTO() {}

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getKey() {return key;}

    public void setKey(String key) {this.key = key;}

    public String getStatus() {return status;}

    public void setStatus(String status) {this.status = status;}

    public List<String> getPermissions() {return permissions;}

    public void setPermissions(List<String> permissions) {this.permissions = permissions;}

    public Integer getRateLimit() {return rateLimit;}

    public void setRateLimit(Integer rateLimit) {this.rateLimit = rateLimit;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public LocalDateTime getLastUsedAt() {return lastUsedAt;}

    public void setLastUsedAt(LocalDateTime lastUsedAt) {this.lastUsedAt = lastUsedAt;}
}
