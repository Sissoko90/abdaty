-- ============================================================================
-- Table : contact_messages (Messages reçus via le formulaire de contact)
-- Base  : MySQL (R2DBC). Idempotent. Colonnes communes BaseEntity incluses.
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id          VARCHAR(36)  NOT NULL,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    company     VARCHAR(255) NULL,
    phone       VARCHAR(64)  NULL,
    service     VARCHAR(255) NULL,
    message     TEXT         NOT NULL,
    ip_address  VARCHAR(64)  NULL,
    is_read     BOOLEAN   NOT NULL DEFAULT FALSE,
    version     BIGINT       NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages (is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at);
