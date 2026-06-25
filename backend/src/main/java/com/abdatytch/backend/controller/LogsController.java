package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.response.LogEntryDTO;
import com.abdatytch.backend.dto.response.LogStatisticsDTO;
import com.abdatytch.backend.service.ILogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controller pour les logs système.
 * Expose les logs depuis l'appender en mémoire pour le dashboard.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/logs")
@Tag(name = "Logs", description = "API pour les logs système")
public class LogsController {

    private static final Logger logger = LoggerFactory.getLogger(LogsController.class);

    private final ILogService logService;

    @Autowired
    public LogsController(ILogService logService) {
        this.logService = logService;
    }

    /**
     * Obtient les statistiques de logs.
     * 
     * @return les statistiques
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les statistiques de logs", description = "Récupère les statistiques de logs (total, erreurs, avertissements, info)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès")
    })
    public Mono<ResponseEntity<LogStatisticsDTO>> getStatistics() {
        logger.info("Récupération des statistiques de logs");
        return logService.getStatistics()
            .map(ResponseEntity::ok);
    }

    /**
     * Obtient tous les logs avec pagination.
     * 
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir tous les logs", description = "Récupère tous les logs en mémoire avec pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs récupérés avec succès")
    })
    public Flux<LogEntryDTO> getAllLogs(
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Récupération de tous les logs - page: {}, size: {}", page, size);
        return logService.getAllLogs(page, size);
    }

    /**
     * Obtient les logs filtrés par niveau avec pagination.
     * 
     * @param level le niveau de log (INFO, WARN, ERROR, SUCCESS)
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    @GetMapping("/level/{level}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtenir les logs par niveau", description = "Récupère les logs filtrés par niveau avec pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs récupérés avec succès")
    })
    public Flux<LogEntryDTO> getLogsByLevel(
            @Parameter(description = "Niveau de log (INFO, WARN, ERROR, SUCCESS)") @PathVariable String level,
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Récupération des logs avec niveau: {}, page: {}, size: {}", level, page, size);
        return logService.getLogsByLevel(level, page, size);
    }

    /**
     * Recherche les logs contenant un terme avec pagination.
     * 
     * @param searchTerm le terme de recherche
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Rechercher les logs", description = "Recherche les logs contenant un terme avec pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs récupérés avec succès")
    })
    public Flux<LogEntryDTO> searchLogs(
            @Parameter(description = "Terme de recherche") @RequestParam String searchTerm,
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Recherche des logs avec terme: {}, page: {}, size: {}", searchTerm, page, size);
        return logService.searchLogs(searchTerm, page, size);
    }

    /**
     * Filtre les logs par niveau et terme de recherche avec pagination.
     * 
     * @param level le niveau de log
     * @param searchTerm le terme de recherche
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    @GetMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filtrer les logs", description = "Filtre les logs par niveau et terme de recherche avec pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs récupérés avec succès")
    })
    public Flux<LogEntryDTO> filterLogs(
            @Parameter(description = "Niveau de log") @RequestParam(required = false) String level,
            @Parameter(description = "Terme de recherche") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "Numéro de page (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        logger.info("Filtrage des logs - niveau: {}, terme: {}, page: {}, size: {}", level, searchTerm, page, size);
        if (level != null && searchTerm != null) {
            return logService.filterLogs(level, searchTerm, page, size);
        } else if (level != null) {
            return logService.getLogsByLevel(level, page, size);
        } else if (searchTerm != null) {
            return logService.searchLogs(searchTerm, page, size);
        } else {
            return logService.getAllLogs(page, size);
        }
    }

    /**
     * Exporte tous les logs au format JSON.
     * 
     * @return les logs au format JSON
     */
    @GetMapping(value = "/export/json", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Exporter tous les logs en JSON", description = "Exporte tous les logs au format JSON")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs exportés avec succès")
    })
    public Mono<ResponseEntity<String>> exportLogsJson() {
        logger.info("Export de tous les logs en JSON");
        return logService.exportLogsJson()
            .map(json -> ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=logs.json")
                .body(json));
    }

    /**
     * Exporte tous les logs au format CSV.
     * 
     * @return les logs au format CSV
     */
    @GetMapping(value = "/export/csv", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Exporter tous les logs en CSV", description = "Exporte tous les logs au format CSV")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs exportés avec succès")
    })
    public Mono<ResponseEntity<String>> exportLogsCsv() {
        logger.info("Export de tous les logs en CSV");
        return logService.exportLogsCsv()
            .map(csv -> ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=logs.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv));
    }

    /**
     * Exporte les logs filtrés au format JSON.
     * 
     * @param level le niveau de log
     * @param searchTerm le terme de recherche
     * @return les logs filtrés au format JSON
     */
    @GetMapping(value = "/export/json/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Exporter les logs filtrés en JSON", description = "Exporte les logs filtrés au format JSON")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs exportés avec succès")
    })
    public Mono<ResponseEntity<String>> exportFilteredLogsJson(
            @Parameter(description = "Niveau de log") @RequestParam(required = false) String level,
            @Parameter(description = "Terme de recherche") @RequestParam(required = false) String searchTerm) {
        logger.info("Export des logs filtrés en JSON - niveau: {}, terme: {}", level, searchTerm);
        return logService.exportFilteredLogsJson(level, searchTerm)
            .map(json -> ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=logs_filtered.json")
                .body(json));
    }

    /**
     * Exporte les logs filtrés au format CSV.
     * 
     * @param level le niveau de log
     * @param searchTerm le terme de recherche
     * @return les logs filtrés au format CSV
     */
    @GetMapping(value = "/export/csv/filter", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Exporter les logs filtrés en CSV", description = "Exporte les logs filtrés au format CSV")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs exportés avec succès")
    })
    public Mono<ResponseEntity<String>> exportFilteredLogsCsv(
            @Parameter(description = "Niveau de log") @RequestParam(required = false) String level,
            @Parameter(description = "Terme de recherche") @RequestParam(required = false) String searchTerm) {
        logger.info("Export des logs filtrés en CSV - niveau: {}, terme: {}", level, searchTerm);
        return logService.exportFilteredLogsCsv(level, searchTerm)
            .map(csv -> ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=logs_filtered.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv));
    }

    /**
     * Vide la mémoire des logs.
     * 
     * @return confirmation
     */
    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Vider les logs", description = "Vide la mémoire des logs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logs vidés avec succès")
    })
    public Mono<ResponseEntity<String>> clearLogs() {
        logger.info("Vidage de la mémoire des logs");
        return logService.clearLogs()
            .thenReturn(ResponseEntity.ok("Logs cleared"));
    }
}
