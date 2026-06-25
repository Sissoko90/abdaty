package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.NewsletterSubscriber;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les abonnés à la newsletter.
 */
@Repository
public interface NewsletterSubscriberRepository extends R2dbcRepository<NewsletterSubscriber, String> {

    /** Recherche un abonné par email (unicité). */
    Mono<NewsletterSubscriber> findByEmail(String email);

    /** Recherche un abonné par son jeton de désinscription. */
    Mono<NewsletterSubscriber> findByUnsubscribeToken(String unsubscribeToken);

    /** Liste les abonnés actifs (destinataires d'une campagne). */
    Flux<NewsletterSubscriber> findBySubscribedTrue();

    /** Liste tous les abonnés, du plus récent au plus ancien. */
    Flux<NewsletterSubscriber> findAllByOrderByCreatedAtDesc();

    /** Page d'abonnés, du plus récent au plus ancien (pagination). */
    Flux<NewsletterSubscriber> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Nombre d'abonnés actifs. */
    Mono<Long> countBySubscribedTrue();

    /** Nombre d'abonnés désactivés / désinscrits. */
    Mono<Long> countBySubscribedFalse();
}
