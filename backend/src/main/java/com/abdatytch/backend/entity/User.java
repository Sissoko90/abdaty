package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant un utilisateur de l'application.
 * Hérite de BaseEntity pour les champs communs (id, createdAt, updatedAt, version, isActive).
 */
@Table("users")
public class User extends BaseEntity {

    /**
     * Nom d'utilisateur unique.
     */
    private String username;

    /**
     * Adresse email de l'utilisateur.
     */
    private String email;

    /**
     * Mot de passe hashé de l'utilisateur.
     */
    private String password;

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
     * Constructeur par défaut.
     */
    public User() {}

    /**
     * Obtient le nom d'utilisateur.
     * @return le nom d'utilisateur
     */
    public String getUsername() {return username;}

    /**
     * Définit le nom d'utilisateur.
     * @param username le nom d'utilisateur à définir
     */
    public void setUsername(String username) {this.username = username;}

    /**
     * Obtient l'adresse email.
     * @return l'adresse email
     */
    public String getEmail() {return email;}

    /**
     * Définit l'adresse email.
     * @param email l'adresse email à définir
     */
    public void setEmail(String email) {this.email = email;}

    /**
     * Obtient le mot de passe hashé.
     * @return le mot de passe hashé
     */
    public String getPassword() {return password;}

    /**
     * Définit le mot de passe hashé.
     * @param password le mot de passe hashé à définir
     */
    public void setPassword(String password) {this.password = password;}

    /**
     * Obtient le prénom.
     * @return le prénom
     */
    public String getFirstName() {return firstName;}

    /**
     * Définit le prénom.
     * @param firstName le prénom à définir
     */
    public void setFirstName(String firstName) {this.firstName = firstName;}

    /**
     * Obtient le nom de famille.
     * @return le nom de famille
     */
    public String getLastName() {return lastName;}

    /**
     * Définit le nom de famille.
     * @param lastName le nom de famille à définir
     */
    public void setLastName(String lastName) {this.lastName = lastName;}

    /**
     * Obtient le numéro de téléphone.
     * @return le numéro de téléphone
     */
    public String getPhoneNumber() {return phoneNumber;}

    /**
     * Définit le numéro de téléphone.
     * @param phoneNumber le numéro de téléphone à définir
     */
    public void setPhoneNumber(String phoneNumber) {this.phoneNumber = phoneNumber;}

    /**
     * Obtient le rôle de l'utilisateur.
     * @return le rôle
     */
    public String getRole() {return role;}

    /**
     * Définit le rôle de l'utilisateur.
     * @param role le rôle à définir
     */
    public void setRole(String role) {this.role = role;}
}
