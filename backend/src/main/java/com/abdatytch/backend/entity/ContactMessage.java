package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Message reçu via le formulaire de contact du site. Hérite de BaseEntity.
 */
@Table("contact_messages")
public class ContactMessage extends BaseEntity {

    private String name;
    private String email;
    private String company;
    private String phone;
    private String service;
    private String message;
    private String ipAddress;
    /** Lu par l'admin ? (is_read pour éviter le mot réservé MySQL `read`) */
    private Boolean isRead;

    public ContactMessage() {
        this.isRead = false;
    }

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

    public String getIpAddress() {return ipAddress;}

    public void setIpAddress(String ipAddress) {this.ipAddress = ipAddress;}

    public Boolean getIsRead() {return isRead;}

    public void setIsRead(Boolean isRead) {this.isRead = isRead;}
}
