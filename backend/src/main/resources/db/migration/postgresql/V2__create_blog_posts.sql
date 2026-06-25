-- ============================================================================
-- Table : blog_posts (Articles de blog)
-- Base  : MySQL (R2DBC). À appliquer manuellement sur la base abdatydb
--         (le projet n'utilise pas Flyway/Liquibase pour le moment).
--
-- Convention du projet (BaseEntity) : chaque table porte les colonnes communes
-- id, created_at, updated_at, version, status. L'identifiant est généré côté
-- base via, car le code applicatif sauvegarde les entités
-- sans renseigner l'id (insertion -> id null -> valeur par défaut).
--
-- Le statut éditorial (draft/published) est porté par post_status afin de ne
-- pas entrer en conflit avec la colonne status (cycle de vie BaseEntity).
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id              VARCHAR(36)  NOT NULL,
    title_fr        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    excerpt_fr      TEXT,
    excerpt_en      TEXT,
    content_fr      TEXT,
    content_en      TEXT,
    author_id       VARCHAR(36),
    category        VARCHAR(100),
    tags            TEXT,
    -- liste de tags séparés par des virgules
    featured_image  VARCHAR(255),
    post_status     VARCHAR(20)  NOT NULL DEFAULT 'draft',
    -- 'draft' | 'published'
    published_at    TIMESTAMP    NULL,
    -- Colonnes communes BaseEntity
    version         BIGINT       NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_blog_posts_slug UNIQUE (slug)
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_post_status ON blog_posts (post_status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at);
