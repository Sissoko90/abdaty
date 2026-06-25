package com.abdatytch.backend.scheduler;

import com.abdatytch.backend.service.impl.NewsletterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler d'envoi des campagnes newsletter programmées.
 * Vérifie périodiquement les campagnes dont la date d'envoi est atteinte.
 */
@Component
public class NewsletterScheduler {

    private static final Logger logger = LoggerFactory.getLogger(NewsletterScheduler.class);

    private final NewsletterService newsletterService;
    private final ReactiveDistributedLock lock;

    public NewsletterScheduler(NewsletterService newsletterService, ReactiveDistributedLock lock) {
        this.newsletterService = newsletterService;
        this.lock = lock;
    }

    /** Toutes les minutes : envoie les campagnes programmées arrivées à échéance.
     *  Protégé par un verrou distribué : une seule instance l'exécute par tick. */
    @Scheduled(fixedRate = 60000)
    public void dispatchScheduledCampaigns() {
        lock.tryAcquire("newsletter-dispatch", java.time.Duration.ofSeconds(55))
            .filter(Boolean::booleanValue)
            .flatMap(acquired -> newsletterService.processScheduledCampaigns())
            .subscribe(
                count -> {
                    if (count > 0) logger.info("Newsletter : {} campagne(s) programmée(s) envoyée(s)", count);
                },
                error -> logger.error("Erreur lors de l'envoi des campagnes programmées", error)
            );
    }
}
