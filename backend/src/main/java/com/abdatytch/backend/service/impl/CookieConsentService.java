package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.request.CookieConsentRequestDTO;
import com.abdatytch.backend.dto.response.CookieConsentDTO;
import com.abdatytch.backend.dto.response.CookieConsentStatsDTO;
import com.abdatytch.backend.entity.CookieConsent;
import com.abdatytch.backend.repository.CookieConsentRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service des consentements cookies : enregistrement (public), liste et
 * statistiques (admin).
 */
@Service
public class CookieConsentService {

    private final CookieConsentRepository repository;

    public CookieConsentService(CookieConsentRepository repository) {
        this.repository = repository;
    }

    /** Enregistre un consentement exprimé via le bandeau cookies. */
    public Mono<CookieConsentDTO> record(CookieConsentRequestDTO dto, String ip, String userAgent) {
        CookieConsent c = new CookieConsent();
        c.setVisitorId(dto.getVisitorId() != null ? dto.getVisitorId() : "anonymous");
        c.setNecessary(true);
        c.setAnalytics(Boolean.TRUE.equals(dto.getAnalytics()));
        c.setMarketing(Boolean.TRUE.equals(dto.getMarketing()));
        c.setPreferences(Boolean.TRUE.equals(dto.getPreferences()));
        c.setIpAddress(ip);
        c.setUserAgent(userAgent != null && userAgent.length() > 510 ? userAgent.substring(0, 510) : userAgent);
        c.setLocale(dto.getLocale());
        c.setPage(dto.getPage());
        return repository.save(c).map(this::toDTO);
    }

    /** Liste paginée des consentements (du plus récent au plus ancien). */
    public Flux<CookieConsentDTO> list(int page, int size) {
        int safeSize = size <= 0 || size > 500 ? 50 : size;
        int safePage = Math.max(page, 0);
        return repository
            .findAllByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(safePage, safeSize))
            .map(this::toDTO);
    }

    /** Statistiques agrégées. */
    public Mono<CookieConsentStatsDTO> stats() {
        return Mono.zip(
                repository.count(),
                repository.countByAnalyticsTrue(),
                repository.countByMarketingTrue(),
                repository.countByPreferencesTrue(),
                repository.countByAnalyticsFalseAndMarketingFalseAndPreferencesFalse()
        ).map(t -> {
            CookieConsentStatsDTO dto = new CookieConsentStatsDTO();
            long total = t.getT1();
            dto.setTotal(total);
            dto.setAnalyticsAccepted(t.getT2());
            dto.setMarketingAccepted(t.getT3());
            dto.setPreferencesAccepted(t.getT4());
            dto.setRejectedAll(t.getT5());
            dto.setAnalyticsRate(total > 0 ? Math.round((t.getT2() * 1000.0) / total) / 10.0 : 0.0);
            return dto;
        });
    }

    private CookieConsentDTO toDTO(CookieConsent c) {
        CookieConsentDTO dto = new CookieConsentDTO();
        dto.setId(c.getId());
        dto.setVisitorId(c.getVisitorId());
        dto.setNecessary(c.getNecessary());
        dto.setAnalytics(c.getAnalytics());
        dto.setMarketing(c.getMarketing());
        dto.setPreferences(c.getPreferences());
        dto.setIpAddress(c.getIpAddress());
        dto.setLocale(c.getLocale());
        dto.setPage(c.getPage());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
