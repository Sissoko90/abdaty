package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.SiteSettingRequestDTO;
import com.abdatytch.backend.dto.response.SiteSettingResponseDTO;
import com.abdatytch.backend.entity.SiteSetting;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.ISiteSettingMapper;
import com.abdatytch.backend.repository.SiteSettingRepository;
import com.abdatytch.backend.service.ISiteSettingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Implémentation réactive du service de gestion des paramètres du site.
 */
@Service
public class SiteSettingService implements ISiteSettingService {

    private static final Logger logger = LoggerFactory.getLogger(SiteSettingService.class);

    private final SiteSettingRepository siteSettingRepository;
    private final ISiteSettingMapper siteSettingMapper;

    @Autowired
    public SiteSettingService(SiteSettingRepository siteSettingRepository,
                              ISiteSettingMapper siteSettingMapper) {
        this.siteSettingRepository = siteSettingRepository;
        this.siteSettingMapper = siteSettingMapper;
    }

    @Override
    public Flux<SiteSettingResponseDTO> getAll() {
        logger.info("Récupération de tous les paramètres du site");
        return siteSettingRepository.findAll()
            .map(siteSettingMapper::toResponseDTO);
    }

    @Override
    public Flux<SiteSettingResponseDTO> getByCategory(String category) {
        logger.info("Récupération des paramètres de la catégorie: {}", category);
        return siteSettingRepository.findByCategory(category)
            .map(siteSettingMapper::toResponseDTO);
    }

    @Override
    public Mono<SiteSettingResponseDTO> getByKey(String key) {
        logger.info("Récupération du paramètre: {}", key);
        return siteSettingRepository.findBySettingKey(key)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(siteSettingMapper::toResponseDTO);
    }

    @Override
    public Mono<SiteSettingResponseDTO> upsert(String key, SiteSettingRequestDTO request) {
        logger.info("Upsert du paramètre: {}", key);
        return siteSettingRepository.findBySettingKey(key)
            .flatMap(existing -> {
                // Mise à jour de la valeur / type / catégorie d'un paramètre existant.
                existing.setSettingValue(request.getValue());
                if (request.getType() != null) {
                    existing.setSettingType(request.getType());
                }
                if (request.getCategory() != null) {
                    existing.setCategory(request.getCategory());
                }
                return siteSettingRepository.save(existing);
            })
            .switchIfEmpty(Mono.defer(() -> {
                // Création d'un nouveau paramètre.
                SiteSetting created = new SiteSetting(
                    key, request.getValue(), request.getType(), request.getCategory());
                return siteSettingRepository.save(created);
            }))
            .map(siteSettingMapper::toResponseDTO);
    }

    @Override
    public Mono<Void> delete(String key) {
        logger.info("Suppression du paramètre: {}", key);
        return siteSettingRepository.findBySettingKey(key)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(siteSettingRepository::delete);
    }
}
