package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.LogEntryDTO;
import com.abdatytch.backend.dto.response.LogStatisticsDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service pour les logs.
 * Définit les méthodes pour collecter les logs depuis l'appender en mémoire.
 */
public interface ILogService {

    /**
     * Obtient toutes les statistiques de logs.
     * 
     * @return les statistiques
     */
    Mono<LogStatisticsDTO> getStatistics();

    /**
     * Obtient tous les logs avec pagination.
     * 
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> getAllLogs(int page, int size);

    /**
     * Obtient tous les logs (sans pagination).
     * 
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> getAllLogs();

    /**
     * Obtient les logs filtrés par niveau avec pagination.
     * 
     * @param level le niveau de log (INFO, WARN, ERROR, SUCCESS)
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> getLogsByLevel(String level, int page, int size);

    /**
     * Obtient les logs filtrés par niveau (sans pagination).
     * 
     * @param level le niveau de log (INFO, WARN, ERROR, SUCCESS)
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> getLogsByLevel(String level);

    /**
     * Recherche les logs contenant un terme avec pagination.
     * 
     * @param searchTerm le terme de recherche
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> searchLogs(String searchTerm, int page, int size);

    /**
     * Recherche les logs contenant un terme (sans pagination).
     * 
     * @param searchTerm le terme de recherche
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> searchLogs(String searchTerm);

    /**
     * Obtient les logs filtrés par niveau et terme de recherche avec pagination.
     * 
     * @param level le niveau de log
     * @param searchTerm le terme de recherche
     * @param page numéro de page (0-based)
     * @param size taille de la page
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> filterLogs(String level, String searchTerm, int page, int size);

    /**
     * Obtient les logs filtrés par niveau et terme de recherche (sans pagination).
     * 
     * @param level le niveau de log
     * @param searchTerm le terme de recherche
     * @return un Flux de LogEntryDTO
     */
    Flux<LogEntryDTO> filterLogs(String level, String searchTerm);

    /**
     * Exporte les logs au format JSON.
     * 
     * @return un Mono contenant les logs au format JSON
     */
    Mono<String> exportLogsJson();

    /**
     * Exporte les logs au format CSV.
     * 
     * @return un Mono contenant les logs au format CSV
     */
    Mono<String> exportLogsCsv();

    /**
     * Exporte les logs filtrés au format JSON.
     * 
     * @param level le niveau de log
     * @param searchTerm le terme de recherche
     * @return un Mono contenant les logs filtrés au format JSON
     */
    Mono<String> exportFilteredLogsJson(String level, String searchTerm);

    /**
     * Exporte les logs filtrés au format CSV.
     * 
     * @param level le niveau de log
     * @param searchTerm le terme de recherche
     * @return un Mono contenant les logs filtrés au format CSV
     */
    Mono<String> exportFilteredLogsCsv(String level, String searchTerm);

    /**
     * Vide la mémoire des logs.
     * 
     * @return un Mono vide
     */
    Mono<Void> clearLogs();
}
