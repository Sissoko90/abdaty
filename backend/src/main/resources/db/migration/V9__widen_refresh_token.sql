-- ============================================================================
-- Élargit la colonne refresh_tokens.token : un JWT signé RSA 2048 dépasse
-- 512 caractères. VARCHAR(1024) laisse une marge confortable.
--
-- Idempotent : ré-exécuter ce MODIFY sur une colonne déjà en VARCHAR(1024)
-- est sans effet (l'init SQL est en continue-on-error).
-- ============================================================================

ALTER TABLE refresh_tokens MODIFY token VARCHAR(1024) NOT NULL;
