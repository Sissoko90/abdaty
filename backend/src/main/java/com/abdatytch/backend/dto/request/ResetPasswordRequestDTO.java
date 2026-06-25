package com.abdatytch.backend.dto.request;

import com.abdatytch.backend.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO pour la requête de réinitialisation du mot de passe.
 * Contient le code de validation et le nouveau mot de passe.
 */
public class ResetPasswordRequestDTO {

    /**
     * Code de validation envoyé par email.
     */
    @NotBlank(message = "Le code de validation est obligatoire")
    private String code;

    /**
     * Nouveau mot de passe.
     */
    @NotBlank(message = "Le mot de passe est obligatoire")
    @ValidPassword
    private String newPassword;

    /**
     * Confirmation du nouveau mot de passe.
     */
    @NotBlank(message = "La confirmation du mot de passe est obligatoire")
    private String confirmPassword;

    public String getCode() {return code;}

    public void setCode(String code) {this.code = code;}

    public String getNewPassword() {return newPassword;}

    public void setNewPassword(String newPassword) {this.newPassword = newPassword;}

    public String getConfirmPassword() {return confirmPassword;}

    public void setConfirmPassword(String confirmPassword) {this.confirmPassword = confirmPassword;}
}
