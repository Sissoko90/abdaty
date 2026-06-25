package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.BlogPost;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository R2DBC pour les articles de blog.
 * Fournit les opérations CRUD ainsi que des requêtes dérivées spécifiques.
 */
@Repository
public interface BlogPostRepository extends R2dbcRepository<BlogPost, String> {

    /**
     * Trouve un article par son slug (unique).
     *
     * @param slug le slug de l'article
     * @return un Mono de BlogPost
     */
    Mono<BlogPost> findBySlug(String slug);

    /**
     * Indique si un article existe déjà pour le slug donné.
     *
     * @param slug le slug à vérifier
     * @return un Mono booléen
     */
    Mono<Boolean> existsBySlug(String slug);

    /**
     * Trouve les articles par statut éditorial, triés par date de publication décroissante.
     *
     * @param postStatus le statut ("draft" ou "published")
     * @return un Flux de BlogPost
     */
    Flux<BlogPost> findByPostStatusOrderByPublishedAtDesc(String postStatus);

    /**
     * Trouve les articles par statut éditorial et catégorie.
     *
     * @param postStatus le statut ("draft" ou "published")
     * @param category   la catégorie
     * @return un Flux de BlogPost
     */
    Flux<BlogPost> findByPostStatusAndCategory(String postStatus, String category);

    /**
     * Compte les articles par statut éditorial.
     *
     * @param postStatus le statut
     * @return un Mono avec le compte
     */
    Mono<Long> countByPostStatus(String postStatus);
}
