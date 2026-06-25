package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO pour la requête de vérification du code.
 * Contient le code de validation et l'email.
 */
public class VerifyCodeRequestDTO {

    /**
     * Adresse email de l'utilisateur.
     */
    @NotBlank(message = "L'adresse email est obligatoire")
    private String email;

    /**
     * Code de validation envoyé par email.
     */
    @NotBlank(message = "Le code de validation est obligatoire")
    private String code;

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getCode() {return code;}

    public void setCode(String code) {this.code = code;}
}
