package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.service.IUserAgentService;
import ua_parser.Client;
import ua_parser.Parser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Implémentation du service User Agent.
 * Extrait les informations sur l'appareil et le navigateur à partir du User-Agent en utilisant ua-parser.
 */
@Service
public class UserAgentService implements IUserAgentService {

    private static final Logger logger = LoggerFactory.getLogger(UserAgentService.class);
    private final Parser parser;

    public UserAgentService() {
        this.parser = new Parser();
    }

    @Override
    public Map<String, Object> parseUserAgent(String userAgent) {
        Map<String, Object> deviceInfo = new HashMap<>();
        
        try {
            Client client = parser.parse(userAgent);
            
            // Informations navigateur
            Map<String, Object> browserInfo = new HashMap<>();
            browserInfo.put("name", client.userAgent.family);
            browserInfo.put("version", client.userAgent.major != null ? client.userAgent.major : null);
            browserInfo.put("major", client.userAgent.major);
            browserInfo.put("minor", client.userAgent.minor);
            browserInfo.put("patch", client.userAgent.patch);
            deviceInfo.put("browser", browserInfo);
            
            // Informations OS
            Map<String, Object> osInfo = new HashMap<>();
            osInfo.put("name", client.os.family);
            osInfo.put("version", client.os.major != null ? client.os.major : null);
            osInfo.put("major", client.os.major);
            osInfo.put("minor", client.os.minor);
            osInfo.put("patch", client.os.patch);
            osInfo.put("family", client.os.family);
            deviceInfo.put("os", osInfo);
            
            // Informations appareil
            Map<String, Object> device = new HashMap<>();
            device.put("family", client.device.family);
            deviceInfo.put("device", device);
            
            // Type d'appareil (Mobile, Tablet, Desktop, etc.)
            deviceInfo.put("deviceType", determineDeviceType(client.device.family));
            
            logger.debug("Informations User-Agent extraites: {}", deviceInfo);
            
        } catch (Exception e) {
            logger.error("Erreur lors du parsing du User-Agent", e);
            deviceInfo.put("error", "Failed to parse User-Agent");
        }
        
        return deviceInfo;
    }

    @Override
    public Map<String, Object> getBrowserInfo(String userAgent) {
        Map<String, Object> browserInfo = new HashMap<>();
        
        try {
            Client client = parser.parse(userAgent);
            
            browserInfo.put("name", client.userAgent.family);
            browserInfo.put("version", client.userAgent.major != null ? client.userAgent.major : null);
            browserInfo.put("major", client.userAgent.major);
            browserInfo.put("minor", client.userAgent.minor);
            browserInfo.put("patch", client.userAgent.patch);
            
            logger.debug("Informations navigateur extraites: {}", browserInfo);
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction des informations navigateur", e);
            browserInfo.put("error", "Failed to extract browser information");
        }
        
        return browserInfo;
    }

    @Override
    public Map<String, Object> getOsInfo(String userAgent) {
        Map<String, Object> osInfo = new HashMap<>();
        
        try {
            Client client = parser.parse(userAgent);
            
            osInfo.put("name", client.os.family);
            osInfo.put("version", client.os.major != null ? client.os.major : null);
            osInfo.put("major", client.os.major);
            osInfo.put("minor", client.os.minor);
            osInfo.put("patch", client.os.patch);
            osInfo.put("family", client.os.family);
            
            logger.debug("Informations OS extraites: {}", osInfo);
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction des informations OS", e);
            osInfo.put("error", "Failed to extract OS information");
        }
        
        return osInfo;
    }

    @Override
    public Map<String, Object> getDeviceInfo(String userAgent) {
        Map<String, Object> deviceInfo = new HashMap<>();
        
        try {
            Client client = parser.parse(userAgent);
            
            deviceInfo.put("family", client.device.family);
            deviceInfo.put("deviceType", determineDeviceType(client.device.family));
            
            logger.debug("Informations appareil extraites: {}", deviceInfo);
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction des informations appareil", e);
            deviceInfo.put("error", "Failed to extract device information");
        }
        
        return deviceInfo;
    }

    /**
     * Détermine le type d'appareil à partir de la famille.
     * 
     * @param family la famille de l'appareil
     * @return le type d'appareil (Mobile, Tablet, Desktop, Other)
     */
    private String determineDeviceType(String family) {
        if (family == null) {
            return "Other";
        }
        
        String familyLower = family.toLowerCase();
        
        if (familyLower.contains("iphone") || familyLower.contains("android") || familyLower.contains("mobile")) {
            return "Mobile";
        } else if (familyLower.contains("ipad") || familyLower.contains("tablet")) {
            return "Tablet";
        } else if (familyLower.contains("mac") || familyLower.contains("windows") || familyLower.contains("linux")) {
            return "Desktop";
        } else if (familyLower.equals("other")) {
            return "Other";
        }
        
        return "Other";
    }
}
