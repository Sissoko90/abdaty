package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.entity.AnalyticsData;
import com.abdatytch.backend.repository.AnalyticsDataRepository;
import com.abdatytch.backend.service.IAnalyticsService;
import com.abdatytch.backend.service.IGeoIPService;
import com.abdatytch.backend.service.IUserAgentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Implémentation du service d'analytics.
 * Combine les informations GeoIP et User-Agent pour créer des données d'analytics complètes.
 */
@Service
public class AnalyticsService implements IAnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    private final IGeoIPService geoIPService;
    private final IUserAgentService userAgentService;
    private final AnalyticsDataRepository analyticsDataRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public AnalyticsService(
            IGeoIPService geoIPService,
            IUserAgentService userAgentService,
            AnalyticsDataRepository analyticsDataRepository,
            ObjectMapper objectMapper) {
        this.geoIPService = geoIPService;
        this.userAgentService = userAgentService;
        this.analyticsDataRepository = analyticsDataRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<AnalyticsData> collectAndStoreAnalytics(
            String ipAddress,
            String userAgent,
            String requestPath,
            String requestMethod,
            String referer,
            String userId) {
        
        return Mono.fromCallable(() -> createAnalyticsData(ipAddress, userAgent, requestPath, requestMethod, referer, userId))
            .flatMap(analyticsDataRepository::save)
            .doOnSuccess(saved -> logger.info("Données d'analytics sauvegardées pour l'IP: {}", ipAddress))
            .doOnError(error -> logger.error("Erreur lors de la sauvegarde des données d'analytics", error));
    }

    @Override
    public AnalyticsData createAnalyticsData(
            String ipAddress,
            String userAgent,
            String requestPath,
            String requestMethod,
            String referer,
            String userId) {
        
        AnalyticsData analyticsData = new AnalyticsData(ipAddress, userAgent);
        
        // Informations de requête
        analyticsData.setRequestPath(requestPath);
        analyticsData.setRequestMethod(requestMethod);
        analyticsData.setReferer(referer);
        analyticsData.setUserId(userId);
        
        // Informations géographiques
        Map<String, Object> geoLocation = geoIPService.getGeoLocationInfo(ipAddress);
        analyticsData.setGeoLocation(mapToJson(geoLocation));
        
        // Extraire les champs géographiques individuels
        analyticsData.setCountry((String) geoLocation.get("country"));
        analyticsData.setCountryIsoCode((String) geoLocation.get("countryIsoCode"));
        analyticsData.setRegion((String) geoLocation.get("region"));
        analyticsData.setCity((String) geoLocation.get("city"));
        analyticsData.setIsp((String) geoLocation.get("isp"));
        analyticsData.setAsn(geoLocation.get("asn") != null ? ((Number) geoLocation.get("asn")).intValue() : null);
        
        // Informations appareil/navigateur
        Map<String, Object> deviceInfo = userAgentService.parseUserAgent(userAgent);
        analyticsData.setDeviceInfo(mapToJson(deviceInfo));
        
        // Extraire les champs d'appareil individuels
        analyticsData.setDeviceType((String) deviceInfo.get("deviceType"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> browser = (Map<String, Object>) deviceInfo.get("browser");
        if (browser != null) {
            analyticsData.setBrowserName((String) browser.get("name"));
            analyticsData.setBrowserVersion((String) browser.get("version"));
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> os = (Map<String, Object>) deviceInfo.get("os");
        if (os != null) {
            analyticsData.setOsName((String) os.get("name"));
            analyticsData.setOsVersion((String) os.get("version"));
        }
        
        logger.debug("Données d'analytics créées: {}", analyticsData);
        
        return analyticsData;
    }

    /**
     * Convertit une Map en JSON string.
     * 
     * @param map la Map à convertir
     * @return la chaîne JSON
     */
    private String mapToJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            logger.error("Erreur lors de la conversion de la Map en JSON", e);
            return "{}";
        }
    }
}
