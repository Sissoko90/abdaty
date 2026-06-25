package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.request.UserRequestDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import com.abdatytch.backend.dto.response.UserStatisticsDTO;
import com.abdatytch.backend.enums.UserStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Interface pour le service utilisateur.
 * Définit les méthodes pour la gestion des utilisateurs.
 */
public interface IUserService {

    /**
     * Récupère tous les utilisateurs actifs.
     * @return un Flux contenant tous les utilisateurs actifs
     */
    Flux<UserResponseDTO> getAllUsers();

    /**
     * Récupère un utilisateur par son identifiant.
     * @param id l'identifiant de l'utilisateur
     * @return un Mono contenant l'utilisateur trouvé
     */
    Mono<UserResponseDTO> getUserById(String id);

    /**
     * Récupère un utilisateur par son nom d'utilisateur.
     * @param username le nom d'utilisateur
     * @return un Mono contenant l'utilisateur trouvé
     */
    Mono<UserResponseDTO> getUserByUsername(String username);

    /**
     * Récupère un utilisateur par son adresse email.
     * @param email l'adresse email
     * @return un Mono contenant l'utilisateur trouvé
     */
    Mono<UserResponseDTO> getUserByEmail(String email);

    /**
     * Crée un nouvel utilisateur.
     * @param userDTO les données de l'utilisateur à créer
     * @return un Mono contenant l'utilisateur créé
     */
    Mono<UserResponseDTO> createUser(UserRequestDTO userDTO);

    /**
     * Met à jour un utilisateur existant.
     * @param id l'identifiant de l'utilisateur à mettre à jour
     * @param userDTO les nouvelles données de l'utilisateur
     * @return un Mono contenant l'utilisateur mis à jour
     */
    Mono<UserResponseDTO> updateUser(String id, UserRequestDTO userDTO);

    /**
     * Supprime un utilisateur (soft delete).
     * @param id l'identifiant de l'utilisateur à supprimer
     * @return un Mono vide indiquant le succès
     */
    Mono<Void> deleteUser(String id);

    /**
     * Active un utilisateur.
     * @param id l'identifiant de l'utilisateur à activer
     * @return un Mono contenant l'utilisateur activé
     */
    Mono<UserResponseDTO> activateUser(String id);

    /**
     * Désactive un utilisateur.
     * @param id l'identifiant de l'utilisateur à désactiver
     * @return un Mono contenant l'utilisateur désactivé
     */
    Mono<UserResponseDTO> deactivateUser(String id);

    /**
     * Banni un utilisateur.
     * @param id l'identifiant de l'utilisateur à bannir
     * @return un Mono contenant l'utilisateur banni
     */
    Mono<UserResponseDTO> banUser(String id);

    /**
     * Débanni un utilisateur.
     * @param id l'identifiant de l'utilisateur à débannir
     * @return un Mono contenant l'utilisateur débanni
     */
    Mono<UserResponseDTO> unbanUser(String id);

    /**
     * Bloque un utilisateur.
     * @param id l'identifiant de l'utilisateur à bloquer
     * @return un Mono contenant l'utilisateur bloqué
     */
    Mono<UserResponseDTO> blockUser(String id);

    /**
     * Débloque un utilisateur.
     * @param id l'identifiant de l'utilisateur à débloquer
     * @return un Mono contenant l'utilisateur débloqué
     */
    Mono<UserResponseDTO> unblockUser(String id);

    /**
     * Récupère les utilisateurs par statut.
     * @param status le statut des utilisateurs
     * @return un Flux contenant les utilisateurs avec le statut spécifié
     */
    Flux<UserResponseDTO> getUsersByStatus(UserStatus status);

    /**
     * Récupère les statistiques des utilisateurs.
     * @return un Mono contenant les statistiques
     */
    Mono<UserStatisticsDTO> getUserStatistics();
}
