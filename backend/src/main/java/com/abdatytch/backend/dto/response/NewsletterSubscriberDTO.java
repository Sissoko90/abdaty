package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * Représentation d'un abonné newsletter renvoyée au frontend admin.
 */
public class NewsletterSubscriberDTO {

    private String id;
    private String email;
    private String name;
    private String locale;
    private Boolean subscribed;
    private String source;
    private LocalDateTime createdAt;

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getLocale() {return locale;}

    public void setLocale(String locale) {this.locale = locale;}

    public Boolean getSubscribed() {return subscribed;}

    public void setSubscribed(Boolean subscribed) {this.subscribed = subscribed;}

    public String getSource() {return source;}

    public void setSource(String source) {this.source = source;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
