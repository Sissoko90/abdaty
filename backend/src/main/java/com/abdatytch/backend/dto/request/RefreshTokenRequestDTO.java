package com.abdatytch.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO pour la requête de rafraîchissement du token.
 * Contient le refresh token pour obtenir un nouveau access token.
 */
public class RefreshTokenRequestDTO {

    /**
     * Token de rafraîchissement.
     */
    @NotBlank(message = "Le token de rafraîchissement est obligatoire")
    private String refreshToken;

    public String getRefreshToken() {return refreshToken;}

    public void setRefreshToken(String refreshToken) {this.refreshToken = refreshToken;}
}
