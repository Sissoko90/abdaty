package com.abdatytch.backend.dto.response;

import com.abdatytch.backend.dto.NewsletterAttachmentDTO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Représentation d'une campagne newsletter renvoyée au frontend admin,
 * incluant les compteurs de suivi (envois, ouvertures, clics).
 */
public class NewsletterCampaignDTO {

    private String id;
    private String subject;
    private String contentHtml;
    private String campaignStatus;
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;
    private Integer recipientCount;
    private Integer sentCount;
    private Integer openCount;
    private Integer clickCount;
    private List<NewsletterAttachmentDTO> attachments;
    private LocalDateTime createdAt;

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

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

    public List<NewsletterAttachmentDTO> getAttachments() {return attachments;}

    public void setAttachments(List<NewsletterAttachmentDTO> attachments) {this.attachments = attachments;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
