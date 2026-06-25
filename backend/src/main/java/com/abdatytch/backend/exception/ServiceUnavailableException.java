package com.abdatytch.backend.exception;

/**
 * Exception levée lorsqu'un service est temporairement indisponible.
 */
public class ServiceUnavailableException extends RuntimeException {

    /**
     * Constructeur avec message d'erreur.
     * @param message le message d'erreur
     */
    public ServiceUnavailableException(String message) {
        super(message);
    }

    /**
     * Constructeur avec message d'erreur et cause.
     * @param message le message d'erreur
     * @param cause la cause de l'exception
     */
    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
