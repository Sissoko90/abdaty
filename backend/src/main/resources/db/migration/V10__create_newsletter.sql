-- ============================================================================
-- Domaine NEWSLETTER : abonnés, campagnes, événements de suivi (ouvertures/clics)
-- Base : MySQL (R2DBC). Idempotent (CREATE TABLE IF NOT EXISTS).
-- Colonnes communes BaseEntity incluses (id, version, status, created_at, updated_at).
-- ============================================================================

-- Abonnés à la newsletter -----------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id                 VARCHAR(36)  NOT NULL,
    email              VARCHAR(255) NOT NULL,
    name               VARCHAR(255) NULL,
    locale             VARCHAR(8)   NOT NULL DEFAULT 'fr',
    -- subscribed = abonné actif. false => désactivé / désinscrit.
    subscribed         TINYINT(1)   NOT NULL DEFAULT 1,
    -- jeton opaque pour le lien de désinscription public.
    unsubscribe_token  VARCHAR(64)  NOT NULL,
    -- origine de l'inscription (ex: "footer", "home", "import").
    source             VARCHAR(50)  NULL,
    version            BIGINT       NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_newsletter_subscribers_email (email),
    UNIQUE KEY uk_newsletter_subscribers_token (unsubscribe_token),
    KEY idx_newsletter_subscribers_subscribed (subscribed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campagnes (emails) ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id               VARCHAR(36)  NOT NULL,
    subject          VARCHAR(255) NOT NULL,
    content_html     MEDIUMTEXT   NOT NULL,
    -- DRAFT | SCHEDULED | SENDING | SENT | FAILED
    campaign_status  VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    -- date d'envoi programmé (NULL si envoi immédiat / brouillon).
    scheduled_at     TIMESTAMP    NULL,
    sent_at          TIMESTAMP    NULL,
    recipient_count  INT          NOT NULL DEFAULT 0,
    sent_count       INT          NOT NULL DEFAULT 0,
    open_count       INT          NOT NULL DEFAULT 0,
    click_count      INT          NOT NULL DEFAULT 0,
    version          BIGINT       NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_newsletter_campaigns_status (campaign_status),
    KEY idx_newsletter_campaigns_scheduled (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Événements de suivi (envoi / ouverture / clic) ------------------------------
CREATE TABLE IF NOT EXISTS newsletter_events (
    id             VARCHAR(36)  NOT NULL,
    campaign_id    VARCHAR(36)  NOT NULL,
    subscriber_id  VARCHAR(36)  NOT NULL,
    -- SENT | OPEN | CLICK
    event_type     VARCHAR(20)  NOT NULL,
    -- URL cliquée (pour CLICK uniquement).
    url            VARCHAR(1024) NULL,
    ip_address     VARCHAR(64)  NULL,
    version        BIGINT       NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_newsletter_events_campaign (campaign_id),
    KEY idx_newsletter_events_type (campaign_id, event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
