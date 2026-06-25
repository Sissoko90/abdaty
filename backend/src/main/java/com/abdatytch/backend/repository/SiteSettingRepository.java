package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.SiteSetting;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les paramètres du site.
 */
@Repository
public interface SiteSettingRepository extends R2dbcRepository<SiteSetting, String> {

    /** Trouve un paramètre par sa clé (unique). */
    Mono<SiteSetting> findBySettingKey(String settingKey);

    /** Indique si un paramètre existe déjà pour la clé donnée. */
    Mono<Boolean> existsBySettingKey(String settingKey);

    /** Liste les paramètres d'une catégorie. */
    Flux<SiteSetting> findByCategory(String category);
}
