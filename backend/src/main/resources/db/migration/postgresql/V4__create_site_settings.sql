-- ============================================================================
-- Table : site_settings (Paramètres de configuration du site, clé/valeur)
-- Base  : MySQL (R2DBC). À appliquer manuellement sur abdatydb.
--
-- Les colonnes utilisent le préfixe setting_ pour éviter les mots réservés
-- MySQL (key, value). Colonnes communes BaseEntity incluses.
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
    id             VARCHAR(36)  NOT NULL,
    setting_key    VARCHAR(100) NOT NULL,
    setting_value  TEXT,
    setting_type   VARCHAR(50)  DEFAULT 'string',
    -- 'string' | 'number' | 'boolean' | 'json'
    category       VARCHAR(50),
    -- 'general' | 'seo' | 'social' | 'theme'
    -- Colonnes communes BaseEntity
    version        BIGINT       NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_site_settings_key UNIQUE (setting_key)
);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings (category);
