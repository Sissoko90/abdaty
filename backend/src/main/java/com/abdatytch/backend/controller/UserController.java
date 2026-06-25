package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.UserRequestDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import com.abdatytch.backend.dto.response.UserStatisticsDTO;
import com.abdatytch.backend.enums.UserStatus;
import com.abdatytch.backend.service.IUserService;
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
 * Controller REST pour la gestion des utilisateurs.
 * Expose les endpoints CRUD pour les opérations sur les utilisateurs.
 * Utilise la programmation réactive avec Spring WebFlux.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/users")
@Tag(name = "Users", description = "API de gestion des utilisateurs")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final IUserService userService;

    /**
     * Constructeur avec injection de dépendances.
     * 
     * @param userService le service des utilisateurs
     */
    @Autowired
    public UserController(IUserService userService) {
        this.userService = userService;
    }

    /**
     * Récupère tous les utilisateurs actifs.
     * 
     * @return un Flux contenant tous les utilisateurs actifs
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Récupérer tous les utilisateurs", description = "Retourne la liste de tous les utilisateurs actifs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des utilisateurs récupérée avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Flux<UserResponseDTO> getAllUsers() {
        logger.info("Requête GET /api/users - Récupération de tous les utilisateurs");
        return userService.getAllUsers()
            .doOnComplete(() -> logger.info("Récupération de tous les utilisateurs terminée"))
            .doOnError(error -> logger.error("Erreur lors de la récupération des utilisateurs", error));
    }

    /**
     * Récupère un utilisateur par son identifiant.
     * 
     * @param id l'identifiant de l'utilisateur
     * @return un Mono contenant l'utilisateur trouvé
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Récupérer un utilisateur par ID", description = "Retourne un utilisateur spécifique par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur trouvé"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> getUserById(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête GET /api/users/{} - Récupération de l'utilisateur", id);
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build())
            .doOnSuccess(response -> logger.info("Utilisateur trouvé: {}", id))
            .doOnError(error -> logger.error("Erreur lors de la récupération de l'utilisateur", error));
    }

    /**
     * Crée un nouvel utilisateur.
     * 
     * @param userDTO les données de l'utilisateur à créer
     * @return un Mono contenant l'utilisateur créé
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un utilisateur", description = "Crée un nouvel utilisateur avec les données fournies")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Utilisateur déjà existant"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> createUser(
            @Parameter(description = "Données de l'utilisateur") @Valid @RequestBody UserRequestDTO userDTO) {
        logger.info("Requête POST /api/users - Création de l'utilisateur: {}", userDTO.getUsername());
        return userService.createUser(userDTO)
            .map(createdUser -> ResponseEntity.status(HttpStatus.CREATED).body(createdUser))
            .doOnSuccess(response -> logger.info("Utilisateur créé avec succès: {}", userDTO.getUsername()))
            .doOnError(error -> logger.error("Erreur lors de la création de l'utilisateur", error));
    }

    /**
     * Met à jour un utilisateur existant.
     * 
     * @param id l'identifiant de l'utilisateur à mettre à jour
     * @param userDTO les nouvelles données de l'utilisateur
     * @return un Mono contenant l'utilisateur mis à jour
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour un utilisateur", description = "Met à jour les données d'un utilisateur existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur mis à jour avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> updateUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id,
            @Parameter(description = "Nouvelles données de l'utilisateur") @Valid @RequestBody UserRequestDTO userDTO) {
        logger.info("Requête PUT /api/users/{} - Mise à jour de l'utilisateur", id);
        return userService.updateUser(id, userDTO)
            .map(ResponseEntity::ok)
            .doOnSuccess(response -> logger.info("Utilisateur mis à jour avec succès: {}", id))
            .doOnError(error -> logger.error("Erreur lors de la mise à jour de l'utilisateur", error));
    }

    /**
     * Supprime un utilisateur (soft delete).
     * 
     * @param id l'identifiant de l'utilisateur à supprimer
     * @return un Mono vide indiquant le succès
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un utilisateur", description = "Supprime logiquement un utilisateur par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Utilisateur supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<Void>> deleteUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête DELETE /api/users/{} - Suppression de l'utilisateur", id);
        return userService.deleteUser(id)
            .then(Mono.just(ResponseEntity.noContent().<Void>build()))
            .doOnSuccess(response -> logger.info("Utilisateur supprimé avec succès: {}", id))
            .doOnError(error -> logger.error("Erreur lors de la suppression de l'utilisateur", error));
    }

    /**
     * Active un utilisateur.
     * 
     * @param id l'identifiant de l'utilisateur à activer
     * @return un Mono contenant l'utilisateur activé
     */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activer un utilisateur", description = "Active un utilisateur par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur activé avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> activateUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête PATCH /api/users/{}/activate - Activation de l'utilisateur", id);
        return userService.activateUser(id)
            .map(ResponseEntity::ok)
            .doOnSuccess(response -> logger.info("Utilisateur activé: {}", id))
            .doOnError(error -> logger.error("Erreur lors de l'activation", error));
    }

    /**
     * Désactive un utilisateur.
     * 
     * @param id l'identifiant de l'utilisateur à désactiver
     * @return un Mono contenant l'utilisateur désactivé
     */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Désactiver un utilisateur", description = "Désactive un utilisateur par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur désactivé avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> deactivateUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête PATCH /api/users/{}/deactivate - Désactivation de l'utilisateur", id);
        return userService.deactivateUser(id)
            .map(ResponseEntity::ok)
            .doOnSuccess(response -> logger.info("Utilisateur désactivé: {}", id))
            .doOnError(error -> logger.error("Erreur lors de la désactivation", error));
    }

    /**
     * Bannit un utilisateur.
     * 
     * @param id l'identifiant de l'utilisateur à bannir
     * @return un Mono contenant l'utilisateur banni
     */
    @PatchMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bannir un utilisateur", description = "Bannit un utilisateur par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur banni avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> banUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête PATCH /api/users/{}/ban - Bannissement de l'utilisateur", id);
        return userService.banUser(id)
            .map(ResponseEntity::ok)
            .doOnSuccess(response -> logger.info("Utilisateur banni: {}", id))
            .doOnError(error -> logger.error("Erreur lors du bannissement", error));
    }

    /**
     * Débannit un utilisateur.
     * 
     * @param id l'identifiant de l'utilisateur à débannir
     * @return un Mono contenant l'utilisateur débanni
     */
    @PatchMapping("/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Débannir un utilisateur", description = "Débannit un utilisateur par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur débanni avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> unbanUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête PATCH /api/users/{}/unban - Débannissement de l'utilisateur", id);
        return userService.unbanUser(id)
            .map(ResponseEntity::ok)
            .doOnSuccess(response -> logger.info("Utilisateur débanni: {}", id))
            .doOnError(error -> logger.error("Erreur lors du débannissement", error));
    }

    /**
     * Bloque un utilisateur.
     * 
     * @param id l'identifiant de l'utilisateur à bloquer
     * @return un Mono contenant l'utilisateur bloqué
     */
    @PatchMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bloquer un utilisateur", description = "Bloque un utilisateur par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur bloqué avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> blockUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête PATCH /api/users/{}/block - Blocage de l'utilisateur", id);
        return userService.blockUser(id)
            .map(ResponseEntity::ok)
            .doOnSuccess(response -> logger.info("Utilisateur bloqué: {}", id))
            .doOnError(error -> logger.error("Erreur lors du blocage", error));
    }

    /**
     * Débloque un utilisateur.
     * 
     * @param id l'identifiant de l'utilisateur à débloquer
     * @return un Mono contenant l'utilisateur débloqué
     */
    @PatchMapping("/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Débloquer un utilisateur", description = "Débloque un utilisateur par son identifiant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur débloqué avec succès"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserResponseDTO>> unblockUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String id) {
        logger.info("Requête PATCH /api/users/{}/unblock - Déblocage de l'utilisateur", id);
        return userService.unblockUser(id)
            .map(ResponseEntity::ok)
            .doOnSuccess(response -> logger.info("Utilisateur débloqué: {}", id))
            .doOnError(error -> logger.error("Erreur lors du déblocage", error));
    }

    /**
     * Récupère les utilisateurs par statut.
     * 
     * @param status le statut des utilisateurs à récupérer
     * @return un Flux contenant les utilisateurs avec le statut spécifié
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer les utilisateurs par statut", description = "Retourne la liste des utilisateurs avec le statut spécifié")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des utilisateurs récupérée avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Flux<UserResponseDTO> getUsersByStatus(
            @Parameter(description = "Statut des utilisateurs") @PathVariable UserStatus status) {
        logger.info("Requête GET /api/users/status/{} - Récupération des utilisateurs par statut", status);
        return userService.getUsersByStatus(status)
            .doOnComplete(() -> logger.info("Récupération terminée pour statut: {}", status))
            .doOnError(error -> logger.error("Erreur lors de la récupération par statut", error));
    }

    /**
     * Récupère les statistiques des utilisateurs.
     * 
     * @return un Mono contenant les statistiques des utilisateurs
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer les statistiques utilisateurs", description = "Retourne les statistiques globales des utilisateurs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
    })
    public Mono<ResponseEntity<UserStatisticsDTO>> getUserStatistics() {
        logger.info("Requête GET /api/users/statistics - Récupération des statistiques");
        return userService.getUserStatistics()
            .map(ResponseEntity::ok)
            .doOnSuccess(stats -> logger.info("Statistiques récupérées: {}", stats))
            .doOnError(error -> logger.error("Erreur lors de la récupération des statistiques", error));
    }
}
