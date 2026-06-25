package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.CookieConsent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les consentements cookies.
 */
@Repository
public interface CookieConsentRepository extends R2dbcRepository<CookieConsent, String> {

    /** Derniers consentements enregistrés. */
    Flux<CookieConsent> findAllByOrderByCreatedAtDesc();

    /** Page de consentements (pagination). */
    Flux<CookieConsent> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Mono<Long> countByAnalyticsTrue();

    Mono<Long> countByMarketingTrue();

    Mono<Long> countByPreferencesTrue();

    /** Consentements « tout refusé » (seuls les cookies essentiels). */
    Mono<Long> countByAnalyticsFalseAndMarketingFalseAndPreferencesFalse();
}
