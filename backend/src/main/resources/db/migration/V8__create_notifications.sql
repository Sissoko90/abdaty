-- ============================================================================
-- Table : notifications (Notifications utilisateur)
-- Base  : MySQL (R2DBC). À appliquer manuellement sur `abdatydb`.
--
-- La colonne « lu » est nommée is_read pour éviter le mot réservé MySQL `read`.
-- Colonnes communes BaseEntity incluses.
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id          VARCHAR(36)  NOT NULL,
    user_id     VARCHAR(36)  NOT NULL,
    type        VARCHAR(50)  NOT NULL DEFAULT 'info',  -- success | info | warning | error
    title       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    link        VARCHAR(255),
    is_read     TINYINT(1)   NOT NULL DEFAULT 0,
    -- Colonnes communes BaseEntity
    version     BIGINT       NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notifications_user_id (user_id),
    KEY idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
