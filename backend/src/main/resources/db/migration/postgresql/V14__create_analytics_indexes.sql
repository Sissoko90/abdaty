-- ---------------------------------------------------------------------------
-- Index pour optimiser les requêtes analytics.
--
-- NB MySQL : CREATE INDEX IF NOT EXISTS N'EST PAS supporté (uniquement
-- MariaDB/Postgres). On utilise donc un CREATE INDEX simple ; comme
-- spring.sql.init s'exécute à chaque démarrage (mode=always), l'erreur
-- « Duplicate key name » au 2e passage est absorbée par continue-on-error: true.
-- La solution propre reste Flyway/Liquibase (versionnement + exécution unique).
-- ---------------------------------------------------------------------------

-- Filtres simples les plus fréquents
CREATE INDEX idx_analytics_data_ip_address ON analytics_data (ip_address);
CREATE INDEX idx_analytics_data_country ON analytics_data (country);
CREATE INDEX idx_analytics_data_device_type ON analytics_data (device_type);
CREATE INDEX idx_analytics_data_browser_name ON analytics_data (browser_name);
CREATE INDEX idx_analytics_data_os_name ON analytics_data (os_name);
CREATE INDEX idx_analytics_data_user_id ON analytics_data (user_id);
CREATE INDEX idx_analytics_data_region ON analytics_data (region);
CREATE INDEX idx_analytics_data_request_path ON analytics_data (request_path);

-- Filtre temporel (rapports par période) — clé des agrégations
CREATE INDEX idx_analytics_data_created_at ON analytics_data (created_at);

-- Index composés (dimension + date) pour les rapports croisés fréquents
CREATE INDEX idx_analytics_data_country_created ON analytics_data (country, created_at);
CREATE INDEX idx_analytics_data_device_created ON analytics_data (device_type, created_at);
CREATE INDEX idx_analytics_data_user_created ON analytics_data (user_id, created_at);
