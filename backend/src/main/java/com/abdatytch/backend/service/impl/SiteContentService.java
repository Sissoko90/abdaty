package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.SiteContentRequestDTO;
import com.abdatytch.backend.dto.response.SiteContentResponseDTO;
import com.abdatytch.backend.exception.ConflictException;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.ISiteContentMapper;
import com.abdatytch.backend.repository.SiteContentRepository;
import com.abdatytch.backend.service.ISiteContentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Implémentation réactive du service de gestion du contenu éditorial unifié.
 */
@Service
public class SiteContentService implements ISiteContentService {

    private static final Logger logger = LoggerFactory.getLogger(SiteContentService.class);

    private final SiteContentRepository siteContentRepository;
    private final ISiteContentMapper siteContentMapper;

    @Autowired
    public SiteContentService(SiteContentRepository siteContentRepository,
                              ISiteContentMapper siteContentMapper) {
        this.siteContentRepository = siteContentRepository;
        this.siteContentMapper = siteContentMapper;
    }

    /* ---------------------- Lecture publique ---------------------- */

    @Override
    public Flux<SiteContentResponseDTO> getActiveSection(String section) {
        logger.info("Récupération du contenu actif de la section: {}", section);
        return siteContentRepository.findBySectionAndActiveTrueOrderByDisplayOrderAsc(section)
            .map(siteContentMapper::toResponseDTO);
    }

    @Override
    public Mono<SiteContentResponseDTO> getItem(String section, String contentKey) {
        logger.info("Récupération du bloc de contenu: {}/{}", section, contentKey);
        return siteContentRepository.findBySectionAndContentKey(section, contentKey)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(siteContentMapper::toResponseDTO);
    }

    /* ---------------------- Administration ------------------------ */

    @Override
    public Flux<SiteContentResponseDTO> getAll() {
        logger.info("Récupération de tout le contenu (admin)");
        return siteContentRepository.findAllByOrderBySectionAscDisplayOrderAsc()
            .map(siteContentMapper::toResponseDTO);
    }

    @Override
    public Flux<SiteContentResponseDTO> getSection(String section) {
        logger.info("Récupération de tout le contenu de la section (admin): {}", section);
        return siteContentRepository.findBySectionOrderByDisplayOrderAsc(section)
            .map(siteContentMapper::toResponseDTO);
    }

    @Override
    public Mono<SiteContentResponseDTO> getById(String id) {
        logger.info("Récupération du bloc de contenu par id: {}", id);
        return siteContentRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(siteContentMapper::toResponseDTO);
    }

    @Override
    public Mono<SiteContentResponseDTO> create(SiteContentRequestDTO request) {
        logger.info("Création d'un bloc de contenu: {}/{}", request.getSection(), request.getContentKey());
        return siteContentRepository.existsBySectionAndContentKey(request.getSection(), request.getContentKey())
            .flatMap(exists -> {
                if (Boolean.TRUE.equals(exists)) {
                    return Mono.error(new ConflictException("Un bloc de contenu existe déjà pour cette section et cette clé"));
                }
                return siteContentRepository.save(siteContentMapper.toEntity(request));
            })
            .map(siteContentMapper::toResponseDTO);
    }

    @Override
    public Mono<SiteContentResponseDTO> update(String id, SiteContentRequestDTO request) {
        logger.info("Mise à jour du bloc de contenu id: {}", id);
        return siteContentRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(existing -> {
                siteContentMapper.updateEntity(existing, request);
                return siteContentRepository.save(existing);
            })
            .map(siteContentMapper::toResponseDTO);
    }

    @Override
    public Mono<SiteContentResponseDTO> upsert(String section, String contentKey, SiteContentRequestDTO request) {
        logger.info("Upsert du bloc de contenu: {}/{}", section, contentKey);
        // La clé fonctionnelle provient du chemin ; on l'impose dans la requête.
        request.setSection(section);
        request.setContentKey(contentKey);
        return siteContentRepository.findBySectionAndContentKey(section, contentKey)
            .flatMap(existing -> {
                siteContentMapper.updateEntity(existing, request);
                return siteContentRepository.save(existing);
            })
            .switchIfEmpty(Mono.defer(() ->
                siteContentRepository.save(siteContentMapper.toEntity(request))))
            .map(siteContentMapper::toResponseDTO);
    }

    @Override
    public Mono<Void> delete(String id) {
        logger.info("Suppression du bloc de contenu id: {}", id);
        return siteContentRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(siteContentRepository::delete);
    }
}
