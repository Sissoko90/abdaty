package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour une notification.
 */
public class NotificationResponseDTO {

    private String id;
    private String type;
    private String title;
    private String message;
    private String link;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponseDTO() {}

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getType() {return type;}

    public void setType(String type) {this.type = type;}

    public String getTitle() {return title;}

    public void setTitle(String title) {this.title = title;}

    public String getMessage() {return message;}

    public void setMessage(String message) {this.message = message;}

    public String getLink() {return link;}

    public void setLink(String link) {this.link = link;}

    public Boolean getIsRead() {return isRead;}

    public void setIsRead(Boolean isRead) {this.isRead = isRead;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
