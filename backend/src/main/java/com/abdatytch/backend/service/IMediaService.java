package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.response.MediaResponseDTO;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface du service de gestion des médias (upload de fichiers).
 */
public interface IMediaService {

    /** Liste tous les médias, du plus récent au plus ancien. */
    Flux<MediaResponseDTO> getAll();

    /** Liste les médias d'un domaine (blog, documentation, general...). */
    Flux<MediaResponseDTO> getByDomain(String domain);

    /** Récupère un média par son identifiant (404 si absent). */
    Mono<MediaResponseDTO> getById(String id);

    /**
     * Enregistre un fichier uploadé sur le disque (uploads/&lt;domain&gt;/) et
     * persiste ses métadonnées.
     *
     * @param filePart   le fichier reçu (multipart)
     * @param domain     le domaine de classement (sous-dossier)
     * @param uploadedBy l'identifiant de l'utilisateur (peut être null)
     * @return le média créé
     */
    Mono<MediaResponseDTO> upload(FilePart filePart, String domain, String uploadedBy);

    /** Supprime un média : enregistrement en base + fichier sur le disque. */
    Mono<Void> delete(String id);
}
