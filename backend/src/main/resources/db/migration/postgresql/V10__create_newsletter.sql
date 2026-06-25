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
    subscribed         BOOLEAN   NOT NULL DEFAULT TRUE,
    -- jeton opaque pour le lien de désinscription public.
    unsubscribe_token  VARCHAR(64)  NOT NULL,
    -- origine de l'inscription (ex: "footer", "home", "import").
    source             VARCHAR(50)  NULL,
    version            BIGINT       NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_newsletter_subscribers_email UNIQUE (email),
    CONSTRAINT uk_newsletter_subscribers_token UNIQUE (unsubscribe_token)
);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed ON newsletter_subscribers (subscribed);

-- Campagnes (emails) ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id               VARCHAR(36)  NOT NULL,
    subject          VARCHAR(255) NOT NULL,
    content_html     TEXT   NOT NULL,
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
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns (campaign_status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled ON newsletter_campaigns (scheduled_at);

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
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_campaign ON newsletter_events (campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_type ON newsletter_events (campaign_id, event_type);
