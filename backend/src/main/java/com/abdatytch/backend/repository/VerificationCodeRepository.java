package com.abdatytch.backend.repository;

import com.abdatytch.backend.entity.VerificationCode;
import com.abdatytch.backend.enums.VerificationCodeType;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

/**
 * Repository pour la gestion des codes de validation.
 * Fournit les méthodes CRUD pour les opérations sur les codes de validation.
 */
@Repository
public interface VerificationCodeRepository extends R2dbcRepository<VerificationCode, String> {

    /**
     * Trouve un code de validation par email et type.
     * 
     * @param email l'adresse email
     * @param type le type de code
     * @return un Mono contenant le code de validation
     */
    Mono<VerificationCode> findByEmailAndType(String email, VerificationCodeType type);

    /**
     * Trouve un code de validation par son code.
     * 
     * @param code le code de validation
     * @return un Mono contenant le code de validation
     */
    Mono<VerificationCode> findByCode(String code);

    /**
     * Trouve tous les codes de validation expirés.
     * 
     * @param now la date actuelle
     * @return un Flux contenant les codes de validation expirés
     */
    Flux<VerificationCode> findByExpiresAtBefore(LocalDateTime now);

    /**
     * Supprime tous les codes de validation expirés.
     * 
     * @param now la date actuelle
     * @return un Mono contenant le nombre de codes supprimés
     */
    Mono<Long> deleteByExpiresAtBefore(LocalDateTime now);

    /**
     * Supprime tous les codes de validation pour un email.
     * 
     * @param email l'adresse email
     * @return un Mono contenant le nombre de codes supprimés
     */
    Mono<Long> deleteByEmail(String email);
}
