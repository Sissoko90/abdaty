package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.response.SuspiciousIPDTO;
import com.abdatytch.backend.dto.response.SuspiciousIPStatisticsDTO;
import com.abdatytch.backend.entity.SuspiciousIP;
import com.abdatytch.backend.repository.GeoBlockingRepository;
import com.abdatytch.backend.repository.SuspiciousIPRepository;
import com.abdatytch.backend.service.IGeoIPService;
import com.abdatytch.backend.service.ISuspiciousIPService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Implémentation du service pour les IPs suspectes.
 * Détecte et gère les IPs suspectes en utilisant Redis et MaxMind.
 */
@Service
public class SuspiciousIPService implements ISuspiciousIPService {

    private static final Logger logger = LoggerFactory.getLogger(SuspiciousIPService.class);

    private final SuspiciousIPRepository suspiciousIPRepository;
    private final IGeoIPService geoIPService;
    private final GeoBlockingRepository geoBlockingRepository;

    @Autowired
    public SuspiciousIPService(
            SuspiciousIPRepository suspiciousIPRepository,
            IGeoIPService geoIPService,
            GeoBlockingRepository geoBlockingRepository) {
        this.suspiciousIPRepository = suspiciousIPRepository;
        this.geoIPService = geoIPService;
        this.geoBlockingRepository = geoBlockingRepository;
    }

    @Override
    public Mono<SuspiciousIPStatisticsDTO> getStatistics() {
        logger.debug("Récupération des statistiques des IPs suspectes");
        
        return Mono.zip(
            suspiciousIPRepository.count(),
            suspiciousIPRepository.countByBlockStatus("BLOCKED"),
            suspiciousIPRepository.countByThreatLevel("CRITICAL"),
            suspiciousIPRepository.findAll()
                .map(SuspiciousIP::getAttemptCount)
                .reduce(0L, Long::sum)
        ).map(tuple -> {
            SuspiciousIPStatisticsDTO stats = new SuspiciousIPStatisticsDTO();
            stats.setTotalSuspiciousIPs(tuple.getT1());
            stats.setTotalBlockedIPs(tuple.getT2());
            stats.setCriticalThreats(tuple.getT3());
            stats.setTotalAttempts(tuple.getT4());
            return stats;
        });
    }

