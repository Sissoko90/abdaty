package com.abdatytch.backend.seeder;

import com.abdatytch.backend.entity.User;
import com.abdatytch.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeder pour créer un utilisateur admin au démarrage de l'application.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.email:admin@abdatytch.com}")
    private String adminEmail;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;

    @Value("${admin.firstName:Admin}")
    private String adminFirstName;

    @Value("${admin.lastName:User}")
    private String adminLastName;

    @Value("${admin.phoneNumber:+1234567890}")
    private String adminPhoneNumber;

    @Value("${admin.seeder.enabled:true}")
    private boolean seederEnabled;

    @Autowired
    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!seederEnabled) {
            logger.info("Admin seeder désactivé");
            return;
        }

        logger.info("Vérification de l'utilisateur admin...");

        userRepository.findByEmail(adminEmail)
            .flatMap(existingAdmin -> {
                logger.info("Utilisateur admin existe déjà: {}", existingAdmin.getEmail());
                return userRepository.findByUsername(adminUsername);
            })
            .switchIfEmpty(
                userRepository.findByUsername(adminUsername)
                    .switchIfEmpty(createAdminUser())
            )
            .subscribe(
                user -> logger.info("Admin seeder terminé avec succès"),
                error -> logger.error("Erreur lors du seeding admin", error)
            );
    }

    /**
     * Crée un utilisateur admin.
     * 
     * @return un Mono de l'utilisateur créé
     */
    private reactor.core.publisher.Mono<User> createAdminUser() {
        logger.info("Création de l'utilisateur admin: {}", adminEmail);

        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setFirstName(adminFirstName);
        admin.setLastName(adminLastName);
        admin.setPhoneNumber(adminPhoneNumber);
        admin.setRole("ADMIN");

        return userRepository.save(admin)
            .doOnSuccess(savedAdmin -> {
                logger.info("Utilisateur admin créé avec succès:");
                logger.info("  - Username: {}", savedAdmin.getUsername());
                logger.info("  - Email: {}", savedAdmin.getEmail());
                logger.info("  - Role: {}", savedAdmin.getRole());
                // SÉCURITÉ : ne JAMAIS logger le mot de passe en clair (les logs sont
                // capturés en mémoire et exposés via /logs + WebSocket).
                logger.warn("IMPORTANT: Veuillez changer le mot de passe admin par défaut après la première connexion!");
            })
            .doOnError(error -> logger.error("Erreur lors de la création de l'utilisateur admin", error));
    }
}
