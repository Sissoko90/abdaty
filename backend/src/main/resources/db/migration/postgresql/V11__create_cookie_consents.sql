-- ============================================================================
-- Table : cookie_consents (Consentements cookies des visiteurs + analytics)
-- Base  : MySQL (R2DBC). Idempotent. Colonnes communes BaseEntity incluses.
-- ============================================================================

CREATE TABLE IF NOT EXISTS cookie_consents (
    id            VARCHAR(36)  NOT NULL,
    -- Identifiant visiteur (UUID généré côté navigateur, stocké en localStorage).
    visitor_id    VARCHAR(64)  NOT NULL,
    necessary     BOOLEAN   NOT NULL DEFAULT TRUE,
    -- toujours vrai (cookies essentiels)
    analytics     BOOLEAN   NOT NULL DEFAULT FALSE,
    marketing     BOOLEAN   NOT NULL DEFAULT FALSE,
    preferences   BOOLEAN   NOT NULL DEFAULT FALSE,
    ip_address    VARCHAR(64)  NULL,
    user_agent    VARCHAR(512) NULL,
    locale        VARCHAR(8)   NULL,
    page          VARCHAR(512) NULL,
    version       BIGINT       NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_visitor ON cookie_consents (visitor_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_created ON cookie_consents (created_at);
