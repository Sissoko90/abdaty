package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.NewsletterCampaign;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;

/**
 * Repository R2DBC pour les campagnes newsletter.
 */
@Repository
public interface NewsletterCampaignRepository extends R2dbcRepository<NewsletterCampaign, String> {

    /** Liste les campagnes, de la plus récente à la plus ancienne. */
    Flux<NewsletterCampaign> findAllByOrderByCreatedAtDesc();

    /** Campagnes programmées dont l'échéance est atteinte (pour le scheduler). */
    Flux<NewsletterCampaign> findByCampaignStatusAndScheduledAtLessThanEqual(String campaignStatus, LocalDateTime now);
}