    @Override
    public Flux<SuspiciousIPDTO> getAllSuspiciousIPs(int page, int size) {
        logger.debug("Récupération de toutes les IPs suspectes - page: {}, size: {}", page, size);
        return suspiciousIPRepository.findAll()
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Flux<SuspiciousIPDTO> getSuspiciousIPsByThreatLevel(String threatLevel, int page, int size) {
        logger.debug("Récupération des IPs suspectes avec niveau: {}, page: {}, size: {}", threatLevel, page, size);
        return suspiciousIPRepository.findByThreatLevel(threatLevel)
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Flux<SuspiciousIPDTO> getSuspiciousIPsByBlockStatus(String blockStatus, int page, int size) {
        logger.debug("Récupération des IPs suspectes avec statut: {}, page: {}, size: {}", blockStatus, page, size);
        return suspiciousIPRepository.findByBlockStatus(blockStatus)
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Flux<SuspiciousIPDTO> searchSuspiciousIPs(String searchTerm, int page, int size) {
        logger.debug("Recherche des IPs suspectes avec terme: {}, page: {}, size: {}", searchTerm, page, size);
        return suspiciousIPRepository.findByIpAddressContaining(searchTerm)
            .skip((long) page * size)
            .take(size)
            .map(this::toDTO);
    }

    @Override
    public Mono<SuspiciousIPDTO> getSuspiciousIPByIpAddress(String ipAddress) {
        logger.debug("Récupération de l'IP suspecte: {}", ipAddress);
        return suspiciousIPRepository.findByIpAddress(ipAddress)
            .map(this::toDTO);
    }

    @Override
    public Mono<SuspiciousIPDTO> detectAndRegisterSuspiciousIP(String ipAddress, String reason, String threatLevel) {
        logger.info("Détection et enregistrement de l'IP suspecte: {} - Raison: {} - Niveau: {}", ipAddress, reason, threatLevel);
        
        return suspiciousIPRepository.findByIpAddress(ipAddress)
            .flatMap(existing -> {
                existing.setAttemptCount(existing.getAttemptCount() + 1);
                existing.setLastAttempt(LocalDateTime.now());
                existing.setThreatLevel(threatLevel);
                existing.setSuspicionReason(reason);
                return suspiciousIPRepository.save(existing);
            })
            .switchIfEmpty(Mono.defer(() -> {
                // Créer une nouvelle IP suspecte avec informations géographiques
                SuspiciousIP newIP = new SuspiciousIP();
                newIP.setIpAddress(ipAddress);
                newIP.setThreatLevel(threatLevel);
                newIP.setSuspicionReason(reason);
                newIP.setAttemptCount(1L);
                newIP.setLastAttempt(LocalDateTime.now());
                newIP.setBlockStatus("NOT_BLOCKED");
                
                // Obtenir les informations géographiques depuis MaxMind
                return enrichWithGeoInfo(newIP);
            }))
            .map(this::toDTO);
    }

    @Override
    public Mono<SuspiciousIPDTO> incrementAttemptCount(String ipAddress) {
        logger.debug("Incrémentation du compteur de tentatives pour l'IP: {}", ipAddress);
        
        return suspiciousIPRepository.findByIpAddress(ipAddress)
            .flatMap(ip -> {
                ip.setAttemptCount(ip.getAttemptCount() + 1);
                ip.setLastAttempt(LocalDateTime.now());
                return suspiciousIPRepository.save(ip);
            })
            .map(this::toDTO);
    }

    @Override
    public Mono<SuspiciousIPDTO> blockIP(String ipAddress) {
        logger.info("Blocage de l'IP suspecte: {}", ipAddress);
        
        return suspiciousIPRepository.findByIpAddress(ipAddress)
            .flatMap(ip -> {
                ip.setBlockStatus("BLOCKED");
                return suspiciousIPRepository.save(ip);
            })
            // Si l'IP n'existe pas encore, on la crée directement bloquée
            // (blocage manuel depuis l'admin), de façon idempotente.
            .switchIfEmpty(Mono.defer(() -> {
                SuspiciousIP newIP = new SuspiciousIP();
                newIP.setIpAddress(ipAddress);
                newIP.setThreatLevel("HIGH");
                newIP.setSuspicionReason("Bloqué manuellement");
                newIP.setAttemptCount(0L);
                newIP.setLastAttempt(LocalDateTime.now());
                newIP.setBlockStatus("BLOCKED");
                return suspiciousIPRepository.save(newIP);
            }))
            .flatMap(ip -> {
                // Également bloquer dans GeoBlocking
                return geoBlockingRepository.findByCountryCode(ip.getCountryCode())
                    .flatMap(geo -> {
                        geo.setAccessStatus("BLOCKED");
                        return geoBlockingRepository.save(geo);
                    })
                    .thenReturn(ip)
                    .defaultIfEmpty(ip);
            })
            .map(this::toDTO);
    }

    @Override
    public Mono<SuspiciousIPDTO> unblockIP(String ipAddress) {
        logger.info("Déblocage de l'IP suspecte: {}", ipAddress);
        
        return suspiciousIPRepository.findByIpAddress(ipAddress)
            .flatMap(ip -> {
                ip.setBlockStatus("NOT_BLOCKED");
                return suspiciousIPRepository.save(ip);
            })
            .flatMap(ip -> {
                // Également débloquer dans GeoBlocking
                return geoBlockingRepository.findByCountryCode(ip.getCountryCode())
                    .flatMap(geo -> {
                        geo.setAccessStatus("ALLOWED");
                        return geoBlockingRepository.save(geo);
                    })
                    .thenReturn(ip)
                    .defaultIfEmpty(ip);
            })
            .map(this::toDTO);
    }

    @Override
    public Mono<SuspiciousIPDTO> updateThreatLevel(String ipAddress, String threatLevel) {
        logger.info("Mise à jour du niveau de menace pour l'IP: {} - Niveau: {}", ipAddress, threatLevel);
        
        return suspiciousIPRepository.findByIpAddress(ipAddress)
            .flatMap(ip -> {
                ip.setThreatLevel(threatLevel);
                return suspiciousIPRepository.save(ip);
            })
            .map(this::toDTO);
    }

    /**
     * Enrichit une IP suspecte avec les informations géographiques depuis MaxMind.
     * 
     * @param ip l'IP suspecte
     * @return un Mono de SuspiciousIP
     */
    private Mono<SuspiciousIP> enrichWithGeoInfo(SuspiciousIP ip) {
        try {
            java.util.Map<String, Object> geoInfo = geoIPService.getGeoLocationInfo(ip.getIpAddress());
            
            ip.setCity((String) geoInfo.get("city"));
            ip.setRegion((String) geoInfo.get("region"));
            ip.setCountry((String) geoInfo.get("country"));
            ip.setCountryCode((String) geoInfo.get("countryIsoCode"));
            ip.setLatitude(geoInfo.get("latitude") != null ? ((Number) geoInfo.get("latitude")).doubleValue() : null);
            ip.setLongitude(geoInfo.get("longitude") != null ? ((Number) geoInfo.get("longitude")).doubleValue() : null);
            ip.setIsp((String) geoInfo.get("isp"));
            
            return suspiciousIPRepository.save(ip);
        } catch (Exception e) {
            logger.warn("Erreur lors de l'enrichissement géographique pour l'IP: {}", ip.getIpAddress(), e);
            return suspiciousIPRepository.save(ip);
        }
    }

    /**
     * Convertit une entité SuspiciousIP en DTO.
     * 
     * @param entity l'entité
     * @return le DTO
     */
    private SuspiciousIPDTO toDTO(SuspiciousIP entity) {
        SuspiciousIPDTO dto = new SuspiciousIPDTO();
        dto.setId(entity.getId());
        dto.setIpAddress(entity.getIpAddress());
        dto.setCity(entity.getCity());
        dto.setRegion(entity.getRegion());
        dto.setCountry(entity.getCountry());
        dto.setCountryCode(entity.getCountryCode());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setIsp(entity.getIsp());
        dto.setThreatLevel(entity.getThreatLevel());
        dto.setAttemptCount(entity.getAttemptCount());
        dto.setLastAttempt(entity.getLastAttempt());
        dto.setBlockStatus(entity.getBlockStatus());
        dto.setSuspicionReason(entity.getSuspicionReason());
        dto.setDetails(entity.getDetails());
        return dto;
    }
}
