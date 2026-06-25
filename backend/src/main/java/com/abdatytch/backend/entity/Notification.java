package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant une notification destinée à un utilisateur.
 * Hérite de BaseEntity (id, createdAt, updatedAt, version, status).
 *
 * Le champ « lu » est nommé {@code isRead} (colonne {@code is_read}) pour éviter
 * le mot réservé MySQL {@code read}.
 */
@Table("notifications")
public class Notification extends BaseEntity {

    /** Identifiant du destinataire (référence users.id). */
    private String userId;

    /** Type : "success", "info", "warning", "error". */
    private String type;

    /** Titre de la notification. */
    private String title;

    /** Message détaillé. */
    private String message;

    /** Lien associé (optionnel), ex: "/dashboard/api-keys". */
    private String link;

    /** Indique si la notification a été lue. */
    private Boolean isRead;

    public Notification() {
        this.isRead = false;
    }

    // Getters et Setters

    public String getUserId() {return userId;}

    public void setUserId(String userId) {this.userId = userId;}

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
}
