package com.abdatytch.backend.utils;

/**
 * Utilitaire pour la génération de username.
 * Génère un username unique à partir du nom et prénom de l'utilisateur.
 */
public class UsernameGenerator {

    /**
     * Génère un username à partir du nom et prénom.
     * Le username est généré en concaténant le prénom et le nom en minuscules avec un point entre eux.
     * 
     * @param firstName le prénom de l'utilisateur
     * @param lastName le nom de famille de l'utilisateur
     * @return le username généré
     */
    public static String generateUsername(String firstName, String lastName) {
        if (firstName == null || firstName.isEmpty() || lastName == null || lastName.isEmpty()) {
            throw new IllegalArgumentException("Le prénom et le nom sont obligatoires pour générer un username");
        }
        
        // Nettoyer les chaînes (enlever les accents, espaces, etc.)
        String cleanedFirstName = cleanString(firstName);
        String cleanedLastName = cleanString(lastName);
        
        // Générer le username: prenom.nom
        return cleanedFirstName.toLowerCase() + "." + cleanedLastName.toLowerCase();
    }

    /**
     * Nettoie une chaîne de caractères (enlève les accents, espaces, caractères spéciaux).
     * 
     * @param input la chaîne à nettoyer
     * @return la chaîne nettoyée
     */
    private static String cleanString(String input) {
        // Remplacer les accents par des caractères normaux
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}", "");
        
        // Remplacer les espaces et caractères spéciaux par rien
        return withoutAccents.replaceAll("[^a-zA-Z]", "");
    }
}
