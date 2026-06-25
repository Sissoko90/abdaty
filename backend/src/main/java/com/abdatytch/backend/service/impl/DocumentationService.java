package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.DocumentationRequestDTO;
import com.abdatytch.backend.dto.response.DocumentationResponseDTO;
import com.abdatytch.backend.entity.DocumentationEntry;
import com.abdatytch.backend.exception.ConflictException;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.IDocumentationMapper;
import com.abdatytch.backend.repository.DocumentationRepository;
import com.abdatytch.backend.service.IDocumentationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Implémentation réactive du service de gestion de la documentation.
 */
@Service
public class DocumentationService implements IDocumentationService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentationService.class);

    private final DocumentationRepository documentationRepository;
    private final IDocumentationMapper documentationMapper;

    @Autowired
    public DocumentationService(DocumentationRepository documentationRepository,
                                IDocumentationMapper documentationMapper) {
        this.documentationRepository = documentationRepository;
        this.documentationMapper = documentationMapper;
    }

    /* ---------------------- Lecture publique ---------------------- */

    @Override
    public Flux<DocumentationResponseDTO> getActiveEntries() {
        logger.info("Récupération des entrées de documentation actives");
        return documentationRepository.findByActiveTrueOrderByDisplayOrderAsc()
            .map(documentationMapper::toResponseDTO);
    }

    @Override
    public Mono<DocumentationResponseDTO> getBySlug(String slug) {
        logger.info("Récupération de la documentation par slug: {}", slug);
        return documentationRepository.findBySlug(slug)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(documentationMapper::toResponseDTO);
    }

    /* ---------------------- Administration ------------------------ */

    @Override
    public Flux<DocumentationResponseDTO> getAllEntries() {
        logger.info("Récupération de toutes les entrées de documentation (admin)");
        return documentationRepository.findAll()
            .map(documentationMapper::toResponseDTO);
    }

    @Override
    public Mono<DocumentationResponseDTO> getById(String id) {
        logger.info("Récupération de la documentation par id: {}", id);
        return documentationRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(documentationMapper::toResponseDTO);
    }

    @Override
    public Mono<DocumentationResponseDTO> create(DocumentationRequestDTO request) {
        logger.info("Création d'une entrée de documentation, slug: {}", request.getSlug());
        return documentationRepository.existsBySlug(request.getSlug())
            .flatMap(exists -> {
                if (Boolean.TRUE.equals(exists)) {
                    return Mono.error(new ConflictException("Une entrée de documentation avec ce slug existe déjà"));
                }
                return documentationRepository.save(documentationMapper.toEntity(request));
            })
            .map(documentationMapper::toResponseDTO);
    }

    @Override
    public Mono<DocumentationResponseDTO> update(String id, DocumentationRequestDTO request) {
        logger.info("Mise à jour de la documentation id: {}", id);
        return documentationRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(existing -> ensureSlugAvailable(existing, request.getSlug())
                .then(Mono.defer(() -> {
                    documentationMapper.updateEntity(existing, request);
                    return documentationRepository.save(existing);
                })))
            .map(documentationMapper::toResponseDTO);
    }

    @Override
    public Mono<Void> delete(String id) {
        logger.info("Suppression de la documentation id: {}", id);
        return documentationRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(documentationRepository::delete);
    }

    /** Vérifie que le slug souhaité n'est pas déjà pris par une AUTRE entrée. */
    private Mono<Void> ensureSlugAvailable(DocumentationEntry existing, String desiredSlug) {
        if (desiredSlug == null || desiredSlug.equals(existing.getSlug())) {
            return Mono.empty();
        }
        return documentationRepository.existsBySlug(desiredSlug)
            .flatMap(exists -> Boolean.TRUE.equals(exists)
                ? Mono.error(new ConflictException("Une entrée de documentation avec ce slug existe déjà"))
                : Mono.empty());
    }
}
