-- ============================================================================
-- Table : media (Médias / fichiers uploadés)
-- Base  : MySQL (R2DBC). À appliquer manuellement sur abdatydb.
--
-- Le binaire est stocké sur le disque (uploads/<media_domain>/<filename>) ;
-- seule l'URL relative est conservée ici. Colonnes communes BaseEntity incluses.
-- ============================================================================

CREATE TABLE IF NOT EXISTS media (
    id                 VARCHAR(36)  NOT NULL,
    filename           VARCHAR(255) NOT NULL,
    original_filename  VARCHAR(255) NOT NULL,
    file_type          VARCHAR(100),
    file_size          BIGINT,
    url                VARCHAR(500) NOT NULL,
    thumbnail_url      VARCHAR(500),
    uploaded_by        VARCHAR(36),
    media_domain       VARCHAR(100) NOT NULL DEFAULT 'general',
    -- Colonnes communes BaseEntity
    version            BIGINT       NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_media_domain ON media (media_domain);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media (created_at);
