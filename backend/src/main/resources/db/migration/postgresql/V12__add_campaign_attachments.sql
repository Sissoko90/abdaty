-- ============================================================================
-- Ajoute la colonne attachments aux campagnes newsletter : pièces jointes
-- (PDF, CSV, etc.) stockées en JSON [{"url":"...","filename":"..."}].
-- (spring.sql.init continue-on-error: true => l'erreur « colonne déjà présente »
--  au redémarrage est ignorée sans bloquer.)
-- ============================================================================

ALTER TABLE newsletter_campaigns ADD COLUMN attachments TEXT NULL;
