-- ============================================================================
-- Table : documentation (Entrées de documentation, hiérarchiques)
-- Base  : MySQL (R2DBC). À appliquer manuellement sur `abdatydb`.
--
-- parent_id référence documentation.id (auto-référence) pour l'arborescence.
-- Colonnes communes BaseEntity : id, version, status, created_at, updated_at.
-- ============================================================================

CREATE TABLE IF NOT EXISTS documentation (
    id             VARCHAR(36)  NOT NULL,
    title_fr       VARCHAR(255) NOT NULL,
    title_en       VARCHAR(255) NOT NULL,
    slug           VARCHAR(255) NOT NULL,
    content_fr     LONGTEXT,
    content_en     LONGTEXT,
    parent_id      VARCHAR(36)  NULL,
    display_order  INT          NOT NULL DEFAULT 0,
    active         TINYINT(1)   NOT NULL DEFAULT 1,
    -- Colonnes communes BaseEntity
    version        BIGINT       NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_documentation_slug (slug),
    KEY idx_documentation_parent_id (parent_id),
    KEY idx_documentation_active (active),
    KEY idx_documentation_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
