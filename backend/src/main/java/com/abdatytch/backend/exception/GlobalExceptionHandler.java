package com.abdatytch.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestionnaire global des exceptions.
 * Capture toutes les exceptions et les transforme en réponses HTTP appropriées.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Gère les ResourceNotFoundException.
     * 
     * @param ex l'exception
     * @param request la requête web
     * @return ResponseEntity avec statut 404
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        logger.error("Ressource non trouvée: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    /**
     * Gère les BadRequestException.
     * 
     * @param ex l'exception
     * @param request la requête web
     * @return ResponseEntity avec statut 400
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Object> handleBadRequestException(BadRequestException ex, WebRequest request) {
        logger.error("Requête invalide: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    /**
     * Gère les ConflictException.
     * 
     * @param ex l'exception
     * @param request la requête web
     * @return ResponseEntity avec statut 409
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Object> handleConflictException(ConflictException ex, WebRequest request) {
        logger.error("Conflit de données: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    /**
     * Gère les UnauthorizedException.
     * 
     * @param ex l'exception
     * @param request la requête web
     * @return ResponseEntity avec statut 401
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorizedException(UnauthorizedException ex, WebRequest request) {
        logger.error("Accès non autorisé: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.UNAUTHORIZED, request);
    }

    /**
     * Gère les ForbiddenException.
     * 
     * @param ex l'exception
     * @param request la requête web
     * @return ResponseEntity avec statut 403
     */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Object> handleForbiddenException(ForbiddenException ex, WebRequest request) {
        logger.error("Accès interdit: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    /**
     * Gère les ServiceUnavailableException.
     * 
     * @param ex l'exception
     * @param request la requête web
     * @return ResponseEntity avec statut 503
     */
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Object> handleServiceUnavailableException(ServiceUnavailableException ex, WebRequest request) {
        logger.error("Service indisponible: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.SERVICE_UNAVAILABLE, request);
    }

    /**
     * Gère toutes les exceptions non gérées.
     * 
     * @param ex l'exception
     * @param request la requête web
     * @return ResponseEntity avec statut 500
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("Erreur interne du serveur: {}", ex.getMessage(), ex);
        return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    /**
     * Construit une réponse d'erreur standardisée.
     * 
     * @param ex l'exception
     * @param status le statut HTTP
     * @param request la requête web
     * @return ResponseEntity avec le corps de l'erreur
     */
    private ResponseEntity<Object> buildErrorResponse(Exception ex, HttpStatus status, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(body, status);
    }
}
