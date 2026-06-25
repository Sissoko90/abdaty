package com.abdatytch.backend.dto.response;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

/**
 * DTO de réponse pour une entrée de log.
 */
public class LogEntryDTO {

    private String level;
    private LocalDateTime timestamp;
    private String logger;
    private String message;
    private Map<String, String> details;

    public LogEntryDTO() {}

    // Getters et Setters

    public String getLevel() {return level;}

    public void setLevel(String level) {this.level = level;}

    public LocalDateTime getTimestamp() {return timestamp;}

    public void setTimestamp(LocalDateTime timestamp) {this.timestamp = timestamp;}

    public String getLogger() {return logger;}

    public void setLogger(String logger) {this.logger = logger;}

    public String getMessage() {return message;}

    public void setMessage(String message) {this.message = message;}

    public Map<String, String> getDetails() {return details;}

    public void setDetails(Map<String, String> details) {this.details = details;}

    /**
     * Convertit un timestamp en millisecondes en LocalDateTime.
     * 
     * @param timestampMillis timestamp en millisecondes
     * @return LocalDateTime
     */
    public static LocalDateTime fromTimestamp(long timestampMillis) {
        return LocalDateTime.ofInstant(
            java.time.Instant.ofEpochMilli(timestampMillis),
            ZoneId.systemDefault()
        );
    }
}
