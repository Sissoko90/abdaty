-- ============================================================================
-- Table : site_content (Contenu éditorial UNIFIÉ et multilingue)
-- Base  : MySQL (R2DBC). À appliquer manuellement sur abdatydb.
--
-- Optimisation : une seule table pour TOUT le contenu du site (hero, services,
-- témoignages, FAQ, footer, about, contact, sla, partners...) au lieu d'une
-- table par section. Chaque ligne = un bloc identifié par (section, content_key),
-- avec ses traductions value_fr / value_en.
--
-- content_type indique l'interprétation de la valeur : 'text', 'html', 'image'
-- (URL), 'json' (bloc structuré), 'number', 'boolean'.
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_content (
    id             VARCHAR(36)  NOT NULL,
    section        VARCHAR(100) NOT NULL,
    content_key    VARCHAR(150) NOT NULL,
    value_fr       TEXT,
    value_en       TEXT,
    content_type   VARCHAR(20)  NOT NULL DEFAULT 'text',
    display_order  INT          NOT NULL DEFAULT 0,
    active         BOOLEAN   NOT NULL DEFAULT TRUE,
    -- Colonnes communes BaseEntity
    version        BIGINT       NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_site_content_section_key UNIQUE (section, content_key)
);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content (section);
CREATE INDEX IF NOT EXISTS idx_site_content_active ON site_content (active);
CREATE INDEX IF NOT EXISTS idx_site_content_display_order ON site_content (display_order);
