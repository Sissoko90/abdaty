package com.abdatytch.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validateur pour le pattern de mot de passe.
 * Vérifie que le mot de passe respecte les critères de sécurité.
 */
public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$"
    );

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
        // Initialisation si nécessaire
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isEmpty()) {
            return true; // La validation @NotBlank gère ce cas
        }
        
        return PASSWORD_PATTERN.matcher(password).matches();
    }
}
