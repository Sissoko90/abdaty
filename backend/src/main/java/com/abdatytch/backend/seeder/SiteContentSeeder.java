package com.abdatytch.backend.seeder;

import com.abdatytch.backend.entity.SiteContent;
import com.abdatytch.backend.repository.SiteContentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Seeder du contenu éditorial du site vitrine.
 *
 * Au démarrage, lit le fichier de ressources {@code seed/site-content.json}
 * (généré depuis les fichiers i18n) et insère chaque bloc dans la table
 * {@code site_content} de façon IDEMPOTENTE : un bloc déjà présent
 * (même section + clé) n'est pas ré-inséré, ce qui préserve les modifications
 * faites depuis l'administration.
 *
 * Activable/désactivable via {@code content.seeder.enabled} (défaut true).
 */
@Component
public class SiteContentSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(SiteContentSeeder.class);

    private final SiteContentRepository siteContentRepository;
    private final ObjectMapper objectMapper;

    @Value("${content.seeder.enabled:true}")
    private boolean enabled;

    @Value("classpath:seed/site-content.json")
    private Resource seedResource;

    @Autowired
    public SiteContentSeeder(SiteContentRepository siteContentRepository, ObjectMapper objectMapper) {
        this.siteContentRepository = siteContentRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        if (!enabled) {
            logger.info("Seeder de contenu désactivé (content.seeder.enabled=false)");
            return;
        }
        if (seedResource == null || !seedResource.exists()) {
            logger.warn("Fichier de seed du contenu introuvable, seeding ignoré");
            return;
        }

        logger.info("Vérification du contenu éditorial du site...");

        final JsonNode root;
        try {
            root = objectMapper.readTree(seedResource.getInputStream());
        } catch (Exception e) {
            logger.error("Impossible de lire le fichier de seed du contenu", e);
            return;
        }
        if (root == null || !root.isArray()) {
            logger.warn("Fichier de seed du contenu vide ou mal formé");
            return;
        }

        // Sections de type LISTE déjà personnalisées par l'admin (au moins un
        // bloc « item-* » présent). On NE réinjecte PAS d'items dans ces sections,
        // afin de respecter les ajouts/suppressions faits depuis l'admin (sinon un
        // item supprimé réapparaîtrait à chaque redémarrage).
        siteContentRepository.findAll()
            .filter(c -> c.getContentKey() != null && c.getContentKey().startsWith("item-")
                    && c.getSection() != null)
            .map(c -> c.getSection())
            .collect(java.util.stream.Collectors.toSet())
            .flatMapMany(customizedListSections ->
                Flux.fromIterable(root).flatMap(node -> seedBlock(node, customizedListSections)))
            .count()
            .subscribe(
                inserted -> logger.info("Seeder de contenu terminé : {} bloc(s) inséré(s)", inserted),
                error -> logger.error("Erreur lors du seeding du contenu", error)
            );
    }

    /** Insère un bloc s'il n'existe pas encore (idempotent). Renvoie 1 si inséré.
     *  Les items (item-*) d'une section liste déjà personnalisée sont ignorés. */
    private Mono<Integer> seedBlock(JsonNode node, java.util.Set<String> customizedListSections) {
        String section = node.path("section").asText(null);
        String earlyKey = node.path("contentKey").asText(null);
        if (earlyKey != null && earlyKey.startsWith("item-")
                && section != null && customizedListSections.contains(section)) {
            return Mono.empty();
        }
        String contentKey = node.path("contentKey").asText(null);
        if (section == null || contentKey == null) {
            return Mono.empty();
        }

        return siteContentRepository.existsBySectionAndContentKey(section, contentKey)
            .flatMap(exists -> {
                if (Boolean.TRUE.equals(exists)) {
                    return Mono.empty();
                }
                SiteContent entity = new SiteContent();
                entity.setSection(section);
                entity.setContentKey(contentKey);
                entity.setValueFr(asValue(node.get("valueFr")));
                entity.setValueEn(asValue(node.get("valueEn")));
                entity.setContentType(node.path("contentType").asText("text"));
                entity.setDisplayOrder(node.path("displayOrder").asInt(0));
                entity.setActive(node.path("active").asBoolean(true));
                return siteContentRepository.save(entity).thenReturn(1);
            });
    }

    /**
     * Convertit une valeur JSON en chaîne à stocker :
     *  - valeur scalaire (texte) -> texte brut ;
     *  - objet / tableau -> JSON compact (pour les blocs structurés type liste).
     */
    private String asValue(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return node.isValueNode() ? node.asText() : node.toString();
    }
}
