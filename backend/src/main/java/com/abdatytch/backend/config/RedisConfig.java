package com.abdatytch.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Configuration de Redis pour le caching.
 * Définit les paramètres de sérialisation et les TTL par défaut.
 */
@Configuration
@EnableCaching
public class RedisConfig implements CachingConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${app.cache.ttl:}")
    private long cacheTtl;

    /**
     * Gestionnaire d'erreurs de cache « fail-open » : si Redis est indisponible,
     * les erreurs de lecture/écriture du cache sont ignorées (loggées en WARN)
     * et la méthode annotée @Cacheable s'exécute normalement. Évite qu'une panne
     * Redis ne provoque des 500 sur les endpoints mis en cache (ex: /users).
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException ex, Cache cache, Object key) {
                logger.warn("Cache indisponible (lecture {}), on poursuit sans cache : {}", cache.getName(), ex.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException ex, Cache cache, Object key, Object value) {
                logger.warn("Cache indisponible (écriture {}) : {}", cache.getName(), ex.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException ex, Cache cache, Object key) {
                logger.warn("Cache indisponible (éviction {}) : {}", cache.getName(), ex.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException ex, Cache cache) {
                logger.warn("Cache indisponible (vidage {}) : {}", cache.getName(), ex.getMessage());
            }
        };
    }

    /**
     * Configure le RedisCacheManager avec des paramètres de sérialisation personnalisés.
     * Utilise JSON pour la sérialisation des objets et String pour les clés.
     * 
     * @param connectionFactory la factory de connexion Redis
     * @return le RedisCacheManager configuré
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Configuration de la sérialisation des clés en String
        RedisSerializationContext.SerializationPair<String> keySerializer = 
            RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer());
        
        // Configuration de la sérialisation des valeurs en JSON
        RedisSerializationContext.SerializationPair<Object> valueSerializer = 
            RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer());
        
        // Configuration du cache avec TTL par défaut depuis application.yml
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofSeconds(cacheTtl))
            .serializeKeysWith(keySerializer)
            .serializeValuesWith(valueSerializer)
            .disableCachingNullValues();
        
        // Création du cache manager
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(cacheConfig)
            .build();
    }

    /**
     * Configure le ReactiveRedisTemplate pour les opérations réactives avec Redis.
     * 
     * @param connectionFactory la factory de connexion Redis réactive
     * @return le ReactiveRedisTemplate configuré
     */
    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(ReactiveRedisConnectionFactory connectionFactory) {
        StringRedisSerializer keySerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer();
        
        RedisSerializationContext<String, Object> serializationContext = RedisSerializationContext
            .<String, Object>newSerializationContext()
            .key(keySerializer)
            .value(valueSerializer)
            .hashKey(keySerializer)
            .hashValue(valueSerializer)
            .build();
        
        return new ReactiveRedisTemplate<>(connectionFactory, serializationContext);
    }

    /**
     * Configure le ReactiveRedisTemplate pour les opérations de rate limiting avec Redis.
     * 
     * @param connectionFactory la factory de connexion Redis réactive
     * @return le ReactiveRedisTemplate configuré pour Long
     */
    @Bean
    public ReactiveRedisTemplate<String, Long> reactiveRedisTemplateLong(ReactiveRedisConnectionFactory connectionFactory) {
        StringRedisSerializer keySerializer = new StringRedisSerializer();
        Jackson2JsonRedisSerializer<Long> valueSerializer = new Jackson2JsonRedisSerializer<>(Long.class);
        
        RedisSerializationContext<String, Long> serializationContext = RedisSerializationContext
            .<String, Long>newSerializationContext()
            .key(keySerializer)
            .value(valueSerializer)
            .hashKey(keySerializer)
            .hashValue(valueSerializer)
            .build();
        
        return new ReactiveRedisTemplate<>(connectionFactory, serializationContext);
    }
}
