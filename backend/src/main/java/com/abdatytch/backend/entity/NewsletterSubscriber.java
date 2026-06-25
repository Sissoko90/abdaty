package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

/**
 * Abonné à la newsletter. Hérite de BaseEntity (id, createdAt, updatedAt...).
 *
 * {@code subscribed} = abonné actif. Le passer à {@code false} « désactive »
 * l'abonné (il ne reçoit plus les campagnes) sans le supprimer.
 */
@Table("newsletter_subscribers")
public class NewsletterSubscriber extends BaseEntity {

    /** Adresse email (unique). */
    private String email;

    /** Nom de l'abonné (optionnel). */
    private String name;

    /** Langue préférée ("fr" / "en"). */
    private String locale;

    /** Abonné actif ? false = désactivé / désinscrit. */
    private Boolean subscribed;

    /** Jeton opaque pour le lien de désinscription public. */
    private String unsubscribeToken;

    /** Origine de l'inscription (ex: "footer", "home"). */
    private String source;

    public NewsletterSubscriber() {
        this.subscribed = true;
        this.locale = "fr";
        this.unsubscribeToken = UUID.randomUUID().toString().replace("-", "");
    }

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getLocale() {return locale;}

    public void setLocale(String locale) {this.locale = locale;}

    public Boolean getSubscribed() {return subscribed;}

    public void setSubscribed(Boolean subscribed) {this.subscribed = subscribed;}

    public String getUnsubscribeToken() {return unsubscribeToken;}

    public void setUnsubscribeToken(String unsubscribeToken) {this.unsubscribeToken = unsubscribeToken;}

    public String getSource() {return source;}

    public void setSource(String source) {this.source = source;}
}
