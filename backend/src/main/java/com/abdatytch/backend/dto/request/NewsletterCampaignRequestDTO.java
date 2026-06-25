package com.abdatytch.backend.dto.request;

import com.abdatytch.backend.dto.NewsletterAttachmentDTO;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Charge utile de création / mise à jour d'une campagne newsletter (admin).
 */
public class NewsletterCampaignRequestDTO {

    @NotBlank(message = "L'objet est requis")
    private String subject;

    @NotBlank(message = "Le contenu est requis")
    private String contentHtml;

    /** Date d'envoi programmé (NULL = brouillon / envoi immédiat ultérieur). */
    private LocalDateTime scheduledAt;

    /** Pièces jointes (PDF, CSV, …). */
    private List<NewsletterAttachmentDTO> attachments;

    public String getSubject() {return subject;}

    public void setSubject(String subject) {this.subject = subject;}

    public String getContentHtml() {return contentHtml;}

    public void setContentHtml(String contentHtml) {this.contentHtml = contentHtml;}

    public LocalDateTime getScheduledAt() {return scheduledAt;}

    public void setScheduledAt(LocalDateTime scheduledAt) {this.scheduledAt = scheduledAt;}

    public List<NewsletterAttachmentDTO> getAttachments() {return attachments;}

    public void setAttachments(List<NewsletterAttachmentDTO> attachments) {this.attachments = attachments;}
}
