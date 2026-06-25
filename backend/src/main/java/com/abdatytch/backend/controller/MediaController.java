package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.response.MediaResponseDTO;
import com.abdatytch.backend.service.IMediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Controller pour la gestion des médias (upload, listing, suppression).
 *
 * Toutes les opérations sont réservées aux ADMIN. Les fichiers eux-mêmes sont
 * servis publiquement via /uploads/** (cf. MediaResourceConfig + SecurityConfig).
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/media")
@Tag(name = "Media", description = "Gestion des médias (upload de fichiers)")
public class MediaController {

    private static final Logger logger = LoggerFactory.getLogger(MediaController.class);

    private final IMediaService mediaService;

    @Autowired
    public MediaController(IMediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Uploader un fichier", description = "Enregistre un fichier dans uploads/<domaine>/ et persiste ses métadonnées")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Fichier uploadé avec succès"),
        @ApiResponse(responseCode = "400", description = "Fichier manquant ou invalide")
    })
    public Mono<ResponseEntity<MediaResponseDTO>> upload(
            @Parameter(description = "Fichier à uploader") @RequestPart("file") FilePart file,
            @Parameter(description = "Domaine de classement (sous-dossier)") @RequestParam(value = "domain", defaultValue = "general") String domain,
            @Parameter(description = "Identifiant de l'utilisateur (injecté par la passerelle)")
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        logger.info("[admin] Upload d'un média (domaine: {})", domain);
        return mediaService.upload(file, domain, userId)
            .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les médias", description = "Liste tous les médias, du plus récent au plus ancien")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<MediaResponseDTO> getAll() {
        logger.info("[admin] Liste de tous les médias");
        return mediaService.getAll();
    }

    @GetMapping("/domain/{domain}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les médias d'un domaine", description = "Liste les médias d'un domaine donné")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"))
    public Flux<MediaResponseDTO> getByDomain(
            @Parameter(description = "Domaine (blog, documentation, general...)") @PathVariable String domain) {
        logger.info("[admin] Liste des médias du domaine: {}", domain);
        return mediaService.getByDomain(domain);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Média par id", description = "Récupère un média par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Média trouvé"),
        @ApiResponse(responseCode = "404", description = "Média introuvable")
    })
    public Mono<ResponseEntity<MediaResponseDTO>> getById(
            @Parameter(description = "Identifiant du média") @PathVariable String id) {
        logger.info("[admin] Média par id: {}", id);
        return mediaService.getById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un média", description = "Supprime un média (enregistrement + fichier sur le disque)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Média supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Média introuvable")
    })
    public Mono<ResponseEntity<Void>> delete(
            @Parameter(description = "Identifiant du média") @PathVariable String id) {
        logger.info("[admin] Suppression du média id: {}", id);
        return mediaService.delete(id)
            .thenReturn(ResponseEntity.noContent().<Void>build());
    }
}
