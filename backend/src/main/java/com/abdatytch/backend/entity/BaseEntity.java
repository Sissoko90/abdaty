package com.abdatytch.backend.entity;

import com.abdatytch.backend.enums.UserStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Classe de base pour toutes les entités de l'application.
 * Fournit les champs communs : id, createdAt, updatedAt, version, status.
 *
 * Implémente {@link Persistable} afin de gérer l'identifiant côté application
 * (UUID généré en Java) plutôt que de dépendre d'un DEFAULT (UUID()) en base —
 * ce qui rend le code compatible avec toutes les versions de MySQL.
 *
 * {@code isNew()} se base sur {@code createdAt} : nul pour une entité jamais
 * persistée (-> INSERT), renseigné après lecture depuis la base (-> UPDATE).
 * L'audit Spring (@CreatedDate) reste désactivé pour ne pas fausser ce critère ;
 * la colonne created_at est remplie par DEFAULT CURRENT_TIMESTAMP côté base.
 */
@Table
public abstract class BaseEntity implements Persistable<String> {

    /**
     * Identifiant unique de l'entité (UUID), généré côté application.
     */
    @Id
    private String id;

    /**
     * Date et heure de création de l'entité.
     * Automatiquement remplie par Spring Data lors de la création.
     */
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * Date et heure de la dernière modification de l'entité.
     * Automatiquement mise à jour par Spring Data lors de chaque modification.
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Version de l'entité pour le contrôle de concurrence optimiste.
     * Incrémentée automatiquement à chaque modification.
     */
    private Long version;

    /**
     * Statut de l'entité (ACTIVE, INACTIVE, BANNED, BLOCKED).
     * Par défaut, une entité est ACTIVE.
     */
    private UserStatus status;

    /**
     * Constructeur par défaut : statut ACTIVE et identifiant UUID généré.
     */
    public BaseEntity() {
        this.status = UserStatus.ACTIVE;
        this.id = UUID.randomUUID().toString();
    }

    /**
     * Indique à Spring Data si l'entité est nouvelle (INSERT) ou existante (UPDATE).
     * Une entité jamais persistée n'a pas encore de date de création.
     *
     * @return true si l'entité doit être insérée
     */
    @Override
    public boolean isNew() {
        return createdAt == null;
    }

    /**
     * Obtient l'identifiant unique de l'entité.
     * @return l'identifiant
     */
    public String getId() {return id;}

    /**
     * Définit l'identifiant unique de l'entité.
     * @param id l'identifiant à définir
     */
    public void setId(String id) {this.id = id;}

    /**
     * Obtient la date et heure de création de l'entité.
     * @return la date de création
     */
    public LocalDateTime getCreatedAt() {return createdAt;}

    /**
     * Définit la date et heure de création de l'entité.
     * @param createdAt la date de création à définir
     */
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    /**
     * Obtient la date et heure de la dernière modification de l'entité.
     * @return la date de dernière modification
     */
    public LocalDateTime getUpdatedAt() {return updatedAt;}

    /**
     * Définit la date et heure de la dernière modification de l'entité.
     * @param updatedAt la date de dernière modification à définir
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}

    /**
     * Obtient la version de l'entité pour le contrôle de concurrence.
     * @return la version
     */
    public Long getVersion() {return version;}

    /**
     * Définit la version de l'entité.
     * @param version la version à définir
     */
    public void setVersion(Long version) {this.version = version;}

    /**
     * Obtient le statut de l'entité.
     * @return le statut
     */
    public UserStatus getStatus() {return status;}

    /**
     * Définit le statut de l'entité.
     * @param status le statut à définir
     */
    public void setStatus(UserStatus status) {this.status = status;}
}
