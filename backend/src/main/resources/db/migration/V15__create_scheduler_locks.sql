-- ---------------------------------------------------------------------------
-- Verrou distribué pour les tâches planifiées (@Scheduled).
--
-- En déploiement multi-réplicas, une seule instance doit exécuter chaque tâche
-- (envoi des newsletters, évaluation des alertes, collecte des métriques) afin
-- d'éviter les doublons. L'acquisition est atomique côté base (cf.
-- ReactiveDistributedLock) ; le verrou expire (locked_until) pour survivre au
-- crash d'une instance.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduler_locks (
    lock_name    VARCHAR(100) NOT NULL,
    locked_until TIMESTAMP    NOT NULL,
    locked_by    VARCHAR(150),
    PRIMARY KEY (lock_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
