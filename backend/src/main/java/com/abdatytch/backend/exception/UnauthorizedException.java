package com.abdatytch.backend.exception;

/**
 * Exception levée lors d'une tentative d'accès non autorisé.
 */
public class UnauthorizedException extends RuntimeException {

    /**
     * Constructeur avec message d'erreur.
     * @param message le message d'erreur
     */
    public UnauthorizedException(String message) {
        super(message);
    }

    /**
     * Constructeur avec message d'erreur et cause.
     * @param message le message d'erreur
     * @param cause la cause de l'exception
     */
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
