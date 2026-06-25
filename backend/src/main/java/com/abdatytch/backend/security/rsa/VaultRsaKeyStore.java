package com.abdatytch.backend.security.rsa;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.vault.core.VaultKeyValueOperations;
import org.springframework.vault.core.VaultKeyValueOperationsSupport.KeyValueBackend;
import org.springframework.vault.core.VaultTemplate;
import org.springframework.vault.support.VaultResponse;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Implémentation Vault du {@link SharedRsaKeyStore}.
 *
 * Active UNIQUEMENT quand {@code spring.cloud.vault.enabled=true} : en dev (Vault
 * désactivé), ce bean n'existe pas et {@link RsaKeyService} reste sur le disque
 * local. En prod multi-réplicas, tous les nœuds lisent la MÊME paire depuis Vault.
 *
 * Secret KV stocké à {@code <mount>/<path>} avec les champs {@code public} et
 * {@code private} (Base64). Par défaut KV v2 monté sur {@code secret} (défaut du
 * mode dev de Vault). Mount / version / chemin sont configurables.
 */
@Component
@ConditionalOnProperty(name = "spring.cloud.vault.enabled", havingValue = "true")
public class VaultRsaKeyStore implements SharedRsaKeyStore {

    private static final Logger logger = LoggerFactory.getLogger(VaultRsaKeyStore.class);

    private final VaultTemplate vaultTemplate;

    @Value("${app.security.jwt.rsa.vault.mount:secret}")
    private String mount;

    @Value("${app.security.jwt.rsa.vault.path:abdaty/rsa}")
    private String path;

    @Value("${app.security.jwt.rsa.vault.kv-version:2}")
    private int kvVersion;

    public VaultRsaKeyStore(VaultTemplate vaultTemplate) {
        this.vaultTemplate = vaultTemplate;
    }

    private VaultKeyValueOperations kv() {
        KeyValueBackend backend = (kvVersion == 1) ? KeyValueBackend.KV_1 : KeyValueBackend.KV_2;
        return vaultTemplate.opsForKeyValue(mount, backend);
    }

    @Override
    public Optional<KeyMaterial> load() {
        VaultResponse resp = kv().get(path);
        if (resp == null || resp.getData() == null) {
            return Optional.empty();
        }
        Object pub = resp.getData().get("public");
        Object priv = resp.getData().get("private");
        if (pub == null || priv == null) {
            return Optional.empty();
        }
        return Optional.of(new KeyMaterial(pub.toString(), priv.toString()));
    }

    @Override
    public void save(String publicKeyBase64, String privateKeyBase64) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("public", publicKeyBase64);
        data.put("private", privateKeyBase64);
        kv().put(path, data);
        logger.info("Paire de clés RSA écrite dans Vault : {}/{}", mount, path);
    }
}
