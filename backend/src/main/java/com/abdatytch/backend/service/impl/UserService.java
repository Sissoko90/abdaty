package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.constants.MessageConstants;
import com.abdatytch.backend.dto.request.UserRequestDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import com.abdatytch.backend.dto.response.UserStatisticsDTO;
import com.abdatytch.backend.enums.UserStatus;
import com.abdatytch.backend.exception.ConflictException;
import com.abdatytch.backend.exception.ResourceNotFoundException;
import com.abdatytch.backend.mapper.IUserMapper;
import com.abdatytch.backend.repository.UserRepository;
import com.abdatytch.backend.service.IUserService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service pour la gestion des utilisateurs.
 * Contient la logique métier et utilise le pattern Repository pour l'accès aux données.
 * Implémente le caching avec Redis et la résilience avec Resilience4j.
 */
@Service
public class UserService implements IUserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final String CACHE_NAME = "users";

    private final UserRepository userRepository;
    private final IUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, IUserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Cacheable(value = CACHE_NAME, key = "'all'")
    @CircuitBreaker(name = "userService", fallbackMethod = "getAllUsersFallback")
    @Retry(name = "userService")
    public Flux<UserResponseDTO> getAllUsers() {
        logger.info("Récupération de tous les utilisateurs");
        return userRepository.findAll()
            .map(userMapper::toResponseDTO)
            .doOnComplete(() -> logger.info("Récupération terminée"))
            .doOnError(error -> logger.error("Erreur lors de la récupération", error));
    }

    @Override
    @Cacheable(value = CACHE_NAME, key = "#id")
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByIdFallback")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> getUserById(String id) {
        logger.info("Récupération de l'utilisateur avec id: {}", id);
        return userRepository.findById(id)
            .map(userMapper::toResponseDTO)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .doOnSuccess(user -> logger.info("Utilisateur trouvé: {}", id))
            .doOnError(error -> logger.error("Erreur lors de la récupération", error));
    }

    @Override
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByUsernameFallback")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> getUserByUsername(String username) {
        logger.info("Récupération de l'utilisateur avec username: {}", username);
        return userRepository.findByUsername(username)
            .map(userMapper::toResponseDTO)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)));
    }

    @Override
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByEmailFallback")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> getUserByEmail(String email) {
        logger.info("Récupération de l'utilisateur avec email: {}", email);
        return userRepository.findByEmail(email)
            .map(userMapper::toResponseDTO)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService", fallbackMethod = "createUserFallback")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> createUser(UserRequestDTO userDTO) {
        logger.info("Création de l'utilisateur: {}", userDTO.getUsername());
        return userRepository.existsByUsername(userDTO.getUsername())
            .flatMap(exists -> exists 
                ? Mono.error(new ConflictException(MessageConstants.USERNAME_ALREADY_EXISTS))
                : userRepository.existsByEmail(userDTO.getEmail())
                    .flatMap(emailExists -> emailExists
                        ? Mono.error(new ConflictException(MessageConstants.EMAIL_ALREADY_EXISTS))
                        : Mono.just(userMapper.toEntity(userDTO))
                            .map(user -> {
                                user.setPassword(passwordEncoder.encode(user.getPassword()));
                                user.setStatus(UserStatus.ACTIVE);
                                return user;
                            })
                            .flatMap(userRepository::save)
                            .map(userMapper::toResponseDTO)
                    ))
            .doOnSuccess(user -> logger.info("Utilisateur créé: {}", user.getUsername()))
            .doOnError(error -> logger.error("Erreur lors de la création", error));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService", fallbackMethod = "updateUserFallback")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> updateUser(String id, UserRequestDTO userDTO) {
        logger.info("Mise à jour de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(existingUser -> {
                userMapper.updateEntityFromDTO(existingUser, userDTO);
                if (userDTO.getPassword() != null) {
                    existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
                }
                return userRepository.save(existingUser)
                    .map(userMapper::toResponseDTO);
            })
            .doOnSuccess(user -> logger.info("Utilisateur mis à jour: {}", user.getUsername()))
            .doOnError(error -> logger.error("Erreur lors de la mise à jour", error));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService", fallbackMethod = "deleteUserFallback")
    @Retry(name = "userService")
    public Mono<Void> deleteUser(String id) {
        logger.info("Suppression de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(user -> {
                user.setStatus(UserStatus.INACTIVE);
                return userRepository.save(user);
            })
            .then()
            .doOnSuccess(v -> logger.info("Utilisateur supprimé: {}", id))
            .doOnError(error -> logger.error("Erreur lors de la suppression", error));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> activateUser(String id) {
        logger.info("Activation de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(user -> {
                user.setStatus(UserStatus.ACTIVE);
                return userRepository.save(user).map(userMapper::toResponseDTO);
            })
            .doOnSuccess(user -> logger.info("Utilisateur activé: {}", id));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> deactivateUser(String id) {
        logger.info("Désactivation de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(user -> {
                // DEACTIVATED (et non INACTIVE) pour distinguer du « email non vérifié ».
                user.setStatus(UserStatus.DEACTIVATED);
                return userRepository.save(user).map(userMapper::toResponseDTO);
            })
            .doOnSuccess(user -> logger.info("Utilisateur désactivé: {}", id));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> banUser(String id) {
        logger.info("Bannissement de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(user -> {
                user.setStatus(UserStatus.BANNED);
                return userRepository.save(user).map(userMapper::toResponseDTO);
            })
            .doOnSuccess(user -> logger.info("Utilisateur banni: {}", id));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> unbanUser(String id) {
        logger.info("Débannissement de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(user -> {
                user.setStatus(UserStatus.ACTIVE);
                return userRepository.save(user).map(userMapper::toResponseDTO);
            })
            .doOnSuccess(user -> logger.info("Utilisateur débanni: {}", id));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> blockUser(String id) {
        logger.info("Blocage de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(user -> {
                user.setStatus(UserStatus.BLOCKED);
                return userRepository.save(user).map(userMapper::toResponseDTO);
            })
            .doOnSuccess(user -> logger.info("Utilisateur bloqué: {}", id));
    }

    @Override
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Mono<UserResponseDTO> unblockUser(String id) {
        logger.info("Déblocage de l'utilisateur: {}", id);
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new ResourceNotFoundException(MessageConstants.USER_NOT_FOUND)))
            .flatMap(user -> {
                user.setStatus(UserStatus.ACTIVE);
                return userRepository.save(user).map(userMapper::toResponseDTO);
            })
            .doOnSuccess(user -> logger.info("Utilisateur débloqué: {}", id));
    }

    @Override
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Flux<UserResponseDTO> getUsersByStatus(UserStatus status) {
        logger.info("Récupération des utilisateurs avec statut: {}", status);
        // Filtrage poussé en SQL (findByStatus) plutôt qu'un findAll().filter() en mémoire.
        return userRepository.findByStatus(status)
            .map(userMapper::toResponseDTO)
            .doOnComplete(() -> logger.info("Récupération terminée pour statut: {}", status));
    }

    @Override
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    public Mono<UserStatisticsDTO> getUserStatistics() {
        logger.info("Récupération des statistiques utilisateurs");
        // Comptages via SELECT COUNT (countByStatus) au lieu de charger toute la
        // table en mémoire puis compter — robuste quand le volume grandit.
        return Mono.zip(
                userRepository.count(),
                userRepository.countByStatus(UserStatus.ACTIVE),
                userRepository.countByStatus(UserStatus.INACTIVE),
                userRepository.countByStatus(UserStatus.BANNED),
                userRepository.countByStatus(UserStatus.BLOCKED))
            .map(t -> {
                UserStatisticsDTO stats = new UserStatisticsDTO();
                stats.setTotalUsers(t.getT1());
                stats.setTotalActiveUsers(t.getT2());
                stats.setTotalInactiveUsers(t.getT3());
                stats.setTotalBannedUsers(t.getT4());
                stats.setTotalBlockedUsers(t.getT5());
                return stats;
            });
    }

    // Fallback methods
    public Flux<UserResponseDTO> getAllUsersFallback(Throwable throwable) {
        logger.error("Circuit breaker ouvert pour getAllUsers", throwable);
        return Flux.empty();
    }

    public Mono<UserResponseDTO> getUserByIdFallback(String id, Throwable throwable) {
        logger.error("Circuit breaker ouvert pour getUserById", throwable);
        return Mono.empty();
    }

    public Mono<UserResponseDTO> getUserByUsernameFallback(String username, Throwable throwable) {
        logger.error("Circuit breaker ouvert pour getUserByUsername", throwable);
        return Mono.empty();
    }

    public Mono<UserResponseDTO> getUserByEmailFallback(String email, Throwable throwable) {
        logger.error("Circuit breaker ouvert pour getUserByEmail", throwable);
        return Mono.empty();
    }

    public Mono<UserResponseDTO> createUserFallback(UserRequestDTO userDTO, Throwable throwable) {
        logger.error("Circuit breaker ouvert pour createUser", throwable);
        return Mono.error(new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE));
    }

    public Mono<UserResponseDTO> updateUserFallback(String id, UserRequestDTO userDTO, Throwable throwable) {
        logger.error("Circuit breaker ouvert pour updateUser", throwable);
        return Mono.error(new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE));
    }

    public Mono<Void> deleteUserFallback(String id, Throwable throwable) {
        logger.error("Circuit breaker ouvert pour deleteUser", throwable);
        return Mono.error(new RuntimeException(MessageConstants.SERVICE_TEMPORARILY_UNAVAILABLE));
    }
}
