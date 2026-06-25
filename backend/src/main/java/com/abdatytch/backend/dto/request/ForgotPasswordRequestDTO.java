package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO pour la requête d'oubli de mot de passe.
 * Contient l'email pour envoyer un code de réinitialisation.
 */
public class ForgotPasswordRequestDTO {

    /**
     * Adresse email de l'utilisateur.
     */
    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "L'adresse email n'est pas valide")
    private String email;

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}
}
