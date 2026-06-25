package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.AlertRule;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour AlertRule.
 * Permet les opérations CRUD sur les règles d'alerte.
 */
@Repository
public interface AlertRuleRepository extends R2dbcRepository<AlertRule, String> {

    /**
     * Trouve toutes les règles d'alerte actives.
     * 
     * @return un Flux de AlertRule
     */
    Flux<AlertRule> findByRuleStatus(String ruleStatus);

    /**
     * Trouve toutes les règles d'alerte par type de métrique.
     * 
     * @param metricType le type de métrique
     * @return un Flux de AlertRule
     */
    Flux<AlertRule> findByMetricType(String metricType);

    /**
     * Trouve toutes les règles d'alerte par type de métrique et statut.
     * 
     * @param metricType le type de métrique
     * @param ruleStatus le statut de la règle
     * @return un Flux de AlertRule
     */
    Flux<AlertRule> findByMetricTypeAndRuleStatus(String metricType, String ruleStatus);

    /**
     * Trouve une règle d'alerte par nom.
     * 
     * @param name le nom de la règle
     * @return un Mono de AlertRule
     */
    Mono<AlertRule> findByName(String name);
}
