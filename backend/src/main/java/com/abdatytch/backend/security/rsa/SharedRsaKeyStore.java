package com.abdatytch.backend.security.rsa;

import java.util.Optional;

/**
 * Store PARTAGÉ pour la paire de clés RSA de signature JWT.
 *
 * En déploiement multi-réplicas, tous les nœuds DOIVENT signer/valider avec la
 * même paire de clés ; sinon un token émis par le réplica A est rejeté par le
 * réplica B (« JWT signature does not match »). Cette abstraction permet de
 * stocker la paire dans une source partagée (Vault) plutôt qu'en disque local.
 *
 * Quand aucune implémentation n'est présente (ex. Vault désactivé en dev),
 * {@link RsaKeyService} retombe sur la persistance disque locale (mono-instance).
 */
public interface SharedRsaKeyStore {

    /** Paire de clés au format Base64 (clé publique + clé privée X.509/PKCS8). */
    record KeyMaterial(String publicKeyBase64, String privateKeyBase64) {}

    /** Charge la paire partagée si elle existe déjà. */
    Optional<KeyMaterial> load();

    /** Persiste la paire dans le store partagé (première initialisation / rotation). */
    void save(String publicKeyBase64, String privateKeyBase64);
}
