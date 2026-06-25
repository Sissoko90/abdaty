package com.abdatytch.backend.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Entité représentant un média (fichier uploadé : image, document...).
 * Hérite de BaseEntity (id, createdAt, updatedAt, version, status).
 *
 * Stockage : le fichier binaire est enregistré sur le disque du serveur dans
 * {@code uploads/<mediaDomain>/<filename>} (un sous-dossier par domaine, p.ex.
 * blog, documentation, general). Seul l'URL relative est conservé en base
 * ({@code url}, ex: "/uploads/blog/<uuid>.png").
 */
@Table("media")
public class Media extends BaseEntity {

    /** Nom de fichier stocké sur le disque (généré, unique). */
    private String filename;

    /** Nom de fichier d'origine fourni par l'utilisateur. */
    private String originalFilename;

    /** Type MIME du fichier (ex: image/png). */
    private String fileType;

    /** Taille du fichier en octets. */
    private Long fileSize;

    /** URL relative d'accès au fichier (ex: /uploads/blog/<uuid>.png). */
    private String url;

    /** URL relative d'une éventuelle vignette. */
    private String thumbnailUrl;

    /** Identifiant de l'utilisateur ayant uploadé le fichier. */
    private String uploadedBy;

    /** Domaine / sous-dossier de classement (blog, documentation, general...). */
    private String mediaDomain;

    public Media() {}

    // Getters et Setters

    public String getFilename() {return filename;}

    public void setFilename(String filename) {this.filename = filename;}

    public String getOriginalFilename() {return originalFilename;}

    public void setOriginalFilename(String originalFilename) {this.originalFilename = originalFilename;}

    public String getFileType() {return fileType;}

    public void setFileType(String fileType) {this.fileType = fileType;}

    public Long getFileSize() {return fileSize;}

    public void setFileSize(Long fileSize) {this.fileSize = fileSize;}

    public String getUrl() {return url;}

    public void setUrl(String url) {this.url = url;}

    public String getThumbnailUrl() {return thumbnailUrl;}

    public void setThumbnailUrl(String thumbnailUrl) {this.thumbnailUrl = thumbnailUrl;}

    public String getUploadedBy() {return uploadedBy;}

    public void setUploadedBy(String uploadedBy) {this.uploadedBy = uploadedBy;}

    public String getMediaDomain() {return mediaDomain;}

    public void setMediaDomain(String mediaDomain) {this.mediaDomain = mediaDomain;}
}
