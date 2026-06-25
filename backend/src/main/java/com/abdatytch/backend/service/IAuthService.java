package com.abdatytch.backend.service;

import com.abdatytch.backend.dto.request.*;
import com.abdatytch.backend.dto.response.AuthResponseDTO;
import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import reactor.core.publisher.Mono;

/**
 * Interface du service d'authentification.
 * Définit les méthodes pour l'enregistrement, la connexion, le rafraîchissement de token, etc.
 */
public interface IAuthService {

    /**
     * Enregistre un nouvel utilisateur.
     * 
     * @param registerRequest les données d'enregistrement
     * @return un Mono contenant le message de succès
     */
    Mono<MessageResponseDTO> register(RegisterRequestDTO registerRequest);

    /**
     * Connecte un utilisateur.
     * 
     * @param loginRequest les données de connexion
     * @param clientIp     l'IP cliente (anti-bruteforce par IP)
     * @return un Mono contenant la réponse d'authentification
     */
    Mono<AuthResponseDTO> login(LoginRequestDTO loginRequest, String clientIp);

    /**
     * Rafraîchit le token d'accès.
     * 
     * @param refreshTokenRequest les données de rafraîchissement
     * @return un Mono contenant la nouvelle réponse d'authentification
     */
    Mono<AuthResponseDTO> refreshToken(RefreshTokenRequestDTO refreshTokenRequest);

    /**
     * Demande la réinitialisation du mot de passe.
     * 
     * @param forgotPasswordRequest les données d'oubli de mot de passe
     * @return un Mono contenant le message de succès
     */
    Mono<MessageResponseDTO> forgotPassword(ForgotPasswordRequestDTO forgotPasswordRequest);

    /**
     * Réinitialise le mot de passe.
     * 
     * @param resetPasswordRequest les données de réinitialisation
     * @return un Mono contenant le message de succès
     */
    Mono<MessageResponseDTO> resetPassword(ResetPasswordRequestDTO resetPasswordRequest);

    /**
     * Vérifie un code de validation.
     * 
     * @param verifyCodeRequest les données de vérification
     * @return un Mono contenant le message de succès
     */
    Mono<MessageResponseDTO> verifyCode(VerifyCodeRequestDTO verifyCodeRequest);

    /**
     * Récupère les informations de l'utilisateur authentifié.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @return un Mono contenant les informations de l'utilisateur
     */
    Mono<UserResponseDTO> authMe(String userId);

    /**
     * Déconnecte un utilisateur en détruisant sa session.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param refreshToken le refresh token à révoquer
     * @return un Mono contenant le message de succès
     */
    Mono<MessageResponseDTO> logout(String userId, String refreshToken);
}
