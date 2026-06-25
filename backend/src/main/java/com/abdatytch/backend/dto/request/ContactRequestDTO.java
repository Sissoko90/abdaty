package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Charge utile du formulaire de contact (endpoint public).
 */
public class ContactRequestDTO {

    @NotBlank(message = "Le nom est requis")
    private String name;

    @NotBlank(message = "L'email est requis")
    @Email(message = "Email invalide")
    private String email;

    private String company;
    private String phone;
    private String service;

    @NotBlank(message = "Le message est requis")
    private String message;

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getCompany() {return company;}

    public void setCompany(String company) {this.company = company;}

    public String getPhone() {return phone;}

    public void setPhone(String phone) {this.phone = phone;}

    public String getService() {return service;}

    public void setService(String service) {this.service = service;}

    public String getMessage() {return message;}

    public void setMessage(String message) {this.message = message;}
}
