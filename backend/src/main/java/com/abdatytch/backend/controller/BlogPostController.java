package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.BlogPostRequestDTO;
import com.abdatytch.backend.dto.response.BlogPostResponseDTO;
import com.abdatytch.backend.service.IBlogPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controller pour la gestion des articles de blog.
 *
 * Deux familles d'endpoints :
 *  - lecture PUBLIQUE des articles publiés (consommée par le site vitrine) ;
 *  - administration (ADMIN uniquement) pour le CRUD et la publication.
 *
 * Les endpoints publics en lecture sont également autorisés au niveau de la
 * configuration de sécurité (SecurityConfig) pour les requêtes GET sur /blog/**.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/blog")
@Tag(name = "Blog", description = "Gestion et consultation des articles de blog")
public class BlogPostController {

    private static final Logger logger = LoggerFactory.getLogger(BlogPostController.class);

    private final IBlogPostService blogPostService;

    @Autowired
    public BlogPostController(IBlogPostService blogPostService) {
        this.blogPostService = blogPostService;
    }

    /* ============================ PUBLIC ============================ */

    /**
     * Liste les articles publiés (page blog du site).
     */
    @GetMapping
    @PreAuthorize("permitAll()")
    @Operation(summary = "Articles publiés", description = "Liste les articles publiés, triés par date de publication décroissante")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<BlogPostResponseDTO> getPublishedPosts() {
        logger.info("[public] Liste des articles publiés");
        return blogPostService.getPublishedPosts();
    }

    /**
     * Liste les articles publiés d'une catégorie.
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Articles publiés par catégorie", description = "Liste les articles publiés d'une catégorie donnée")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<BlogPostResponseDTO> getByCategory(
            @Parameter(description = "Catégorie de l'article") @PathVariable String category) {
        logger.info("[public] Articles publiés de la catégorie: {}", category);
        return blogPostService.getPublishedByCategory(category);
    }

    /**
     * Récupère un article publié par son slug (page de détail).
     */
    @GetMapping("/slug/{slug}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Article publié par slug", description = "Récupère un article publié à partir de son slug")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Article trouvé"),
        @ApiResponse(responseCode = "404", description = "Article introuvable ou non publié")
    })
    public Mono<ResponseEntity<BlogPostResponseDTO>> getBySlug(
            @Parameter(description = "Slug de l'article") @PathVariable String slug) {
        logger.info("[public] Article par slug: {}", slug);
        return blogPostService.getPublishedBySlug(slug)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /* ============================ ADMIN ============================ */

    /**
     * Liste TOUS les articles (brouillons inclus) — administration.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tous les articles (admin)", description = "Liste tous les articles, brouillons inclus")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<BlogPostResponseDTO> getAllPosts() {
        logger.info("[admin] Liste de tous les articles");
        return blogPostService.getAllPosts();
    }

    /**
     * Récupère un article par son identifiant — administration.
     */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Article par id (admin)", description = "Récupère un article par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Article trouvé"),
        @ApiResponse(responseCode = "404", description = "Article introuvable")
    })
    public Mono<ResponseEntity<BlogPostResponseDTO>> getById(
            @Parameter(description = "Identifiant de l'article") @PathVariable String id) {
        logger.info("[admin] Article par id: {}", id);
        return blogPostService.getById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Crée un nouvel article — administration.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un article", description = "Crée un nouvel article de blog")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Article créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Slug déjà utilisé")
    })
    public Mono<ResponseEntity<BlogPostResponseDTO>> create(@Valid @RequestBody BlogPostRequestDTO request) {
        logger.info("[admin] Création d'un article, slug: {}", request.getSlug());
        return blogPostService.create(request)
            .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto));
    }

    /**
     * Met à jour un article existant — administration.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour un article", description = "Met à jour un article existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Article mis à jour avec succès"),
        @ApiResponse(responseCode = "404", description = "Article introuvable"),
        @ApiResponse(responseCode = "409", description = "Slug déjà utilisé")
    })
    public Mono<ResponseEntity<BlogPostResponseDTO>> update(
            @Parameter(description = "Identifiant de l'article") @PathVariable String id,
            @Valid @RequestBody BlogPostRequestDTO request) {
        logger.info("[admin] Mise à jour de l'article id: {}", id);
        return blogPostService.update(id, request)
            .map(ResponseEntity::ok);
    }

    /**
     * Supprime un article — administration.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un article", description = "Supprime un article de blog")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Article supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Article introuvable")
    })
    public Mono<ResponseEntity<Void>> delete(
            @Parameter(description = "Identifiant de l'article") @PathVariable String id) {
        logger.info("[admin] Suppression de l'article id: {}", id);
        return blogPostService.delete(id)
            .thenReturn(ResponseEntity.noContent().<Void>build());
    }

    /**
     * Publie un article — administration.
     */
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publier un article", description = "Passe un article au statut publié")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Article publié avec succès"),
        @ApiResponse(responseCode = "404", description = "Article introuvable")
    })
    public Mono<ResponseEntity<BlogPostResponseDTO>> publish(
            @Parameter(description = "Identifiant de l'article") @PathVariable String id) {
        logger.info("[admin] Publication de l'article id: {}", id);
        return blogPostService.publish(id)
            .map(ResponseEntity::ok);
    }

    /**
     * Repasse un article en brouillon — administration.
     */
    @PatchMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dépublier un article", description = "Repasse un article au statut brouillon")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Article dépublié avec succès"),
        @ApiResponse(responseCode = "404", description = "Article introuvable")
    })
    public Mono<ResponseEntity<BlogPostResponseDTO>> unpublish(
            @Parameter(description = "Identifiant de l'article") @PathVariable String id) {
        logger.info("[admin] Dépublication de l'article id: {}", id);
        return blogPostService.unpublish(id)
            .map(ResponseEntity::ok);
    }
}
