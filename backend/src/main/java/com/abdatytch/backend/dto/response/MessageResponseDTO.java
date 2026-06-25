package com.abdatytch.backend.dto.response;

/**
 * DTO pour la réponse de message simple.
 * Contient un message de succès ou d'information.
 */
public class MessageResponseDTO {

    /**
     * Message de réponse.
     */
    private String message;

    public MessageResponseDTO() {}

    public MessageResponseDTO(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
