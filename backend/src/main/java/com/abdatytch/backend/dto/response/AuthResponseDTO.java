package com.abdatytch.backend.dto.response;

/**
 * DTO pour la réponse d'authentification.
 * Contient le token d'accès et le token de rafraîchissement.
 */
public class AuthResponseDTO {

    /**
     * Token d'accès JWT.
     */
    private String accessToken;

    /**
     * Token de rafraîchissement.
     */
    private String refreshToken;

    /**
     * Type de token (Bearer).
     */
    private String tokenType = "Bearer";

    public AuthResponseDTO() {}

    public AuthResponseDTO(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {return accessToken;}

    public void setAccessToken(String accessToken) {this.accessToken = accessToken;}


    public String getRefreshToken() {return refreshToken;}


    public void setRefreshToken(String refreshToken) {this.refreshToken = refreshToken;}

    public String getTokenType() {return tokenType;}

    public void setTokenType(String tokenType) {this.tokenType = tokenType;}
}
