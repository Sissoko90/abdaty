package com.abdatytch.backend.exception;

/**
 * Exception levée lors d'une requête invalide.
 */
public class BadRequestException extends RuntimeException {

    /**
     * Constructeur avec message d'erreur.
     * @param message le message d'erreur
     */
    public BadRequestException(String message) {
        super(message);
    }

    /**
     * Constructeur avec message d'erreur et cause.
     * @param message le message d'erreur
     * @param cause la cause de l'exception
     */
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
