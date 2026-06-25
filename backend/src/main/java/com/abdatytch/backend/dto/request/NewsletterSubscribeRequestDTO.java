package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Charge utile d'inscription à la newsletter (endpoint public).
 */
public class NewsletterSubscribeRequestDTO {

    @NotBlank(message = "L'email est requis")
    @Email(message = "Email invalide")
    private String email;

    private String name;

    /** Langue préférée ("fr" / "en"). */
    private String locale;

    /** Origine de l'inscription (ex: "footer"). */
    private String source;

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getLocale() {return locale;}

    public void setLocale(String locale) {this.locale = locale;}

    public String getSource() {return source;}

    public void setSource(String source) {this.source = source;}
}
