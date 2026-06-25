package com.abdatytch.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * NB scheduling : {@code @EnableScheduling} active les tâches {@code @Scheduled}
 * (newsletters programmées, alertes, collecte de métriques) qui, sans cette
 * annotation, ne s'exécutaient JAMAIS. En déploiement multi-réplicas, protéger
 * chaque tâche par un verrou distribué (ShedLock) pour éviter les doublons.
 *
 * NB transactions : {@code @EnableTransactionManagement} active le support
 * {@code @Transactional} (réactif via R2dbcTransactionManager) pour rendre
 * atomiques les séquences multi-écritures (rotation refresh token, inscription).
 */
@SpringBootApplication
@EnableScheduling
@EnableTransactionManagement
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
