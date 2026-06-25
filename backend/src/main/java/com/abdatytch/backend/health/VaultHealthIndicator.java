package com.abdatytch.backend.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.ReactiveHealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.vault.core.VaultTemplate;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * Indicateur de santé de Vault, intégré à l'agrégat Actuator
 * (/actuator/health → composant « vault »).
 *
 * Quand Vault est désactivé (dev), aucun {@link VaultTemplate} n'est présent : on
 * remonte alors le statut « disabled » (UP, sans appel). Quand il est activé, on
 * interroge réellement l'état du serveur (appel bloquant déporté sur boundedElastic).
 */
@Component
public class VaultHealthIndicator implements ReactiveHealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(VaultHealthIndicator.class);

    private final ObjectProvider<VaultTemplate> vaultTemplate;

    public VaultHealthIndicator(ObjectProvider<VaultTemplate> vaultTemplate) {
        this.vaultTemplate = vaultTemplate;
    }

    @Override
    public Mono<Health> health() {
        VaultTemplate template = vaultTemplate.getIfAvailable();
        if (template == null) {
            return Mono.just(Health.up().withDetail("vault", "disabled").build());
        }
        return Mono.fromCallable(() -> {
            try {
                var status = template.opsForSys().health();
                boolean ok = status != null && status.isInitialized() && !status.isSealed();
                return (ok ? Health.up() : Health.down())
                    .withDetail("vault", ok ? "Connected" : "sealed/uninitialized").build();
            } catch (Exception e) {
                logger.warn("Vault health check failed: {}", e.getMessage());
                return Health.down(e).withDetail("vault", "unreachable").build();
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
