-- ============================================================================
-- Table : cookie_consents (Consentements cookies des visiteurs + analytics)
-- Base  : MySQL (R2DBC). Idempotent. Colonnes communes BaseEntity incluses.
-- ============================================================================

CREATE TABLE IF NOT EXISTS cookie_consents (
    id            VARCHAR(36)  NOT NULL,
    -- Identifiant visiteur (UUID généré côté navigateur, stocké en localStorage).
    visitor_id    VARCHAR(64)  NOT NULL,
    necessary     TINYINT(1)   NOT NULL DEFAULT 1,  -- toujours vrai (cookies essentiels)
    analytics     TINYINT(1)   NOT NULL DEFAULT 0,
    marketing     TINYINT(1)   NOT NULL DEFAULT 0,
    preferences   TINYINT(1)   NOT NULL DEFAULT 0,
    ip_address    VARCHAR(64)  NULL,
    user_agent    VARCHAR(512) NULL,
    locale        VARCHAR(8)   NULL,
    page          VARCHAR(512) NULL,
    version       BIGINT       NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_cookie_consents_visitor (visitor_id),
    KEY idx_cookie_consents_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
