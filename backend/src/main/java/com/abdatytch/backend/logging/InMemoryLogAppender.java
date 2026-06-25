package com.abdatytch.backend.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Appender personnalisé Logback pour capturer les logs en mémoire.
 * Stocke les logs dans une queue circulaire pour une consultation via API.
 */
public class InMemoryLogAppender extends AppenderBase<ILoggingEvent> {

    private static final int MAX_LOGS = 1000;
    // Stockage STATIQUE (partagé) : Logback instancie son propre appender (via le XML)
    // tandis que Spring en injecte un autre dans LogService. Avec des champs d'instance,
    // ce sont deux stores distincts → les logs lus par l'API restent vides. En statique,
    // l'instance Logback qui écrit et l'instance Spring qui lit partagent le même store.
    private static final ConcurrentLinkedQueue<LogEntry> logQueue = new ConcurrentLinkedQueue<>();
    private static final AtomicLong totalLogs = new AtomicLong(0);
    private static final AtomicLong errorCount = new AtomicLong(0);
    private static final AtomicLong warningCount = new AtomicLong(0);
    private static final AtomicLong infoCount = new AtomicLong(0);

    @Override
    protected void append(ILoggingEvent event) {
        if (!isStarted()) {
            return;
        }

        LogEntry entry = new LogEntry(
            event.getTimeStamp(),
            event.getLevel().toString(),
            event.getLoggerName(),
            event.getFormattedMessage(),
            event.getMDCPropertyMap()
        );

        logQueue.offer(entry);
        if (logQueue.size() > MAX_LOGS) {
            logQueue.poll();
        }

        totalLogs.incrementAndGet();
        
        switch (event.getLevel().toString()) {
            case "ERROR":
                errorCount.incrementAndGet();
                break;
            case "WARN":
                warningCount.incrementAndGet();
                break;
            case "INFO":
                infoCount.incrementAndGet();
                break;
        }
    }

    /**
     * Obtient tous les logs en mémoire.
     * 
     * @return liste des logs
     */
    public List<LogEntry> getAllLogs() {
        return new ArrayList<>(logQueue);
    }

    /**
     * Obtient les logs filtrés par niveau.
     * 
     * @param level le niveau de log
     * @return liste des logs filtrés
     */
    public List<LogEntry> getLogsByLevel(String level) {
        List<LogEntry> filtered = new ArrayList<>();
        for (LogEntry entry : logQueue) {
            if (entry.getLevel().equalsIgnoreCase(level)) {
                filtered.add(entry);
            }
        }
        return filtered;
    }

    /**
     * Recherche les logs contenant un terme.
     * 
     * @param searchTerm le terme de recherche
     * @return liste des logs correspondants
     */
    public List<LogEntry> searchLogs(String searchTerm) {
        List<LogEntry> results = new ArrayList<>();
        for (LogEntry entry : logQueue) {
            if (entry.getMessage().toLowerCase().contains(searchTerm.toLowerCase()) ||
                entry.getLogger().toLowerCase().contains(searchTerm.toLowerCase())) {
                results.add(entry);
            }
        }
        return results;
    }

    /**
     * Obtient les statistiques des logs.
     * 
     * @return statistiques des logs
     */
    public LogStatistics getStatistics() {
        return new LogStatistics(
            totalLogs.get(),
            errorCount.get(),
            warningCount.get(),
            infoCount.get()
        );
    }

    /**
     * Vide la queue de logs.
     */
    public void clearLogs() {
        logQueue.clear();
        totalLogs.set(0);
        errorCount.set(0);
        warningCount.set(0);
        infoCount.set(0);
    }

    /**
     * Classe interne pour représenter une entrée de log.
     */
    public static class LogEntry {
        private final long timestamp;
        private final String level;
        private final String logger;
        private final String message;
        private final java.util.Map<String, String> mdcProperties;

        public LogEntry(long timestamp, String level, String logger, String message, 
                       java.util.Map<String, String> mdcProperties) {
            this.timestamp = timestamp;
            this.level = level;
            this.logger = logger;
            this.message = message;
            this.mdcProperties = mdcProperties;
        }

        public long getTimestamp() {return timestamp;}
        public String getLevel() {return level;}
        public String getLogger() {return logger;}
        public String getMessage() {return message;}
        public java.util.Map<String, String> getMdcProperties() {return mdcProperties;}
    }

    /**
     * Classe interne pour les statistiques de logs.
     */
    public static class LogStatistics {
        private final long totalLogs;
        private final long errorCount;
        private final long warningCount;
        private final long infoCount;

        public LogStatistics(long totalLogs, long errorCount, long warningCount, long infoCount) {
            this.totalLogs = totalLogs;
            this.errorCount = errorCount;
            this.warningCount = warningCount;
            this.infoCount = infoCount;
        }

        public long getTotalLogs() {return totalLogs;}
        public long getErrorCount() {return errorCount;}
        public long getWarningCount() {return warningCount;}
        public long getInfoCount() {return infoCount;}
    }
}
