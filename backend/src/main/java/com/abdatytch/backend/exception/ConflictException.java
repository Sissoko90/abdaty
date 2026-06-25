package com.abdatytch.backend.exception;

/**
 * Exception levée lors d'un conflit de données.
 */
public class ConflictException extends RuntimeException {

    /**
     * Constructeur avec message d'erreur.
     * @param message le message d'erreur
     */
    public ConflictException(String message) {
        super(message);
    }

    /**
     * Constructeur avec message d'erreur et cause.
     * @param message le message d'erreur
     * @param cause la cause de l'exception
     */
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
