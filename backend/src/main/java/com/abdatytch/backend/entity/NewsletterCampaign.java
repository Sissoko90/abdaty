package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

/**
 * Campagne newsletter (un email envoyé à tous les abonnés actifs).
 * Hérite de BaseEntity. Le cycle de vie est porté par {@code campaignStatus} :
 * DRAFT → SCHEDULED → SENDING → SENT (ou FAILED).
 */
@Table("newsletter_campaigns")
public class NewsletterCampaign extends BaseEntity {

    /** Objet de l'email. */
    private String subject;

    /** Contenu HTML de l'email. */
    private String contentHtml;

    /** DRAFT | SCHEDULED | SENDING | SENT | FAILED */
    private String campaignStatus;

    /** Date d'envoi programmé (NULL si brouillon / envoi immédiat). */
    private LocalDateTime scheduledAt;

    /** Date d'envoi effectif. */
    private LocalDateTime sentAt;

    /** Nombre de destinataires ciblés. */
    private Integer recipientCount;

    /** Nombre d'emails effectivement envoyés. */
    private Integer sentCount;

    /** Nombre d'ouvertures uniques. */
    private Integer openCount;

    /** Nombre de clics uniques. */
    private Integer clickCount;

    /** Pièces jointes en JSON : [{"url":"...","filename":"..."}]. */
    private String attachments;

    public NewsletterCampaign() {
        this.campaignStatus = "DRAFT";
        this.recipientCount = 0;
        this.sentCount = 0;
        this.openCount = 0;
        this.clickCount = 0;
    }

    public String getSubject() {return subject;}

    public void setSubject(String subject) {this.subject = subject;}

    public String getContentHtml() {return contentHtml;}

    public void setContentHtml(String contentHtml) {this.contentHtml = contentHtml;}

    public String getCampaignStatus() {return campaignStatus;}

    public void setCampaignStatus(String campaignStatus) {this.campaignStatus = campaignStatus;}

    public LocalDateTime getScheduledAt() {return scheduledAt;}

    public void setScheduledAt(LocalDateTime scheduledAt) {this.scheduledAt = scheduledAt;}

    public LocalDateTime getSentAt() {return sentAt;}

    public void setSentAt(LocalDateTime sentAt) {this.sentAt = sentAt;}

    public Integer getRecipientCount() {return recipientCount;}

    public void setRecipientCount(Integer recipientCount) {this.recipientCount = recipientCount;}

    public Integer getSentCount() {return sentCount;}

    public void setSentCount(Integer sentCount) {this.sentCount = sentCount;}

    public Integer getOpenCount() {return openCount;}

    public void setOpenCount(Integer openCount) {this.openCount = openCount;}

    public Integer getClickCount() {return clickCount;}

    public void setClickCount(Integer clickCount) {this.clickCount = clickCount;}

    public String getAttachments() {return attachments;}

    public void setAttachments(String attachments) {this.attachments = attachments;}
}
