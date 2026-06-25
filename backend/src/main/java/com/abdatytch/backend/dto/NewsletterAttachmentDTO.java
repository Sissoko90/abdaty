package com.abdatytch.backend.dto;

/**
 * Pièce jointe d'une campagne newsletter : URL du fichier (servi sous /uploads)
 * et nom d'affichage (nom d'origine du fichier).
 */
public class NewsletterAttachmentDTO {

    private String url;
    private String filename;

    public NewsletterAttachmentDTO() {}

    public String getUrl() {return url;}

    public void setUrl(String url) {this.url = url;}

    public String getFilename() {return filename;}

    public void setFilename(String filename) {this.filename = filename;}
}
