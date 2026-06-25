package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.NewsletterEvent;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les événements de suivi newsletter.
 */
@Repository
public interface NewsletterEventRepository extends R2dbcRepository<NewsletterEvent, String> {

    /** Nombre d'événements d'un type donné pour une campagne. */
    Mono<Long> countByCampaignIdAndEventType(String campaignId, String eventType);

    /** Indique si un événement (type) existe déjà pour ce couple campagne/abonné
     *  — sert à ne compter qu'une ouverture/un clic UNIQUE par abonné. */
    Mono<Boolean> existsByCampaignIdAndSubscriberIdAndEventType(String campaignId, String subscriberId, String eventType);
}
