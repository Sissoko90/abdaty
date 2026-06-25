package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.User;
import com.abdatytch.backend.enums.UserStatus;

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Repository pour l'accès aux données de l'entité User.
 * Utilise R2DBC pour les opérations de base de données réactives.
 */
@Repository
public interface UserRepository extends R2dbcRepository<User, String> {

    /**
     * Trouve un utilisateur par son nom d'utilisateur.
     * 
     * @param username le nom d'utilisateur à rechercher
     * @return un Mono contenant l'utilisateur trouvé ou vide si non trouvé
     */
    Mono<User> findByUsername(String username);

    /**
     * Trouve un utilisateur par son adresse email.
     * 
     * @param email l'adresse email à rechercher
     * @return un Mono contenant l'utilisateur trouvé ou vide si non trouvé
     */
    Mono<User> findByEmail(String email);

    /**
     * Trouve un utilisateur par son numéro de téléphone.
     * 
     * @param phoneNumber le numéro de téléphone à rechercher
     * @return un Mono contenant l'utilisateur trouvé ou vide si non trouvé
     */
    Mono<User> findByPhoneNumber(String phoneNumber);

    /**
     * Trouve tous les utilisateurs actifs.
     * 
     * @return un Flux contenant tous les utilisateurs actifs
     */
    Flux<User> findByStatus(UserStatus status);

    /** Compte les utilisateurs ayant un statut donné (SELECT COUNT, indexé). */
    Mono<Long> countByStatus(UserStatus status);

    /**
     * Trouve tous les utilisateurs par rôle.
     *
     * @param role le rôle à rechercher
     * @return un Flux contenant tous les utilisateurs avec le rôle spécifié
     */
    Flux<User> findByRole(String role);

    /**
     * Vérifie si un utilisateur existe par son nom d'utilisateur.
     * 
     * @param username le nom d'utilisateur à vérifier
     * @return un Mono contenant true si l'utilisateur existe, false sinon
     */
    Mono<Boolean> existsByUsername(String username);

    /**
     * Vérifie si un utilisateur existe par son adresse email.
     * 
     * @param email l'adresse email à vérifier
     * @return un Mono contenant true si l'utilisateur existe, false sinon
     */
    Mono<Boolean> existsByEmail(String email);
}
