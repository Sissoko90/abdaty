package com.abdatytch.backend.exception;

/**
 * Exception levée lors d'une tentative d'accès interdit.
 */
public class ForbiddenException extends RuntimeException {

    /**
     * Constructeur avec message d'erreur.
     * @param message le message d'erreur
     */
    public ForbiddenException(String message) {
        super(message);
    }

    /**
     * Constructeur avec message d'erreur et cause.
     * @param message le message d'erreur
     * @param cause la cause de l'exception
     */
    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}
