package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour un média.
 */
public class MediaResponseDTO {

    private String id;
    private String filename;
    private String originalFilename;
    private String fileType;
    private Long fileSize;
    private String url;
    private String thumbnailUrl;
    private String uploadedBy;
    private String domain;
    private LocalDateTime createdAt;

    public MediaResponseDTO() {}

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

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

    public String getDomain() {return domain;}

    public void setDomain(String domain) {this.domain = domain;}

    public LocalDateTime getCreatedAt() {return createdAt;}

    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
