package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * Représentation d'un message de contact pour le frontend admin.
 */
public class ContactMessageDTO {

    private String id;
    private String name;
    private String email;
    private String company;
    private String phone;
    private String service;
    private String message;
    private String ipAddress;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

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

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
