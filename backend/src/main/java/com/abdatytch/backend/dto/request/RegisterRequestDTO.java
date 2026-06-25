package com.abdatytch.backend.dto.request;

import com.abdatytch.backend.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO pour la requête d'enregistrement d'un utilisateur.
 * Contient les informations nécessaires pour créer un nouveau compte.
 * Le username sera généré automatiquement à partir du nom et prénom.
 */
public class RegisterRequestDTO {

    /**
     * Adresse email de l'utilisateur.
     */
    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "L'adresse email n'est pas valide")
    private String email;

    /**
     * Mot de passe de l'utilisateur.
     * Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
     */
    @NotBlank(message = "Le mot de passe est obligatoire")
    @ValidPassword
    private String password;

    /**
     * Prénom de l'utilisateur.
     */
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 3, max = 50, message = "Le prénom doit contenir entre 3 et 50 caractères")
    private String firstName;

    /**
     * Nom de famille de l'utilisateur.
     */
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 3, max = 50, message = "Le nom doit contenir entre 3 et 50 caractères")
    private String lastName;

    /**
     * Numéro de téléphone de l'utilisateur.
     */
    private String phoneNumber;

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getPassword() {return password;}

    public void setPassword(String password) {this.password = password;}

    public String getFirstName() {return firstName;}

    public void setFirstName(String firstName) {this.firstName = firstName;}

    public String getLastName() {return lastName;}

    public void setLastName(String lastName) {this.lastName = lastName;}


    public String getPhoneNumber() {return phoneNumber;}

    public void setPhoneNumber(String phoneNumber) {this.phoneNumber = phoneNumber;}
}
