package com.abdatytch.backend.security.rsa;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.attribute.PosixFilePermission;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Set;

/**
 * Service pour la gestion des clés RSA avec rotation automatique.
 * Génère et stocke les paires de clés RSA pour la signature JWT.
 */
@Service
public class RsaKeyService {

    private static final Logger logger = LoggerFactory.getLogger(RsaKeyService.class);

    @Value("${jwt.rsa.key-size:2048}")
    private int keySize;

    @Value("${rsa.key.rotation.enabled:true}")
    private boolean rotationEnabled;

    @Value("${rsa.key.rotation.interval.days:30}")
    private int rotationIntervalDays;

    @Value("${rsa.key.storage.path:${user.home}/.abdaty/rsa}")
    private String keyStoragePath;

    private static final String PUBLIC_KEY_FILE = "rsa-public.key";
    private static final String PRIVATE_KEY_FILE = "rsa-private.key";

    private KeyPair currentKeyPair;
    private KeyPair previousKeyPair;
    private Date keyGenerationDate;

    /**
     * Store partagé (Vault) injecté seulement s'il existe (VAULT_ENABLED=true).
     * Absent en dev → on retombe sur la persistance disque locale.
     */
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private SharedRsaKeyStore sharedKeyStore;

    public RsaKeyService() {
        // Constructeur vide
    }

    @PostConstruct
    public void init() {
        // Source des clés par ordre de préférence :
        //  1. Store PARTAGÉ (Vault) si présent → tous les réplicas signent/valident
        //     avec la MÊME paire (indispensable au scaling horizontal).
        //  2. Sinon, persistance DISQUE locale (mono-instance) : sans persistance,
        //     chaque redémarrage régénère une paire et invalide TOUS les tokens
        //     → 401 « JWT signature does not match » + déconnexions intempestives.
        if (sharedKeyStore != null && initFromSharedStore()) {
            this.keyGenerationDate = new Date();
            logger.info("Service RSA initialisé (store partagé)");
            logger.info(getKeyInfo());
            return;
        }
        File dir = new File(keyStoragePath);
        File pubFile = new File(dir, PUBLIC_KEY_FILE);
        File privFile = new File(dir, PRIVATE_KEY_FILE);
        try {
            if (pubFile.exists() && privFile.exists()) {
                String pub = Files.readString(pubFile.toPath()).trim();
                String priv = Files.readString(privFile.toPath()).trim();
                initializeFromKeys(pub, priv);
                logger.info("Paire de clés RSA chargée depuis {}", dir.getAbsolutePath());
            } else {
                generateNewKeyPair();
                persistCurrentKeyPair(dir, pubFile, privFile);
                logger.info("Nouvelle paire de clés RSA générée et persistée dans {}", dir.getAbsolutePath());
            }
        } catch (Exception e) {
            // Disque indisponible/en lecture seule : on retombe sur une clé en
            // mémoire pour ne pas empêcher le démarrage (les tokens ne survivront
            // alors pas au prochain redémarrage).
            logger.warn("Clés RSA non persistées ({}). Génération en mémoire uniquement.", e.getMessage());
            if (currentKeyPair == null) {
                generateNewKeyPair();
            }
        }
        this.keyGenerationDate = new Date();
        logger.info("Service RSA initialisé");
        logger.info(getKeyInfo());
    }

    /**
     * Charge (ou initialise) la paire depuis le store partagé (Vault).
     *
     * @return true si la paire est désormais en mémoire via le store partagé,
     *         false si le store est inaccessible (→ repli disque par l'appelant).
     *
     * NB : en démarrage simultané de plusieurs réplicas avec un store vide, une
     * course est possible (deux générations concurrentes). À durcir via une
     * écriture conditionnelle (CAS Vault KV v2) ou un provisionnement préalable
     * de la clé dans Vault avant le premier déploiement.
     */
    private boolean initFromSharedStore() {
        try {
            var existing = sharedKeyStore.load();
            if (existing.isPresent()) {
                initializeFromKeys(existing.get().publicKeyBase64(), existing.get().privateKeyBase64());
                logger.info("Paire de clés RSA chargée depuis le store partagé");
            } else {
                generateNewKeyPair();
                sharedKeyStore.save(getPublicKey(), getPrivateKey());
                logger.info("Nouvelle paire de clés RSA générée et écrite dans le store partagé");
            }
            return true;
        } catch (Exception e) {
            logger.error("Store partagé RSA inaccessible ({}). Repli sur le disque local.", e.getMessage());
            return false;
        }
    }

