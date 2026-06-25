package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.Media;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * Repository R2DBC pour les médias.
 */
@Repository
public interface MediaRepository extends R2dbcRepository<Media, String> {

    /** Liste tous les médias, du plus récent au plus ancien. */
    Flux<Media> findAllByOrderByCreatedAtDesc();

    /** Liste les médias d'un domaine, du plus récent au plus ancien. */
    Flux<Media> findByMediaDomainOrderByCreatedAtDesc(String mediaDomain);
}
