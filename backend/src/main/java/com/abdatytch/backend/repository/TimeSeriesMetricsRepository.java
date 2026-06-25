package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.TimeSeriesMetrics;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Repository R2DBC pour TimeSeriesMetrics.
 * Permet les opérations CRUD sur les métriques temporelles.
 */
@Repository
public interface TimeSeriesMetricsRepository extends R2dbcRepository<TimeSeriesMetrics, String> {

    /**
     * Trouve toutes les métriques entre deux timestamps.
     * 
     * @param startDate timestamp de début
     * @param endDate timestamp de fin
     * @return un Flux de TimeSeriesMetrics
     */
    Flux<TimeSeriesMetrics> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Trouve toutes les métriques après un timestamp.
     * 
     * @param timestamp timestamp
     * @return un Flux de TimeSeriesMetrics
     */
    Flux<TimeSeriesMetrics> findByTimestampAfter(LocalDateTime timestamp);

    /**
     * Trouve les dernières métriques (limité).
     * 
     * @param limit nombre de résultats
     * @return un Flux de TimeSeriesMetrics
     */
    Flux<TimeSeriesMetrics> findTopByOrderByTimestampDesc();

    /**
     * Supprime les métriques antérieures à un timestamp (cleanup).
     * 
     * @param timestamp timestamp limite
     * @return un Mono avec le nombre de lignes supprimées
     */
    @Modifying
    @Query("DELETE FROM time_series_metrics WHERE timestamp < :timestamp")
    Mono<Integer> deleteByTimestampBefore(LocalDateTime timestamp);
}
