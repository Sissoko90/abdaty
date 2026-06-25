package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.response.MediaResponseDTO;
import com.abdatytch.backend.entity.Media;
import com.abdatytch.backend.exception.BadRequestException;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.IMediaMapper;
import com.abdatytch.backend.repository.MediaRepository;
import com.abdatytch.backend.service.IMediaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Implémentation réactive du service de gestion des médias.
 *
 * Les fichiers sont stockés sur le disque dans {@code <upload-dir>/<domain>/} et
 * exposés publiquement sous l'URL {@code <public-base>/<domain>/<filename>}
 * (cf. MediaResourceConfig qui sert le dossier d'upload en statique).
 *
 * Les opérations d'I/O disque (bloquantes) sont déportées sur le scheduler
 * boundedElastic afin de ne pas bloquer les threads réactifs Netty.
 */
@Service
public class MediaService implements IMediaService {

    private static final Logger logger = LoggerFactory.getLogger(MediaService.class);

    private final MediaRepository mediaRepository;
    private final IMediaMapper mediaMapper;

    /** Répertoire racine de stockage des uploads (configurable). */
    @Value("${app.media.upload-dir:uploads}")
    private String uploadDir;

    /** Préfixe d'URL public sous lequel les fichiers sont servis. */
    @Value("${app.media.public-base-url:/uploads}")
    private String publicBaseUrl;

    /** Taille maximale d'un fichier uploadé (octets). Défaut : 10 Mo. */
    @Value("${app.media.max-size-bytes:10485760}")
    private long maxFileSizeBytes;

    /**
     * Extensions autorisées à l'upload (whitelist). Inclut les formats d'image
     * demandés pour le logo (png/jpg/svg/gif) + documents courants. Tout le reste
     * (html, js, exécutables…) est REFUSÉ : un .html/.svg malveillant servi sous
     * le même domaine permettrait un XSS stocké.
     */
    private static final java.util.Set<String> ALLOWED_EXTENSIONS = java.util.Set.of(
        "png", "jpg", "jpeg", "gif", "webp", "svg", "ico",
        "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt"
    );

    @Autowired
    public MediaService(MediaRepository mediaRepository, IMediaMapper mediaMapper) {
        this.mediaRepository = mediaRepository;
        this.mediaMapper = mediaMapper;
    }

    @Override
    public Flux<MediaResponseDTO> getAll() {
        logger.info("Récupération de tous les médias");
        return mediaRepository.findAllByOrderByCreatedAtDesc()
            .map(mediaMapper::toResponseDTO);
    }

    @Override
    public Flux<MediaResponseDTO> getByDomain(String domain) {
        String safeDomain = sanitizeDomain(domain);
        logger.info("Récupération des médias du domaine: {}", safeDomain);
        return mediaRepository.findByMediaDomainOrderByCreatedAtDesc(safeDomain)
            .map(mediaMapper::toResponseDTO);
    }

    @Override
    public Mono<MediaResponseDTO> getById(String id) {
        logger.info("Récupération du média par id: {}", id);
        return mediaRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .map(mediaMapper::toResponseDTO);
    }

    @Override
    public Mono<MediaResponseDTO> upload(FilePart filePart, String domain, String uploadedBy) {
        final String safeDomain = sanitizeDomain(domain);
        final String original = filePart.filename();
        final String extension = extractExtension(original);
        final String storedName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        logger.info("Upload d'un média (domaine: {}, fichier: {})", safeDomain, original);

        // Whitelist d'extensions : on refuse tout type non autorisé AVANT d'écrire
        // quoi que ce soit sur le disque.
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            return Mono.error(new BadRequestException(
                "Type de fichier non autorisé : ." + (extension.isEmpty() ? "(inconnu)" : extension)));
        }

        // 1. Création du dossier de destination (I/O bloquante -> boundedElastic).
        return Mono.fromCallable(() -> {
                Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
                Path targetDir = baseDir.resolve(safeDomain).normalize();
                // Sécurité : on s'assure de rester sous le répertoire racine.
                if (!targetDir.startsWith(baseDir)) {
                    throw new IllegalArgumentException("Chemin de destination invalide");
                }
                Files.createDirectories(targetDir);
                return targetDir.resolve(storedName);
            })
            .subscribeOn(Schedulers.boundedElastic())
            // 2. Transfert du contenu du fichier vers le disque (réactif).
            .flatMap(target -> filePart.transferTo(target).thenReturn(target))
            // 3. Calcul de la taille puis construction et persistance des métadonnées.
            .flatMap(target -> Mono.fromCallable(() -> Files.size(target))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(size -> {
                    // Contrôle de taille a posteriori : si dépassement, on supprime
                    // le fichier et on refuse (évite de remplir le disque).
                    if (size > maxFileSizeBytes) {
                        return Mono.fromCallable(() -> Files.deleteIfExists(target))
                            .subscribeOn(Schedulers.boundedElastic())
                            .then(Mono.<Media>error(new BadRequestException(
                                "Fichier trop volumineux (max " + (maxFileSizeBytes / (1024 * 1024)) + " Mo)")));
                    }
                    Media media = new Media();
                    media.setFilename(storedName);
                    media.setOriginalFilename(original);
                    media.setFileType(filePart.headers().getContentType() != null
                        ? filePart.headers().getContentType().toString() : null);
                    media.setFileSize(size);
                    media.setUrl(buildPublicUrl(safeDomain, storedName));
                    media.setUploadedBy(uploadedBy);
                    media.setMediaDomain(safeDomain);
                    return mediaRepository.save(media);
                }))
            .map(mediaMapper::toResponseDTO)
            .doOnSuccess(dto -> logger.info("Média enregistré: {}", dto.getUrl()));
    }

    @Override
    public Mono<Void> delete(String id) {
        logger.info("Suppression du média id: {}", id);
        return mediaRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND)))
            .flatMap(media -> deleteFile(media)
                .then(mediaRepository.delete(media)));
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                            */
    /* ------------------------------------------------------------------ */

    /** Supprime le fichier physique associé à un média (best effort). */
    private Mono<Void> deleteFile(Media media) {
        return Mono.fromRunnable(() -> {
            try {
                Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
                Path file = baseDir.resolve(media.getMediaDomain()).resolve(media.getFilename()).normalize();
                if (file.startsWith(baseDir)) {
                    Files.deleteIfExists(file);
                }
            } catch (Exception e) {
                // On ne bloque pas la suppression en base si le fichier est déjà absent.
                logger.warn("Impossible de supprimer le fichier du média {}: {}", media.getId(), e.getMessage());
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    /** Construit l'URL publique d'un média. */
    private String buildPublicUrl(String domain, String filename) {
        String base = publicBaseUrl.endsWith("/")
            ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return base + "/" + domain + "/" + filename;
    }

    /** Nettoie le domaine pour éviter tout path traversal (caractères sûrs uniquement). */
    private String sanitizeDomain(String domain) {
        if (domain == null || domain.isBlank()) {
            return "general";
        }
        String cleaned = domain.trim().toLowerCase().replaceAll("[^a-z0-9_-]", "");
        return cleaned.isEmpty() ? "general" : cleaned;
    }

    /** Extrait l'extension d'un nom de fichier (sans le point), en minuscules. */
    private String extractExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            return "";
        }
        return filename.substring(dot + 1).toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}
