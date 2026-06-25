package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.BlogPostRequestDTO;
import com.abdatytch.backend.dto.response.BlogPostResponseDTO;
import com.abdatytch.backend.entity.BlogPost;
import com.abdatytch.backend.exception.ConflictException;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.IBlogPostMapper;
import com.abdatytch.backend.repository.BlogPostRepository;
import com.abdatytch.backend.service.IBlogPostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Implémentation réactive du service de gestion des articles de blog.
 *
 * Toutes les opérations renvoient des types réactifs (Mono/Flux) et reposent sur
 * {@link BlogPostRepository} (R2DBC) et {@link IBlogPostMapper} pour les conversions.
 */
@Service
public class BlogPostService implements IBlogPostService {

    private static final Logger logger = LoggerFactory.getLogger(BlogPostService.class);

    /** Valeurs possibles du statut éditorial. */
    private static final String STATUS_PUBLISHED = "published";
    private static final String STATUS_DRAFT = "draft";

    private final BlogPostRepository blogPostRepository;
    private final IBlogPostMapper blogPostMapper;

    @Autowired
    public BlogPostService(BlogPostRepository blogPostRepository, IBlogPostMapper blogPostMapper) {
        this.blogPostRepository = blogPostRepository;
        this.blogPostMapper = blogPostMapper;
    }

    /* ---------------------- Lecture publique ---------------------- */

    @Override
    public Flux<BlogPostResponseDTO> getPublishedPosts() {
        logger.info("Récupération des articles publiés");
        return blogPostRepository.findByPostStatusOrderByPublishedAtDesc(STATUS_PUBLISHED)
            .map(blogPostMapper::toResponseDTO);
    }

    @Override
    public Flux<BlogPostResponseDTO> getPublishedByCategory(String category) {
        logger.info("Récupération des articles publiés de la catégorie: {}", category);
        return blogPostRepository.findByPostStatusAndCategory(STATUS_PUBLISHED, category)
            .map(blogPostMapper::toResponseDTO);
    }

    @Override
    public Mono<BlogPostResponseDTO> getPublishedBySlug(String slug) {
        logger.info("Récupération de l'article publié par slug: {}", slug);
        return blogPostRepository.findBySlug(slug)
            .filter(post -> STATUS_PUBLISHED.equalsIgnoreCase(post.getPostStatus()))
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(blogPostMapper::toResponseDTO);
    }

    /* ---------------------- Administration ------------------------ */

    @Override
    public Flux<BlogPostResponseDTO> getAllPosts() {
        logger.info("Récupération de tous les articles (admin)");
        return blogPostRepository.findAll()
            .map(blogPostMapper::toResponseDTO);
    }

    @Override
    public Mono<BlogPostResponseDTO> getById(String id) {
        logger.info("Récupération de l'article par id: {}", id);
        return blogPostRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(blogPostMapper::toResponseDTO);
    }

    @Override
    public Mono<BlogPostResponseDTO> create(BlogPostRequestDTO request) {
        logger.info("Création d'un article, slug: {}", request.getSlug());
        return blogPostRepository.existsBySlug(request.getSlug())
            .flatMap(exists -> {
                if (Boolean.TRUE.equals(exists)) {
                    return Mono.error(new ConflictException("Un article avec ce slug existe déjà"));
                }
                BlogPost entity = blogPostMapper.toEntity(request);
                // Si l'article est créé directement publié, on date la publication.
                if (STATUS_PUBLISHED.equalsIgnoreCase(entity.getPostStatus())) {
                    entity.setPublishedAt(LocalDateTime.now());
                }
                return blogPostRepository.save(entity);
            })
            .map(blogPostMapper::toResponseDTO)
            .doOnSuccess(dto -> logger.info("Article créé: {}", request.getSlug()));
    }

    @Override
    public Mono<BlogPostResponseDTO> update(String id, BlogPostRequestDTO request) {
        logger.info("Mise à jour de l'article id: {}", id);
        return blogPostRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(existing -> ensureSlugAvailable(existing, request.getSlug())
                .then(Mono.defer(() -> {
                    boolean wasPublished = STATUS_PUBLISHED.equalsIgnoreCase(existing.getPostStatus());
                    blogPostMapper.updateEntity(existing, request);
                    // Date de publication renseignée lors du passage de draft -> published.
                    if (!wasPublished && STATUS_PUBLISHED.equalsIgnoreCase(existing.getPostStatus())
                            && existing.getPublishedAt() == null) {
                        existing.setPublishedAt(LocalDateTime.now());
                    }
                    return blogPostRepository.save(existing);
                })))
            .map(blogPostMapper::toResponseDTO);
    }

    @Override
    public Mono<Void> delete(String id) {
        logger.info("Suppression de l'article id: {}", id);
        return blogPostRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(blogPostRepository::delete);
    }

    @Override
    public Mono<BlogPostResponseDTO> publish(String id) {
        logger.info("Publication de l'article id: {}", id);
        return blogPostRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(post -> {
                post.setPostStatus(STATUS_PUBLISHED);
                if (post.getPublishedAt() == null) {
                    post.setPublishedAt(LocalDateTime.now());
                }
                return blogPostRepository.save(post);
            })
            .map(blogPostMapper::toResponseDTO);
    }

    @Override
    public Mono<BlogPostResponseDTO> unpublish(String id) {
        logger.info("Dépublication de l'article id: {}", id);
        return blogPostRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(post -> {
                post.setPostStatus(STATUS_DRAFT);
                return blogPostRepository.save(post);
            })
            .map(blogPostMapper::toResponseDTO);
    }

    /**
     * Vérifie que le slug souhaité n'est pas déjà utilisé par un AUTRE article.
     * Autorise la conservation du même slug pour l'article en cours de modification.
     */
    private Mono<Void> ensureSlugAvailable(BlogPost existing, String desiredSlug) {
        if (desiredSlug == null || desiredSlug.equals(existing.getSlug())) {
            return Mono.empty();
        }
        return blogPostRepository.existsBySlug(desiredSlug)
            .flatMap(exists -> Boolean.TRUE.equals(exists)
                ? Mono.error(new ConflictException("Un article avec ce slug existe déjà"))
                : Mono.empty());
    }
}
