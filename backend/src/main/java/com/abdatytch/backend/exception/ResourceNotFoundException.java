package com.abdatytch.backend.exception;

/**
 * Exception levée lorsqu'une ressource n'est pas trouvée.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructeur avec message d'erreur.
     * @param message le message d'erreur
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructeur avec message d'erreur et cause.
     * @param message le message d'erreur
     * @param cause la cause de l'exception
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
