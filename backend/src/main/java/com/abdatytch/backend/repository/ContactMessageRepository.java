package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.ContactMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les messages de contact.
 */
@Repository
public interface ContactMessageRepository extends R2dbcRepository<ContactMessage, String> {

    /** Page de messages, du plus récent au plus ancien (pagination). */
    Flux<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Nombre de messages non lus. */
    Mono<Long> countByIsReadFalse();
}
