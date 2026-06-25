package com.abdatytch.backend.dto.response;

import com.abdatytch.backend.enums.UserStatus;

import java.time.LocalDateTime;

/**
 * DTO pour les réponses utilisateur.
 * Contient les données utilisateur à retourner aux clients.
 */
public class UserResponseDTO {

    /**
     * Identifiant unique de l'utilisateur.
     */
    private String id;

    /**
     * Nom d'utilisateur unique.
     */
    private String username;

    /**
     * Adresse email de l'utilisateur.
     */
    private String email;

    /**
     * Prénom de l'utilisateur.
     */
    private String firstName;

    /**
     * Nom de famille de l'utilisateur.
     */
    private String lastName;

    /**
     * Numéro de téléphone de l'utilisateur.
     */
    private String phoneNumber;

    /**
     * Rôle de l'utilisateur dans l'application.
     */
    private String role;

    /**
     * Statut de l'utilisateur.
     */
    private UserStatus status;

    /**
     * Date et heure de création de l'utilisateur.
     */
    private LocalDateTime createdAt;

    /**
     * Date et heure de la dernière modification de l'utilisateur.
     */
    private LocalDateTime updatedAt;

    /**
     * Constructeur par défaut.
     */
    public UserResponseDTO() {}

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getUsername() {return username;}

    public void setUsername(String username) {this.username = username;}

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getFirstName() {return firstName;}

    public void setFirstName(String firstName) {this.firstName = firstName;}

    public String getLastName() {return lastName;}

    public void setLastName(String lastName) {this.lastName = lastName;}

    public String getPhoneNumber() {return phoneNumber;}

    public void setPhoneNumber(String phoneNumber) {this.phoneNumber = phoneNumber;}

    public String getRole() {return role;}

    public void setRole(String role) {this.role = role;}

    public UserStatus getStatus() {return status;}

    public void setStatus(UserStatus status) {this.status = status;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}

    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
