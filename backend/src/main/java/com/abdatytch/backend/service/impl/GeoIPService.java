package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.service.IGeoIPService;
import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.AsnResponse;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.model.CountryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

/**
 * Implémentation du service GeoIP.
 * Extrait les informations géographiques à partir d'une adresse IP en utilisant MaxMind GeoIP2.
 */
@Service
public class GeoIPService implements IGeoIPService {

    private static final Logger logger = LoggerFactory.getLogger(GeoIPService.class);

    private final DatabaseReader cityDatabaseReader;
    private final DatabaseReader asnDatabaseReader;
    private final DatabaseReader countryDatabaseReader;

    @Autowired
    public GeoIPService(
            DatabaseReader cityDatabaseReader,
            DatabaseReader asnDatabaseReader,
            DatabaseReader countryDatabaseReader) {
        this.cityDatabaseReader = cityDatabaseReader;
        this.asnDatabaseReader = asnDatabaseReader;
        this.countryDatabaseReader = countryDatabaseReader;
    }

    @Override
    public Map<String, Object> getGeoLocationInfo(String ipAddress) {
        Map<String, Object> geoInfo = new HashMap<>();
        
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            
            // Informations de la ville
            CityResponse cityResponse = cityDatabaseReader.city(inetAddress);
            geoInfo.put("country", cityResponse.getCountry() != null ? cityResponse.getCountry().getName() : null);
            geoInfo.put("countryIsoCode", cityResponse.getCountry() != null ? cityResponse.getCountry().getIsoCode() : null);
            geoInfo.put("region", cityResponse.getMostSpecificSubdivision() != null ? cityResponse.getMostSpecificSubdivision().getName() : null);
            geoInfo.put("regionIsoCode", cityResponse.getMostSpecificSubdivision() != null ? cityResponse.getMostSpecificSubdivision().getIsoCode() : null);
            geoInfo.put("city", cityResponse.getCity() != null ? cityResponse.getCity().getName() : null);
            geoInfo.put("postalCode", cityResponse.getPostal() != null ? cityResponse.getPostal().getCode() : null);
            geoInfo.put("latitude", cityResponse.getLocation() != null ? cityResponse.getLocation().getLatitude() : null);
            geoInfo.put("longitude", cityResponse.getLocation() != null ? cityResponse.getLocation().getLongitude() : null);
            geoInfo.put("timeZone", cityResponse.getLocation() != null ? cityResponse.getLocation().getTimeZone() : null);
            
            // Informations ISP
            AsnResponse asnResponse = asnDatabaseReader.asn(inetAddress);
            geoInfo.put("isp", asnResponse.getAutonomousSystemOrganization());
            geoInfo.put("asn", asnResponse.getAutonomousSystemNumber());
            geoInfo.put("organization", asnResponse.getAutonomousSystemOrganization());
            
            logger.debug("Informations GeoIP extraites pour l'IP: {}", ipAddress);
            
        } catch (GeoIp2Exception e) {
            logger.warn("Adresse IP non trouvée dans la base de données GeoIP: {}", ipAddress);
            geoInfo.put("error", "IP not found in GeoIP database");
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction des informations GeoIP pour l'IP: {}", ipAddress, e);
            geoInfo.put("error", "Failed to extract GeoIP information");
        }
        
        return geoInfo;
    }

    @Override
    public Map<String, Object> getCountryInfo(String ipAddress) {
        Map<String, Object> countryInfo = new HashMap<>();
        
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            CountryResponse countryResponse = countryDatabaseReader.country(inetAddress);
            
            countryInfo.put("country", countryResponse.getCountry() != null ? countryResponse.getCountry().getName() : null);
            countryInfo.put("countryIsoCode", countryResponse.getCountry() != null ? countryResponse.getCountry().getIsoCode() : null);
            countryInfo.put("continent", countryResponse.getContinent() != null ? countryResponse.getContinent().getName() : null);
            countryInfo.put("continentCode", countryResponse.getContinent() != null ? countryResponse.getContinent().getCode() : null);
            
            logger.debug("Informations de pays extraites pour l'IP: {}", ipAddress);
            
        } catch (GeoIp2Exception e) {
            logger.warn("Adresse IP non trouvée dans la base de données Country: {}", ipAddress);
            countryInfo.put("error", "IP not found in Country database");
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction des informations de pays pour l'IP: {}", ipAddress, e);
            countryInfo.put("error", "Failed to extract country information");
        }
        
        return countryInfo;
    }

    @Override
    public Map<String, Object> getIspInfo(String ipAddress) {
        Map<String, Object> ispInfo = new HashMap<>();
        
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            AsnResponse asnResponse = asnDatabaseReader.asn(inetAddress);
            
            ispInfo.put("isp", asnResponse.getAutonomousSystemOrganization());
            ispInfo.put("asn", asnResponse.getAutonomousSystemNumber());
            ispInfo.put("organization", asnResponse.getAutonomousSystemOrganization());
            
            logger.debug("Informations ISP extraites pour l'IP: {}", ipAddress);
            
        } catch (GeoIp2Exception e) {
            logger.warn("Adresse IP non trouvée dans la base de données ASN: {}", ipAddress);
            ispInfo.put("error", "IP not found in ASN database");
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction des informations ISP pour l'IP: {}", ipAddress, e);
            ispInfo.put("error", "Failed to extract ISP information");
        }
        
        return ispInfo;
    }
}
