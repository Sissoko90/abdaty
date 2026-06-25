package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.response.GeoBlockingResponseDTO;
import com.abdatytch.backend.dto.response.GeoBlockingStatsDTO;
import com.abdatytch.backend.entity.GeoBlocking;
import com.abdatytch.backend.mapper.IGeoBlockingMapper;
import com.abdatytch.backend.repository.AnalyticsDataRepository;
import com.abdatytch.backend.repository.GeoBlockingRepository;
import com.abdatytch.backend.service.IGeoBlockingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Implémentation du service GeoBlocking.
 * Gère les règles de geo-blocking et les statistiques.
 */
@Service
public class GeoBlockingService implements IGeoBlockingService {

    private static final Logger logger = LoggerFactory.getLogger(GeoBlockingService.class);

    private final GeoBlockingRepository geoBlockingRepository;
    private final AnalyticsDataRepository analyticsDataRepository;
    private final IGeoBlockingMapper geoBlockingMapper;

    @Autowired
    public GeoBlockingService(
            GeoBlockingRepository geoBlockingRepository,
            AnalyticsDataRepository analyticsDataRepository,
            IGeoBlockingMapper geoBlockingMapper) {
        this.geoBlockingRepository = geoBlockingRepository;
        this.analyticsDataRepository = analyticsDataRepository;
        this.geoBlockingMapper = geoBlockingMapper;
    }

    @Override
    public Mono<GeoBlockingStatsDTO> getStatistics() {
        logger.info("Calcul des statistiques de geo-blocking");
        
        return Mono.zip(
            geoBlockingRepository.count(),
            geoBlockingRepository.countByAccessStatus("BLOCKED"),
            geoBlockingRepository.countByAccessStatus("ALLOWED"),
            // SELECT COUNT(*) plutôt que charger toute la table pour la compter.
            analyticsDataRepository.count()
        ).map(tuple -> {
            GeoBlockingStatsDTO stats = new GeoBlockingStatsDTO();
            stats.setTotalCountries(tuple.getT1());
            stats.setBlockedCountries(tuple.getT2());
            stats.setAllowedCountries(tuple.getT3());
            stats.setTotalRequests(tuple.getT4());
            return stats;
        });
    }

    @Override
    public Flux<GeoBlockingResponseDTO> getAllRules() {
        logger.info("Récupération de toutes les règles de geo-blocking");
        return geoBlockingRepository.findAll()
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Flux<GeoBlockingResponseDTO> getRulesByContinent(String continentCode) {
        logger.info("Récupération des règles de geo-blocking pour le continent: {}", continentCode);
        return geoBlockingRepository.findByContinentCode(continentCode)
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Flux<GeoBlockingResponseDTO> getRulesByStatus(String accessStatus) {
        logger.info("Récupération des règles de geo-blocking avec statut: {}", accessStatus);
        return geoBlockingRepository.findByAccessStatus(accessStatus)
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Flux<GeoBlockingResponseDTO> searchByCountryName(String countryName) {
        logger.info("Recherche des règles de geo-blocking pour le pays: {}", countryName);
        return geoBlockingRepository.findByCountryNameContaining(countryName)
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Mono<GeoBlockingResponseDTO> getRuleByCountryCode(String countryCode) {
        logger.info("Récupération de la règle de geo-blocking pour le pays: {}", countryCode);
        return geoBlockingRepository.findByCountryCode(countryCode)
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Mono<GeoBlockingResponseDTO> blockCountry(String countryCode) {
        logger.info("Blocage du pays: {}", countryCode);
        
        return geoBlockingRepository.findByCountryCode(countryCode)
            .flatMap(geoBlocking -> {
                geoBlocking.setAccessStatus("BLOCKED");
                return geoBlockingRepository.save(geoBlocking);
            })
            .switchIfEmpty(Mono.defer(() -> {
                // Créer une nouvelle règle si elle n'existe pas
                GeoBlocking newRule = new GeoBlocking(countryCode, countryCode);
                newRule.setAccessStatus("BLOCKED");
                return geoBlockingRepository.save(newRule);
            }))
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Mono<GeoBlockingResponseDTO> unblockCountry(String countryCode) {
        logger.info("Déblocage du pays: {}", countryCode);
        
        return geoBlockingRepository.findByCountryCode(countryCode)
            .flatMap(geoBlocking -> {
                geoBlocking.setAccessStatus("ALLOWED");
                return geoBlockingRepository.save(geoBlocking);
            })
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Mono<Long> blockContinent(String continentCode) {
        logger.info("Blocage du continent: {}", continentCode);
        
        return geoBlockingRepository.findByContinentCode(continentCode)
            .flatMap(geoBlocking -> {
                geoBlocking.setAccessStatus("BLOCKED");
                return geoBlockingRepository.save(geoBlocking);
            })
            .count();
    }

    @Override
    public Mono<Long> unblockContinent(String continentCode) {
        logger.info("Déblocage du continent: {}", continentCode);
        
        return geoBlockingRepository.findByContinentCode(continentCode)
            .flatMap(geoBlocking -> {
                geoBlocking.setAccessStatus("ALLOWED");
                return geoBlockingRepository.save(geoBlocking);
            })
            .count();
    }

    @Override
    public Mono<Long> unblockAll() {
        logger.info("Déblocage de tous les pays");
        
        return geoBlockingRepository.findAll()
            .flatMap(geoBlocking -> {
                geoBlocking.setAccessStatus("ALLOWED");
                return geoBlockingRepository.save(geoBlocking);
            })
            .count();
    }

    @Override
    public Mono<GeoBlockingResponseDTO> updateThreatScore(String countryCode, Integer threatScore) {
        logger.info("Mise à jour du score de menace pour le pays: {} - Score: {}", countryCode, threatScore);
        
        return geoBlockingRepository.findByCountryCode(countryCode)
            .flatMap(geoBlocking -> {
                geoBlocking.setThreatScore(threatScore);
                return geoBlockingRepository.save(geoBlocking);
            })
            .map(geoBlockingMapper::toResponseDTO);
    }

    @Override
    public Mono<GeoBlockingResponseDTO> incrementRequestCount(String countryCode) {
        logger.debug("Incrémentation du nombre de requêtes pour le pays: {}", countryCode);
        
        return geoBlockingRepository.findByCountryCode(countryCode)
            .flatMap(geoBlocking -> {
                long currentCount = geoBlocking.getRequestCount() != null ? geoBlocking.getRequestCount() : 0L;
                geoBlocking.setRequestCount(currentCount + 1);
                return geoBlockingRepository.save(geoBlocking);
            })
            .map(geoBlockingMapper::toResponseDTO);
    }
}
