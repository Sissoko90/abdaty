package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO pour la requête de connexion d'un utilisateur.
 * Contient les identifiants nécessaires pour se connecter.
 */
public class LoginRequestDTO {

    /**
     * Adresse email de l'utilisateur.
     */
    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "L'adresse email n'est pas valide")
    private String email;

    /**
     * Mot de passe de l'utilisateur.
     */
    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getPassword() {return password;}

    public void setPassword(String password) {this.password = password;}
}
