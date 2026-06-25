package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.response.LogEntryDTO;
import com.abdatytch.backend.dto.response.LogStatisticsDTO;
import com.abdatytch.backend.logging.InMemoryLogAppender;
import com.abdatytch.backend.service.ILogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Implémentation du service pour les logs.
 * Collecte les logs depuis l'appender en mémoire.
 */
@Service
public class LogService implements ILogService {

    private static final Logger logger = LoggerFactory.getLogger(LogService.class);

    private final InMemoryLogAppender logAppender;
    private final ObjectMapper objectMapper;

    @Autowired
    public LogService(InMemoryLogAppender logAppender, ObjectMapper objectMapper) {
        this.logAppender = logAppender;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<LogStatisticsDTO> getStatistics() {
        logger.debug("Récupération des statistiques de logs");
        return Mono.fromCallable(() -> {
            InMemoryLogAppender.LogStatistics stats = logAppender.getStatistics();
            LogStatisticsDTO dto = new LogStatisticsDTO();
            dto.setTotalLogs(stats.getTotalLogs());
            dto.setErrorCount(stats.getErrorCount());
            dto.setWarningCount(stats.getWarningCount());
            dto.setInfoCount(stats.getInfoCount());
            return dto;
        });
    }

    @Override
    public Flux<LogEntryDTO> getAllLogs(int page, int size) {
        logger.debug("Récupération des logs avec pagination - page: {}, size: {}", page, size);
        return Mono.fromCallable(logAppender::getAllLogs)
            .flatMapMany(Flux::fromIterable)
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Flux<LogEntryDTO> getAllLogs() {
        logger.debug("Récupération de tous les logs");
        return Mono.fromCallable(logAppender::getAllLogs)
            .flatMapMany(Flux::fromIterable)
            .map(this::toDTO);
    }

    @Override
    public Flux<LogEntryDTO> getLogsByLevel(String level, int page, int size) {
        logger.debug("Récupération des logs avec niveau: {}, page: {}, size: {}", level, page, size);
        return Mono.fromCallable(() -> logAppender.getLogsByLevel(level))
            .flatMapMany(Flux::fromIterable)
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Flux<LogEntryDTO> getLogsByLevel(String level) {
        logger.debug("Récupération des logs avec niveau: {}", level);
        return Mono.fromCallable(() -> logAppender.getLogsByLevel(level))
            .flatMapMany(Flux::fromIterable)
            .map(this::toDTO);
    }

    @Override
    public Flux<LogEntryDTO> searchLogs(String searchTerm, int page, int size) {
        logger.debug("Recherche des logs avec terme: {}, page: {}, size: {}", searchTerm, page, size);
        return Mono.fromCallable(() -> logAppender.searchLogs(searchTerm))
            .flatMapMany(Flux::fromIterable)
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Flux<LogEntryDTO> searchLogs(String searchTerm) {
        logger.debug("Recherche des logs avec terme: {}", searchTerm);
        return Mono.fromCallable(() -> logAppender.searchLogs(searchTerm))
            .flatMapMany(Flux::fromIterable)
            .map(this::toDTO);
    }

    @Override
    public Flux<LogEntryDTO> filterLogs(String level, String searchTerm, int page, int size) {
        logger.debug("Filtrage des logs - niveau: {}, terme: {}, page: {}, size: {}", level, searchTerm, page, size);
        return Mono.fromCallable(() -> logAppender.getLogsByLevel(level))
            .flatMapMany(Flux::fromIterable)
            .filter(entry -> entry.getMessage().toLowerCase().contains(searchTerm.toLowerCase()) ||
                         entry.getLogger().toLowerCase().contains(searchTerm.toLowerCase()))
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Flux<LogEntryDTO> filterLogs(String level, String searchTerm) {
        logger.debug("Filtrage des logs - niveau: {}, terme: {}", level, searchTerm);
        return Mono.fromCallable(() -> logAppender.getLogsByLevel(level))
            .flatMapMany(Flux::fromIterable)
            .filter(entry -> entry.getMessage().toLowerCase().contains(searchTerm.toLowerCase()) ||
                         entry.getLogger().toLowerCase().contains(searchTerm.toLowerCase()))
            .map(this::toDTO);
    }

    @Override
    public Mono<String> exportLogsJson() {
        logger.info("Export de tous les logs en JSON");
        return getAllLogs()
            .collectList()
            .map(this::toJson);
    }

    @Override
    public Mono<String> exportLogsCsv() {
        logger.info("Export de tous les logs en CSV");
        return getAllLogs()
            .collectList()
            .map(this::toCsv);
    }

    @Override
    public Mono<String> exportFilteredLogsJson(String level, String searchTerm) {
        logger.info("Export des logs filtrés en JSON - niveau: {}, terme: {}", level, searchTerm);
        return filterLogs(level, searchTerm)
            .collectList()
            .map(this::toJson);
    }

    @Override
    public Mono<String> exportFilteredLogsCsv(String level, String searchTerm) {
        logger.info("Export des logs filtrés en CSV - niveau: {}, terme: {}", level, searchTerm);
        return filterLogs(level, searchTerm)
            .collectList()
            .map(this::toCsv);
    }

    @Override
    public Mono<Void> clearLogs() {
        logger.info("Vidage de la mémoire des logs");
        return Mono.fromRunnable(logAppender::clearLogs);
    }

    /**
     * Convertit une entrée de log de l'appender en DTO.
     * 
     * @param entry l'entrée de log
     * @return le DTO
     */
    private LogEntryDTO toDTO(InMemoryLogAppender.LogEntry entry) {
        LogEntryDTO dto = new LogEntryDTO();
        dto.setLevel(entry.getLevel());
        dto.setTimestamp(LogEntryDTO.fromTimestamp(entry.getTimestamp()));
        dto.setLogger(entry.getLogger());
        dto.setMessage(entry.getMessage());
        dto.setDetails(entry.getMdcProperties());
        return dto;
    }

    /**
     * Convertit une liste de DTO en JSON.
     * 
     * @param logs la liste de DTO
     * @return la chaîne JSON
     */
    private String toJson(List<LogEntryDTO> logs) {
        try {
            return objectMapper.writeValueAsString(logs);
        } catch (Exception e) {
            logger.error("Erreur lors de la conversion des logs en JSON", e);
            return "[]";
        }
    }

    /**
     * Convertit une liste de DTO en CSV.
     * 
     * @param logs la liste de DTO
     * @return la chaîne CSV
     */
    private String toCsv(List<LogEntryDTO> logs) {
        StringBuilder csv = new StringBuilder();
        // En-tête CSV
        csv.append("Level,Timestamp,Logger,Message\n");
        
        for (LogEntryDTO log : logs) {
            csv.append(escapeCsv(log.getLevel())).append(",");
            csv.append(escapeCsv(log.getTimestamp() != null ? log.getTimestamp().toString() : "")).append(",");
            csv.append(escapeCsv(log.getLogger())).append(",");
            csv.append(escapeCsv(log.getMessage())).append("\n");
        }
        
        return csv.toString();
    }

    /**
     * Échappe une valeur pour CSV.
     * 
     * @param value la valeur à échapper
     * @return la valeur échappée
     */
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
