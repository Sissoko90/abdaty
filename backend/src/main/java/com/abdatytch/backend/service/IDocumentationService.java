package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.request.DocumentationRequestDTO;
import com.abdatytch.backend.dto.response.DocumentationResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service de gestion de la documentation.
 */
public interface IDocumentationService {

    /* ---------------------- Lecture publique ---------------------- */

    /** Liste les entrées actives, triées par ordre d'affichage. */
    Flux<DocumentationResponseDTO> getActiveEntries();

    /** Récupère une entrée par son slug (404 si absente). */
    Mono<DocumentationResponseDTO> getBySlug(String slug);

    /* ---------------------- Administration ------------------------ */

    /** Liste toutes les entrées (inactives incluses). */
    Flux<DocumentationResponseDTO> getAllEntries();

    /** Récupère une entrée par son identifiant (404 si absente). */
    Mono<DocumentationResponseDTO> getById(String id);

    /** Crée une nouvelle entrée (409 si slug déjà utilisé). */
    Mono<DocumentationResponseDTO> create(DocumentationRequestDTO request);

    /** Met à jour une entrée existante (404 / 409). */
    Mono<DocumentationResponseDTO> update(String id, DocumentationRequestDTO request);

    /** Supprime une entrée (404 si absente). */
    Mono<Void> delete(String id);
}
