package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.request.BlogPostRequestDTO;
import com.abdatytch.backend.dto.response.BlogPostResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service de gestion des articles de blog.
 *
 * Distingue deux usages :
 *  - public  : lecture des articles publiés (site vitrine) ;
 *  - admin   : CRUD complet + gestion du statut éditorial.
 */
public interface IBlogPostService {

    /* ---------------------- Lecture publique ---------------------- */

    /** Liste les articles publiés, triés par date de publication décroissante. */
    Flux<BlogPostResponseDTO> getPublishedPosts();

    /** Liste les articles publiés d'une catégorie donnée. */
    Flux<BlogPostResponseDTO> getPublishedByCategory(String category);

    /** Récupère un article publié par son slug (404 si absent ou non publié). */
    Mono<BlogPostResponseDTO> getPublishedBySlug(String slug);

    /* ---------------------- Administration ------------------------ */

    /** Liste tous les articles (brouillons inclus). */
    Flux<BlogPostResponseDTO> getAllPosts();

    /** Récupère un article par son identifiant (404 si absent). */
    Mono<BlogPostResponseDTO> getById(String id);

    /** Crée un nouvel article (409 si le slug existe déjà). */
    Mono<BlogPostResponseDTO> create(BlogPostRequestDTO request);

    /** Met à jour un article existant (404 si absent, 409 si conflit de slug). */
    Mono<BlogPostResponseDTO> update(String id, BlogPostRequestDTO request);

    /** Supprime un article (404 si absent). */
    Mono<Void> delete(String id);

    /** Publie un article (statut "published" + date de publication). */
    Mono<BlogPostResponseDTO> publish(String id);

    /** Repasse un article en brouillon (statut "draft"). */
    Mono<BlogPostResponseDTO> unpublish(String id);
}
