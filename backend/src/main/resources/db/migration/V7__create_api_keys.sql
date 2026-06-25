-- ============================================================================
-- Table : api_keys (Clés API des utilisateurs)
-- Base  : MySQL (R2DBC). À appliquer manuellement sur `abdatydb`.
--
-- Sécurité : seul le hash SHA-256 de la clé est conservé (key_hash) ainsi qu'un
-- préfixe d'affichage (key_prefix). La clé en clair n'est jamais stockée.
-- Le statut éditorial est porté par key_status ('active' | 'revoked').
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id            VARCHAR(36)  NOT NULL,
    user_id       VARCHAR(36)  NOT NULL,
    key_hash      VARCHAR(255) NOT NULL,
    key_prefix    VARCHAR(32),
    name          VARCHAR(100),
    permissions   TEXT,                       -- permissions séparées par des virgules
    rate_limit    INT          NOT NULL DEFAULT 1000,
    key_status    VARCHAR(20)  NOT NULL DEFAULT 'active',  -- 'active' | 'revoked'
    last_used_at  TIMESTAMP    NULL,
    expires_at    TIMESTAMP    NULL,
    -- Colonnes communes BaseEntity
    version       BIGINT       NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_api_keys_user_id (user_id),
    KEY idx_api_keys_key_status (key_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
