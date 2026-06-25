package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.*;
import com.abdatytch.backend.dto.response.AuthResponseDTO;
import com.abdatytch.backend.dto.response.MessageResponseDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import com.abdatytch.backend.service.impl.AuthService;

import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

/**
 * Controller pour l'authentification.
 * Gère les endpoints d'enregistrement, connexion, rafraîchissement de token, etc.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/auth")
@Tag(name = "Authentication", description = "Endpoints pour l'authentification des utilisateurs")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Enregistre un nouvel utilisateur.
     * 
     * @param registerRequest les données d'enregistrement
     * @return un Mono contenant la réponse HTTP
     */
    @PostMapping("/register")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Enregistre un nouvel utilisateur", description = "Crée un compte utilisateur avec validation par email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur enregistré avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Email déjà utilisé")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        logger.debug("Requête d'enregistrement reçue pour l'email: {}", registerRequest.getEmail());
        return authService.register(registerRequest)
            .map(response -> ResponseEntity.ok(response))
            // Message d'erreur du backend renvoyé dans le corps (email déjà
            // existant, mot de passe trop faible…) plutôt qu'un 400 vide.
            .onErrorResume(error -> Mono.just(
                ResponseEntity.badRequest().body(new MessageResponseDTO(error.getMessage()))));
    }

    /**
     * Connecte un utilisateur.
     * 
     * @param loginRequest les données de connexion
     * @return un Mono contenant la réponse HTTP avec les tokens
     */
    @PostMapping("/login")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Connecte un utilisateur", description = "Authentifie un utilisateur et retourne les tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Connexion réussie"),
        @ApiResponse(responseCode = "401", description = "Identifiants invalides"),
        @ApiResponse(responseCode = "403", description = "Compte banni ou bloqué")
    })
    public Mono<ResponseEntity<?>> login(@Valid @RequestBody LoginRequestDTO loginRequest,
                                         ServerWebExchange exchange) {
        logger.debug("Requête de connexion reçue pour l'email: {}", loginRequest.getEmail());
        return authService.login(loginRequest, clientIp(exchange))
            .<ResponseEntity<?>>map(response -> ResponseEntity.ok(response))
            // On renvoie le message d'erreur du backend (compte désactivé, non
            // vérifié, identifiants invalides…) dans le corps : sans cela un 401
            // « vide » remontait au frontend comme « Requête échouée (401) ».
            .onErrorResume(error -> Mono.just(
                ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponseDTO(error.getMessage()))));
    }

    /**
     * Rafraîchit le token d'accès.
     * 
     * @param refreshTokenRequest les données de rafraîchissement
     * @return un Mono contenant la réponse HTTP avec les nouveaux tokens
     */
    @PostMapping("/refresh-token")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Rafraîchit le token", description = "Génère un nouveau token d'accès à partir du refresh token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token rafraîchi avec succès"),
        @ApiResponse(responseCode = "401", description = "Refresh token invalide ou expiré")
    })
    public Mono<ResponseEntity<AuthResponseDTO>> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO refreshTokenRequest) {
        logger.info("Requête de rafraîchissement de token reçue");
        return authService.refreshToken(refreshTokenRequest)
            .map(response -> ResponseEntity.ok(response));
            // Erreurs gérées par le GlobalExceptionHandler (401 + message).
    }

    /**
     * Demande la réinitialisation du mot de passe.
     * 
     * @param forgotPasswordRequest les données d'oubli de mot de passe
     * @return un Mono contenant la réponse HTTP
     */
    @PostMapping("/forgot-password")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Demande la réinitialisation du mot de passe", description = "Envoie un code de validation par email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Code de réinitialisation envoyé"),
        @ApiResponse(responseCode = "400", description = "Email invalide")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO forgotPasswordRequest) {
        logger.debug("Requête d'oubli de mot de passe reçue");
        return authService.forgotPassword(forgotPasswordRequest)
            .map(response -> ResponseEntity.ok(response));
            // Les erreurs (code invalide, email inexistant…) sont gérées par le
            // GlobalExceptionHandler : bon code HTTP + message dans le corps.
    }

    /**
     * Réinitialise le mot de passe.
     * 
     * @param resetPasswordRequest les données de réinitialisation
     * @return un Mono contenant la réponse HTTP
     */
    @PostMapping("/reset-password")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Réinitialise le mot de passe", description = "Modifie le mot de passe avec le code de validation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mot de passe réinitialisé avec succès"),
        @ApiResponse(responseCode = "400", description = "Code invalide ou mot de passe trop faible")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO resetPasswordRequest) {
        logger.info("Requête de réinitialisation de mot de passe reçue");
        return authService.resetPassword(resetPasswordRequest)
            .map(response -> ResponseEntity.ok(response));
            // Les erreurs (code invalide, email inexistant…) sont gérées par le
            // GlobalExceptionHandler : bon code HTTP + message dans le corps.
    }

    /**
     * Vérifie un code de validation.
     * 
     * @param verifyCodeRequest les données de vérification
     * @return un Mono contenant la réponse HTTP
     */
    @PostMapping("/verify-code")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Vérifie un code de validation", description = "Valide le code de validation envoyé par email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Code valide"),
        @ApiResponse(responseCode = "400", description = "Code invalide ou expiré")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> verifyCode(@Valid @RequestBody VerifyCodeRequestDTO verifyCodeRequest) {
        logger.debug("Requête de vérification de code reçue pour l'email: {}", verifyCodeRequest.getEmail());
        return authService.verifyCode(verifyCodeRequest)
            .map(response -> ResponseEntity.ok(response));
            // Les erreurs (code invalide, email inexistant…) sont gérées par le
            // GlobalExceptionHandler : bon code HTTP + message dans le corps.
    }

    /**
     * Récupère les informations de l'utilisateur authentifié.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @return un Mono contenant la réponse HTTP avec les informations de l'utilisateur
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Récupère les informations de l'utilisateur authentifié", description = "Retourne les informations de l'utilisateur connecté")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Informations récupérées avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    public Mono<ResponseEntity<UserResponseDTO>> authMe(@AuthenticationPrincipal String userId) {
        logger.info("Requête authMe reçue pour l'utilisateur: {}", userId);
        return authService.authMe(userId)
            .map(response -> ResponseEntity.ok(response));
            // Erreurs gérées par le GlobalExceptionHandler (404 + message).
    }

    /**
     * Déconnecte un utilisateur.
     * 
     * @param userId l'identifiant de l'utilisateur
     * @param refreshToken le refresh token à révoquer
     * @return un Mono contenant la réponse HTTP
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Déconnecte un utilisateur", description = "Détruit la session et révoque le refresh token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Déconnexion réussie"),
        @ApiResponse(responseCode = "401", description = "Non authentifié ou refresh token invalide")
    })
    public Mono<ResponseEntity<MessageResponseDTO>> logout(
            @AuthenticationPrincipal String userId,
            @RequestHeader("X-Refresh-Token") String refreshToken) {
        logger.info("Requête de déconnexion reçue pour l'utilisateur: {}", userId);
        return authService.logout(userId, refreshToken)
            .map(response -> ResponseEntity.ok(response));
            // Erreurs gérées par le GlobalExceptionHandler (401 + message).
    }

    /**
     * Résout l'IP cliente : première entrée de X-Forwarded-For si présente
     * (derrière un proxy/LB), sinon l'adresse distante de la connexion.
     */
    private String clientIp(ServerWebExchange exchange) {
        String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return exchange.getRequest().getRemoteAddress() != null
            ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
            : "unknown";
    }
}