    /**
     * Persiste la paire de clés courante sur le disque (clé publique + privée en
     * Base64). La clé privée est restreinte au propriétaire (best effort POSIX).
     */
    private void persistCurrentKeyPair(File dir, File pubFile, File privFile) throws IOException {
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IOException("Impossible de créer le répertoire " + dir.getAbsolutePath());
        }
        Files.writeString(pubFile.toPath(), getPublicKey());
        Files.writeString(privFile.toPath(), getPrivateKey());
        try {
            Files.setPosixFilePermissions(privFile.toPath(),
                Set.of(PosixFilePermission.OWNER_READ, PosixFilePermission.OWNER_WRITE));
        } catch (UnsupportedOperationException ignored) {
            // Système de fichiers non POSIX (Windows) : permissions ignorées.
        }
    }

    /**
     * Génère une nouvelle paire de clés RSA.
     */
    public void generateNewKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(keySize);
            KeyPair newKeyPair = keyPairGenerator.generateKeyPair();

            // Stocker l'ancienne clé comme précédente pour la validation des tokens en cours de rotation
            this.previousKeyPair = this.currentKeyPair;
            this.currentKeyPair = newKeyPair;
            this.keyGenerationDate = new Date();

            logger.info("Nouvelle paire de clés RSA générée, taille: {} bits", keySize);
        } catch (NoSuchAlgorithmException e) {
            logger.error("Erreur lors de la génération de la paire de clés RSA", e);
            throw new RuntimeException("Impossible de générer la paire de clés RSA", e);
        }
    }

    /**
     * Vérifie si une rotation de clé est nécessaire.
     * 
     * @return true si une rotation est nécessaire
     */
    public boolean isRotationNeeded() {
        if (!rotationEnabled) {
            return false;
        }

        long ageInMillis = new Date().getTime() - keyGenerationDate.getTime();
        long ageInDays = ageInMillis / (1000 * 60 * 60 * 24);

        return ageInDays >= rotationIntervalDays;
    }

    /**
     * Effectue la rotation de clé si nécessaire.
     */
    public void rotateIfNeeded() {
        if (isRotationNeeded()) {
            logger.info("Rotation de clé RSA en cours...");
            generateNewKeyPair();
        }
    }

    /**
     * Obtient la clé publique actuelle au format Base64.
     * 
     * @return la clé publique en Base64
     */
    public String getPublicKey() {
        return Base64.getEncoder().encodeToString(currentKeyPair.getPublic().getEncoded());
    }

    /**
     * Obtient la clé privée actuelle au format Base64.
     * 
     * @return la clé privée en Base64
     */
    public String getPrivateKey() {
        return Base64.getEncoder().encodeToString(currentKeyPair.getPrivate().getEncoded());
    }

    /**
     * Obtient la clé publique précédente au format Base64.
     * 
     * @return la clé publique précédente en Base64
     */
    public String getPreviousPublicKey() {
        return previousKeyPair != null 
            ? Base64.getEncoder().encodeToString(previousKeyPair.getPublic().getEncoded()) 
            : null;
    }

    /**
     * Obtient la clé privée précédente au format Base64.
     * 
     * @return la clé privée précédente en Base64
     */
    public String getPreviousPrivateKey() {
        return previousKeyPair != null 
            ? Base64.getEncoder().encodeToString(previousKeyPair.getPrivate().getEncoded()) 
            : null;
    }

    /**
     * Obtient la paire de clés actuelle.
     * 
     * @return la paire de clés actuelle
     */
    public KeyPair getCurrentKeyPair() {
        return currentKeyPair;
    }

    /**
     * Obtient la paire de clés précédente.
     * 
     * @return la paire de clés précédente
     */
    public KeyPair getPreviousKeyPair() {
        return previousKeyPair;
    }

    /**
     * Obtient la date de génération de la clé actuelle.
     * 
     * @return la date de génération
     */
    public Date getKeyGenerationDate() {
        return keyGenerationDate;
    }

    /**
     * Initialise une paire de clés à partir de clés existantes (pour le démarrage).
     * 
     * @param publicKey la clé publique en Base64
     * @param privateKey la clé privée en Base64
     */
    public void initializeFromKeys(String publicKey, String privateKey) {
        try {
            byte[] publicKeyBytes = Base64.getDecoder().decode(publicKey);
            byte[] privateKeyBytes = Base64.getDecoder().decode(privateKey);

            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
            PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);

            PublicKey pubKey = keyFactory.generatePublic(publicKeySpec);
            PrivateKey privKey = keyFactory.generatePrivate(privateKeySpec);

            this.currentKeyPair = new KeyPair(pubKey, privKey);
            this.keyGenerationDate = new Date();

            logger.info("Paire de clés RSA initialisée à partir de clés existantes");
        } catch (Exception e) {
            logger.error("Erreur lors de l'initialisation de la paire de clés RSA", e);
            throw new RuntimeException("Impossible d'initialiser la paire de clés RSA", e);
        }
    }

    /**
     * Obtient les informations sur la clé actuelle.
     * 
     * @return les informations sur la clé
     */
    public String getKeyInfo() {
        return String.format("RSA Key - Size: %d bits, Generated: %s, Rotation enabled: %s, Interval: %d days",
            keySize,
            keyGenerationDate,
            rotationEnabled,
            rotationIntervalDays);
    }
}
