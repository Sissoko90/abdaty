package com.abdatytch.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Test de chargement du contexte complet.
 *
 * DÉSACTIVÉ par défaut : {@code @SpringBootTest} démarre TOUT le contexte
 * (R2DBC/MySQL, Kafka, Vault…) et requiert donc l'infrastructure en marche. Pour
 * une CI unitaire rapide et déterministe, on s'appuie sur les *ServiceTest /
 * *Test (mocks). À réactiver ponctuellement, infra démarrée, pour valider le
 * câblage Spring (retirer @Disabled).
 */
@Disabled("Nécessite l'infrastructure (MySQL/Kafka/Vault) ; voir le javadoc.")
@SpringBootTest
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
