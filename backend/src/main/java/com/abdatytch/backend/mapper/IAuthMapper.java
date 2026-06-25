package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.request.RegisterRequestDTO;
import com.abdatytch.backend.dto.response.AuthResponseDTO;
import com.abdatytch.backend.entity.User;

/**
 * Interface du mapper pour les DTOs d'authentification.
 * Définit les méthodes pour convertir entre les entités et les DTOs d'authentification.
 */
public interface IAuthMapper {

    /**
     * Convertit un RegisterRequestDTO en entité User.
     * 
     * @param registerRequest le DTO d'enregistrement
     * @return l'entité User correspondante
     */
    User toUserFromRegisterRequest(RegisterRequestDTO registerRequest);

    /**
     * Convertit une entité User en AuthResponseDTO.
     * 
     * @param user l'entité User
     * @param accessToken le token d'accès
     * @param refreshToken le token de rafraîchissement
     * @return le DTO de réponse d'authentification
     */
    AuthResponseDTO toAuthResponse(User user, String accessToken, String refreshToken);
}
