package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.security.rsa.RsaKeyService;
import com.abdatytch.backend.service.IJwtService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Service pour la gestion des tokens JWT.
 * Génère et valide les tokens d'accès et de rafraîchissement.
 * Implémente la résilience et les métriques.
 */
@Service
public class JwtService implements IJwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    private final MeterRegistry meterRegistry;
    private final Timer tokenGenerationTimer;
    private final Timer tokenValidationTimer;
    private final RsaKeyService rsaKeyService;

    @Value("${app.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.security.jwt.refresh-expiration}")
    private long refreshExpiration;

    @Autowired
    public JwtService(MeterRegistry meterRegistry, RsaKeyService rsaKeyService) {
        this.meterRegistry = meterRegistry;
        this.rsaKeyService = rsaKeyService;
        this.tokenGenerationTimer = meterRegistry.timer("jwt.generation.time");
        this.tokenValidationTimer = meterRegistry.timer("jwt.validation.time");
    }

    /**
     * Génère un token d'accès pour un utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param email l'email de l'utilisateur
     * @param role le rôle de l'utilisateur
     * @return le token d'accès généré
     */
    @CircuitBreaker(name = "jwtService", fallbackMethod = "generateTokenFallback")
    @Retry(name = "jwtService")
    public String generateAccessToken(String userId, String email, String role) {
        logger.info("Génération du token d'accès pour l'utilisateur: {}", userId);
        
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", userId);
            claims.put("email", email);
            claims.put("role", role);
            claims.put("type", "access");

            String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(rsaKeyService.getCurrentKeyPair().getPrivate())
                .compact();
            
            sample.stop(tokenGenerationTimer);
            logger.info("Token d'accès généré avec succès pour l'utilisateur: {}", userId);
            return token;
        } catch (Exception e) {
            sample.stop(tokenGenerationTimer);
            logger.error("Erreur lors de la génération du token d'accès pour l'utilisateur: {}", userId, e);
            throw new RuntimeException(MessageConstants.TOKEN_INVALID, e);
        }
    }

    /**
     * Génère un token de rafraîchissement pour un utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param email l'email de l'utilisateur
     * @return le token de rafraîchissement généré
     */
    @CircuitBreaker(name = "jwtService", fallbackMethod = "generateTokenFallback")
    @Retry(name = "jwtService")
    public String generateRefreshToken(String userId, String email) {
        logger.info("Génération du token de rafraîchissement pour l'utilisateur: {}", userId);
        
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", userId);
            claims.put("email", email);
            claims.put("type", "refresh");

            String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(rsaKeyService.getCurrentKeyPair().getPrivate())
                .compact();
            
            sample.stop(tokenGenerationTimer);
            logger.info("Token de rafraîchissement généré avec succès pour l'utilisateur: {}", userId);
            return token;
        } catch (Exception e) {
            sample.stop(tokenGenerationTimer);
            logger.error("Erreur lors de la génération du token de rafraîchissement pour l'utilisateur: {}", userId, e);
            throw new RuntimeException(MessageConstants.TOKEN_INVALID, e);
        }
    }

    /**
     * Extrait les claims d'un token avec support de rotation de clé.
     * 
     * @param token le token JWT
     * @return les claims du token
     */
    @CircuitBreaker(name = "jwtService", fallbackMethod = "extractClaimsFallback")
    @Retry(name = "jwtService")
    public Claims extractClaims(String token) {
        logger.info("Extraction des claims du token");
        
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            // Essayer d'abord avec la clé actuelle
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(rsaKeyService.getCurrentKeyPair().getPublic())
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            sample.stop(tokenValidationTimer);
            logger.info("Claims extraits avec succès (clé actuelle)");
            return claims;
        } catch (Exception e) {
            // Si échec, essayer avec la clé précédente (rotation de clé)
            if (rsaKeyService.getPreviousKeyPair() != null) {
                try {
                    Claims claims = Jwts.parserBuilder()
                        .setSigningKey(rsaKeyService.getPreviousKeyPair().getPublic())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
                    
                    sample.stop(tokenValidationTimer);
                    logger.info("Claims extraits avec succès (clé précédente - rotation en cours)");
                    return claims;
                } catch (Exception ex) {
                    logger.error("Erreur lors de l'extraction des claims avec la clé précédente", ex);
                }
            }
            sample.stop(tokenValidationTimer);
            logger.error("Erreur lors de l'extraction des claims", e);
            throw new RuntimeException(MessageConstants.TOKEN_INVALID, e);
        }
    }

    /**
     * Valide un token avec support de rotation de clé.
     * 
     * @param token le token JWT
     * @return true si le token est valide, false sinon
     */
    @CircuitBreaker(name = "jwtService")
    @Retry(name = "jwtService")
    public boolean validateToken(String token) {
        logger.info("Validation du token");
        
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            // Essayer d'abord avec la clé actuelle
            Jwts.parserBuilder()
                .setSigningKey(rsaKeyService.getCurrentKeyPair().getPublic())
                .build()
                .parseClaimsJws(token);
            
            sample.stop(tokenValidationTimer);
            logger.info("Token valide (clé actuelle)");
            return true;
        } catch (Exception e) {
            // Si échec, essayer avec la clé précédente (rotation de clé)
            if (rsaKeyService.getPreviousKeyPair() != null) {
                try {
                    Jwts.parserBuilder()
                        .setSigningKey(rsaKeyService.getPreviousKeyPair().getPublic())
                        .build()
                        .parseClaimsJws(token);
                    
                    sample.stop(tokenValidationTimer);
                    logger.info("Token valide (clé précédente - rotation en cours)");
                    return true;
                } catch (Exception ex) {
                    logger.debug("Token invalide avec la clé précédente : {}", ex.getMessage());
                }
            }
            sample.stop(tokenValidationTimer);
            // Un token invalide/expiré est un cas fonctionnel normal (session
            // expirée, déconnexion, requête anonyme) : on n'inonde pas les logs
            // avec une stacktrace ERROR, un message DEBUG suffit.
            logger.debug("Token invalide : {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extrait l'email d'un token.
     * 
     * @param token le token JWT
     * @return l'email extrait du token
     */
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    /**
     * Extrait l'ID utilisateur d'un token.
     * 
     * @param token le token JWT
     * @return l'ID utilisateur extrait du token
     */
    public String extractUserId(String token) {
        return extractClaims(token).get("userId", String.class);
    }

    /**
     * Extrait le rôle d'un token.
     * 
     * @param token le token JWT
     * @return le rôle extrait du token
     */
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /**
     * Extrait le type d'un token ("access" ou "refresh").
     *
     * @param token le token JWT
     * @return le type du token, ou null si absent
     */
    public String extractTokenType(String token) {
        return extractClaims(token).get("type", String.class);
    }

    /**
     * Vérifie si un token est expiré.
     * 
     * @param token le token JWT
     * @return true si le token est expiré, false sinon
     */
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    /**
     * Méthode de fallback pour la génération de token.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param email l'email de l'utilisateur
     * @param role le rôle de l'utilisateur
     * @param exception l'exception survenue
     * @return une exception
     */
    public String generateTokenFallback(String userId, String email, String role, Exception exception) {
        logger.error("Fallback: échec de la génération de token pour l'utilisateur: {}", userId);
        throw new RuntimeException(MessageConstants.TOKEN_INVALID, exception);
    }

    /**
     * Méthode de fallback pour l'extraction des claims.
     * 
     * @param token le token JWT
     * @param exception l'exception survenue
     * @return une exception
     */
    public Claims extractClaimsFallback(String token, Exception exception) {
        logger.error("Fallback: échec de l'extraction des claims");
        throw new RuntimeException(MessageConstants.TOKEN_INVALID, exception);
    }
}
