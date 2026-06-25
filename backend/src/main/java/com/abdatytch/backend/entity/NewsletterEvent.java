package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Événement de suivi d'une campagne newsletter : envoi, ouverture ou clic.
 * La date de l'événement = createdAt (BaseEntity).
 */
@Table("newsletter_events")
public class NewsletterEvent extends BaseEntity {

    /** Campagne concernée (référence newsletter_campaigns.id). */
    private String campaignId;

    /** Abonné concerné (référence newsletter_subscribers.id). */
    private String subscriberId;

    /** SENT | OPEN | CLICK */
    private String eventType;

    /** URL cliquée (pour les événements CLICK uniquement). */
    private String url;

    /** Adresse IP à l'origine de l'événement (ouverture/clic). */
    private String ipAddress;

    public NewsletterEvent() {}

    public NewsletterEvent(String campaignId, String subscriberId, String eventType) {
        this.campaignId = campaignId;
        this.subscriberId = subscriberId;
        this.eventType = eventType;
    }

    public String getCampaignId() {return campaignId;}

    public void setCampaignId(String campaignId) {this.campaignId = campaignId;}

    public String getSubscriberId() {return subscriberId;}

    public void setSubscriberId(String subscriberId) {this.subscriberId = subscriberId;}

    public String getEventType() {return eventType;}

    public void setEventType(String eventType) {this.eventType = eventType;}

    public String getUrl() {return url;}

    public void setUrl(String url) {this.url = url;}

    public String getIpAddress() {return ipAddress;}

    public void setIpAddress(String ipAddress) {this.ipAddress = ipAddress;}
}
