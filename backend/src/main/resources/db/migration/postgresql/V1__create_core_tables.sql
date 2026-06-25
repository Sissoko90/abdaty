-- ============================================================================
-- Tables de base (cœur du backend Abdaty) — MySQL (R2DBC)
-- À appliquer sur la base abdatydb AVANT les scripts V2 → V8.
--
-- Toutes les entités héritent de BaseEntity : colonnes communes
--   id, version, status, created_at, updated_at.
-- L'identifiant est généré côté base via car l'application
-- sauvegarde les entités sans renseigner l'id.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- users (utilisateurs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(36)  NOT NULL,
    username      VARCHAR(100),
    email         VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    phone_number  VARCHAR(30),
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    version       BIGINT       NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_phone UNIQUE (phone_number)
);

-- ---------------------------------------------------------------------------
-- refresh_tokens (jetons de rafraîchissement)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id            VARCHAR(36)  NOT NULL,
    token         VARCHAR(1024) NOT NULL,
    user_id       VARCHAR(36)  NOT NULL,
    expires_at    TIMESTAMP    NULL,
    revoked       BOOLEAN   NOT NULL DEFAULT FALSE,
    version       BIGINT       NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- ---------------------------------------------------------------------------
-- verification_codes (codes de validation email / réinitialisation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_codes (
    id            VARCHAR(36)  NOT NULL,
    code          VARCHAR(20)  NOT NULL,
    email         VARCHAR(255) NOT NULL,
    type          VARCHAR(30)  NOT NULL,
    -- REGISTRATION | LOGIN | PASSWORD_RESET | EMAIL_CHANGE
    expires_at    TIMESTAMP    NULL,
    used          BOOLEAN   NOT NULL DEFAULT FALSE,
    version       BIGINT       NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes (email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes (code);

-- ---------------------------------------------------------------------------
-- suspicious_ips (IPs suspectes) — interrogée par le filtre de sécurité
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suspicious_ips (
    id               VARCHAR(36)  NOT NULL,
    ip_address       VARCHAR(45)  NOT NULL,
    city             VARCHAR(100),
    region           VARCHAR(100),
    country          VARCHAR(100),
    country_code     VARCHAR(10),
    latitude         DOUBLE PRECISION,
    longitude        DOUBLE PRECISION,
    isp              VARCHAR(255),
    threat_level     VARCHAR(20),
    attempt_count    BIGINT       DEFAULT 0,
    last_attempt     TIMESTAMP    NULL,
    block_status     VARCHAR(20),
    suspicion_reason VARCHAR(255),
    details          TEXT,
    version          BIGINT       NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_suspicious_ips_ip ON suspicious_ips (ip_address);
CREATE INDEX IF NOT EXISTS idx_suspicious_ips_block_status ON suspicious_ips (block_status);
CREATE INDEX IF NOT EXISTS idx_suspicious_ips_threat_level ON suspicious_ips (threat_level);

-- ---------------------------------------------------------------------------
-- geo_blocking (blocage par pays / continent)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS geo_blocking (
    id              VARCHAR(36)  NOT NULL,
    country_code    VARCHAR(10),
    country_name    VARCHAR(100),
    continent_code  VARCHAR(10),
    continent_name  VARCHAR(100),
    access_status   VARCHAR(20)  DEFAULT 'ALLOWED',
    threat_score    INT          DEFAULT 0,
    request_count   BIGINT       DEFAULT 0,
    flag_emoji      VARCHAR(16),
    version         BIGINT       NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_geo_blocking_country_code ON geo_blocking (country_code);
CREATE INDEX IF NOT EXISTS idx_geo_blocking_continent_code ON geo_blocking (continent_code);
CREATE INDEX IF NOT EXISTS idx_geo_blocking_access_status ON geo_blocking (access_status);

-- ---------------------------------------------------------------------------
-- analytics_data (analytics géolocalisées) — voir aussi le script d'index
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_data (
    id                VARCHAR(36)  NOT NULL,
    ip_address        VARCHAR(45),
    user_agent        TEXT,
    geo_location      TEXT,
    device_info       TEXT,
    user_id           VARCHAR(36),
    request_path      VARCHAR(512),
    request_method    VARCHAR(10),
    referer           VARCHAR(512),
    device_type       VARCHAR(50),
    browser_name      VARCHAR(100),
    browser_version   VARCHAR(50),
    os_name           VARCHAR(100),
    os_version        VARCHAR(50),
    country           VARCHAR(100),
    country_iso_code  VARCHAR(10),
    region            VARCHAR(100),
    city              VARCHAR(100),
    isp               VARCHAR(255),
    asn               INT,
    version           BIGINT       NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ---------------------------------------------------------------------------
-- alert_rules (règles d'alerte sur métriques)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_rules (
    id                     VARCHAR(36)  NOT NULL,
    name                   VARCHAR(150),
    description            VARCHAR(500),
    metric_type            VARCHAR(50),
    threshold              DOUBLE PRECISION,
    operator               VARCHAR(20),
    duration               INT,
    notification_channels  VARCHAR(255),
    recipients             TEXT,
    rule_status            VARCHAR(20),
    last_triggered         TIMESTAMP    NULL,
    trigger_count          BIGINT       DEFAULT 0,
    cooldown_minutes       INT,
    version                BIGINT       NULL,
    status                 VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ---------------------------------------------------------------------------
-- time_series_metrics (métriques temporelles système)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS time_series_metrics (
    id                    VARCHAR(36)  NOT NULL,
    timestamp             TIMESTAMP    NULL,
    cpu_usage             DOUBLE PRECISION,
    memory_usage          DOUBLE PRECISION,
    disk_usage            DOUBLE PRECISION,
    api_requests          BIGINT,
    error_rate            DOUBLE PRECISION,
    avg_response_time     BIGINT,
    active_users          BIGINT,
    sms_sent              BIGINT,
    server_availability   DOUBLE PRECISION,
    version               BIGINT       NULL,
    status                VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_time_series_metrics_timestamp ON time_series_metrics (timestamp);
