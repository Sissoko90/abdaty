package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * DTO de requête pour la création d'une clé API.
 */
public class ApiKeyRequestDTO {

    @NotBlank(message = "Le nom de la clé est obligatoire")
    private String name;

    /** Permissions souhaitées (ex: ["send_sms", "view_history"]). */
    private List<String> permissions;

    /** Limite de débit (requêtes/heure). */
    private Integer rateLimit;

    public ApiKeyRequestDTO() {}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public List<String> getPermissions() {return permissions;}

    public void setPermissions(List<String> permissions) {this.permissions = permissions;}

    public Integer getRateLimit() {return rateLimit;}

    public void setRateLimit(Integer rateLimit) {this.rateLimit = rateLimit;}
}
