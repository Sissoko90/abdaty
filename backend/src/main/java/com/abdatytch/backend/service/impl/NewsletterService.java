package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.dto.request.NewsletterCampaignRequestDTO;
import com.abdatytch.backend.dto.request.NewsletterSubscribeRequestDTO;
import com.abdatytch.backend.dto.response.NewsletterCampaignDTO;
import com.abdatytch.backend.dto.response.NewsletterStatsDTO;
import com.abdatytch.backend.dto.response.NewsletterSubscriberDTO;
import com.abdatytch.backend.entity.NewsletterCampaign;
import com.abdatytch.backend.entity.NewsletterEvent;
import com.abdatytch.backend.entity.NewsletterSubscriber;
import com.abdatytch.backend.repository.NewsletterCampaignRepository;
import com.abdatytch.backend.repository.NewsletterEventRepository;
import com.abdatytch.backend.repository.NewsletterSubscriberRepository;
import com.abdatytch.backend.service.IEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service métier de la newsletter : inscription des abonnés, gestion des
 * campagnes, envoi (immédiat ou programmé) avec suivi des ouvertures (pixel)
 * et des clics (réécriture des liens), et agrégation des statistiques.
 */
@Service
public class NewsletterService {

    private static final Logger logger = LoggerFactory.getLogger(NewsletterService.class);

    private static final String EVENT_SENT = "SENT";
    private static final String EVENT_OPEN = "OPEN";
    private static final String EVENT_CLICK = "CLICK";

    /** Détecte les liens href="http..." pour les réécrire en liens trackés. */
    private static final Pattern HREF_PATTERN = Pattern.compile("href=\"(https?://[^\"]+)\"", Pattern.CASE_INSENSITIVE);

    /** Détecte les attributs src="..." (images du contenu) pour l'embarquement inline. */
    private static final Pattern IMG_SRC_PATTERN = Pattern.compile("src=\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);

    private final NewsletterSubscriberRepository subscriberRepository;
    private final NewsletterCampaignRepository campaignRepository;
    private final NewsletterEventRepository eventRepository;
    private final IEmailService emailService;

    /** URL publique de base du backend (pour les liens de suivi dans les emails). */
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.api.prefix:/api}")
    private String apiPrefix;

    @Value("${app.api.version:v1}")
    private String apiVersion;

    /** URL publique du site (pour le lien de désinscription). */
    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /** Répertoire de stockage des médias (pour résoudre les pièces jointes). */
    @Value("${app.media.upload-dir:uploads}")
    private String uploadDir;

    /** Préfixe public des fichiers servis (ex: /uploads). */
    @Value("${app.media.public-base-url:/uploads}")
    private String publicBaseUrl;

    /** Nombre d'emails envoyés en parallèle (borne la charge SMTP/mémoire). */
    @Value("${app.newsletter.send-concurrency:10}")
    private int sendConcurrency;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public NewsletterService(NewsletterSubscriberRepository subscriberRepository,
                             NewsletterCampaignRepository campaignRepository,
                             NewsletterEventRepository eventRepository,
                             IEmailService emailService,
                             com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.subscriberRepository = subscriberRepository;
        this.campaignRepository = campaignRepository;
        this.eventRepository = eventRepository;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
    }

    /** Sérialise une liste de pièces jointes en JSON (null si vide). */
    private String serializeAttachments(java.util.List<com.abdatytch.backend.dto.NewsletterAttachmentDTO> list) {
        if (list == null || list.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            logger.warn("Sérialisation des pièces jointes impossible : {}", e.getMessage());
            return null;
        }
    }

    /** Désérialise les pièces jointes JSON d'une campagne. */
    private java.util.List<com.abdatytch.backend.dto.NewsletterAttachmentDTO> parseAttachments(String json) {
        if (json == null || json.isBlank()) return java.util.Collections.emptyList();
        try {
            return objectMapper.readValue(json,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<com.abdatytch.backend.dto.NewsletterAttachmentDTO>>() {});
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    /** Résout l'URL publique d'une pièce jointe (/uploads/...) vers une ressource fichier. */
    private org.springframework.core.io.Resource resolveAttachment(String url) {
        if (url == null) return null;
        String rel = url.startsWith(publicBaseUrl) ? url.substring(publicBaseUrl.length()) : url;
        rel = rel.replaceFirst("^/+", "");
        java.nio.file.Path base = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
        java.nio.file.Path file = base.resolve(rel).normalize();
        // Garde-fou : reste dans le répertoire d'upload.
        if (!file.startsWith(base) || !java.nio.file.Files.exists(file)) return null;
        return new org.springframework.core.io.FileSystemResource(file);
    }

    private String apiBase() {
        return baseUrl + apiPrefix + "/" + apiVersion + "/newsletter";
    }

    /* ========================= ABONNÉS ========================= */

    /**
     * Inscrit un email. S'il existe déjà, le réactive (idempotent).
     */
    public Mono<NewsletterSubscriber> subscribe(NewsletterSubscribeRequestDTO dto, String source) {
        String email = dto.getEmail().trim().toLowerCase();
        return subscriberRepository.findByEmail(email)
            .flatMap(existing -> {
                existing.setSubscribed(true);
                if (dto.getName() != null && !dto.getName().isBlank()) existing.setName(dto.getName());
                if (dto.getLocale() != null) existing.setLocale(dto.getLocale());
                return subscriberRepository.save(existing);
            })
            .switchIfEmpty(Mono.defer(() -> {
                NewsletterSubscriber s = new NewsletterSubscriber();
                s.setEmail(email);
                s.setName(dto.getName());
                if (dto.getLocale() != null) s.setLocale(dto.getLocale());
                s.setSource(source != null ? source : dto.getSource());
                return subscriberRepository.save(s);
            }));
    }

    /** Liste paginée des abonnés (vue admin). Indispensable au passage à l'échelle. */
    public Flux<NewsletterSubscriberDTO> listSubscribers(int page, int size) {
        int safeSize = size <= 0 || size > 500 ? 50 : size;
        int safePage = Math.max(page, 0);
        return subscriberRepository
            .findAllByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(safePage, safeSize))
            .map(this::toSubscriberDTO);
    }

    /** Active / désactive un abonné. */
    public Mono<NewsletterSubscriberDTO> setSubscriberActive(String id, boolean active) {
        return subscriberRepository.findById(id)
            .flatMap(s -> {
                s.setSubscribed(active);
                return subscriberRepository.save(s);
            })
            .map(this::toSubscriberDTO);
    }

    /** Supprime définitivement un abonné. */
    public Mono<Void> deleteSubscriber(String id) {
        return subscriberRepository.deleteById(id);
    }

    /** Désinscription publique via jeton. */
    public Mono<Boolean> unsubscribe(String token) {
        return subscriberRepository.findByUnsubscribeToken(token)
            .flatMap(s -> {
                s.setSubscribed(false);
                return subscriberRepository.save(s);
            })
            .map(s -> true)
            .defaultIfEmpty(false);
    }

    /* ========================= CAMPAGNES ========================= */

    public Flux<NewsletterCampaignDTO> listCampaigns() {
        return campaignRepository.findAllByOrderByCreatedAtDesc().map(this::toCampaignDTO);
    }

    public Mono<NewsletterCampaignDTO> getCampaign(String id) {
        return campaignRepository.findById(id).map(this::toCampaignDTO);
    }

    /** Crée une campagne. Si une date future est fournie, elle est programmée. */
    public Mono<NewsletterCampaignDTO> createCampaign(NewsletterCampaignRequestDTO dto) {
        NewsletterCampaign c = new NewsletterCampaign();
        c.setSubject(dto.getSubject());
        c.setContentHtml(dto.getContentHtml());
        c.setAttachments(serializeAttachments(dto.getAttachments()));
        if (dto.getScheduledAt() != null && dto.getScheduledAt().isAfter(LocalDateTime.now())) {
            c.setScheduledAt(dto.getScheduledAt());
            c.setCampaignStatus("SCHEDULED");
        }
        return campaignRepository.save(c).map(this::toCampaignDTO);
    }

    /** Met à jour une campagne (uniquement si non envoyée). */
    public Mono<NewsletterCampaignDTO> updateCampaign(String id, NewsletterCampaignRequestDTO dto) {
        return campaignRepository.findById(id)
            .flatMap(c -> {
                if ("SENT".equals(c.getCampaignStatus()) || "SENDING".equals(c.getCampaignStatus())) {
                    return Mono.error(new IllegalStateException("Une campagne envoyée ne peut être modifiée"));
                }
                c.setSubject(dto.getSubject());
                c.setContentHtml(dto.getContentHtml());
                c.setAttachments(serializeAttachments(dto.getAttachments()));
                if (dto.getScheduledAt() != null && dto.getScheduledAt().isAfter(LocalDateTime.now())) {
                    c.setScheduledAt(dto.getScheduledAt());
                    c.setCampaignStatus("SCHEDULED");
                } else {
                    c.setScheduledAt(null);
                    c.setCampaignStatus("DRAFT");
                }
                return campaignRepository.save(c);
            })
            .map(this::toCampaignDTO);
    }

    public Mono<Void> deleteCampaign(String id) {
        return campaignRepository.deleteById(id);
    }

    /** Programme l'envoi d'une campagne à une date. */
    public Mono<NewsletterCampaignDTO> scheduleCampaign(String id, LocalDateTime when) {
        return campaignRepository.findById(id)
            .flatMap(c -> {
                c.setScheduledAt(when);
                c.setCampaignStatus("SCHEDULED");
                return campaignRepository.save(c);
            })
            .map(this::toCampaignDTO);
    }

    /**
     * Démarre l'envoi d'une campagne à tous les abonnés actifs.
     *
     * IMPORTANT (passage à l'échelle / millions d'abonnés) :
     *  - L'envoi réel est DÉTACHÉ de la requête HTTP (fire-and-forget) : on répond
     *    immédiatement avec le statut SENDING, ce qui évite tout timeout HTTP.
     *  - Les abonnés sont traités en STREAMING (jamais de collectList en mémoire),
     *    avec une concurrence bornée — l'empreinte mémoire reste constante quel que
     *    soit le nombre d'abonnés.
     */
    public Mono<NewsletterCampaignDTO> sendCampaignNow(String id) {
        return campaignRepository.findById(id)
            .flatMap(campaign -> {
                if ("SENDING".equals(campaign.getCampaignStatus())) {
                    return Mono.just(campaign); // déjà en cours : on ne relance pas
                }
                campaign.setCampaignStatus("SENDING");
                campaign.setSentCount(0);
                campaign.setRecipientCount(0);
                return campaignRepository.save(campaign)
                    .doOnSuccess(saved ->
                        // Envoi en tâche de fond, sur un ordonnanceur dédié aux I/O bloquantes.
                        sendCampaignStreaming(saved)
                            .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                            .subscribe(
                                done -> logger.info("Campagne {} envoyée : {} email(s)", saved.getId(), done.getSentCount()),
                                err -> logger.error("Échec de la campagne {}", saved.getId(), err)
                            ));
            })
            .map(this::toCampaignDTO);
    }

    /**
     * Pipeline d'envoi en streaming : lit les abonnés actifs au fil de l'eau,
     * envoie avec une concurrence bornée, compte total/envoyés sans tout charger,
     * puis met la campagne à SENT (ou FAILED en cas d'erreur globale).
     */
    private Mono<NewsletterCampaign> sendCampaignStreaming(NewsletterCampaign campaign) {
        return subscriberRepository.findBySubscribedTrue()
            // [total, envoyés] accumulés en streaming (mémoire constante).
            .flatMap(sub -> sendOne(campaign, sub).onErrorReturn(Boolean.FALSE), sendConcurrency)
            .reduce(new long[]{0L, 0L}, (acc, ok) -> {
                acc[0]++;
                if (Boolean.TRUE.equals(ok)) acc[1]++;
                return acc;
            })
            .flatMap(counts -> {
                campaign.setRecipientCount((int) Math.min(counts[0], Integer.MAX_VALUE));
                campaign.setSentCount((int) Math.min(counts[1], Integer.MAX_VALUE));
                campaign.setSentAt(LocalDateTime.now());
                campaign.setCampaignStatus("SENT");
                return campaignRepository.save(campaign);
            })
            .onErrorResume(e -> {
                logger.error("Erreur d'envoi de la campagne {} : {}", campaign.getId(), e.getMessage());
                campaign.setCampaignStatus("FAILED");
                return campaignRepository.save(campaign);
            });
    }

    /** Envoie un email à un abonné et enregistre l'événement SENT.
     *  Ajoute l'en-tête List-Unsubscribe : le lien « Se désinscrire » apparaît
     *  alors nativement à côté de l'expéditeur dans Gmail/Outlook. */
    private Mono<Boolean> sendOne(NewsletterCampaign campaign, NewsletterSubscriber sub) {
        // Images du contenu embarquées en inline (cid) -> affichage garanti.
        java.util.Map<String, org.springframework.core.io.Resource> inline = new java.util.LinkedHashMap<>();
        String html = buildEmailHtml(campaign, sub, inline);
        String unsubscribeUrl = apiBase() + "/unsubscribe/" + sub.getUnsubscribeToken();
        java.util.Map<String, String> headers = new java.util.HashMap<>();
        headers.put("List-Unsubscribe", "<" + unsubscribeUrl + ">");
        headers.put("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
        // Pièces jointes (PDF, CSV, …) résolues vers des ressources fichier.
        java.util.Map<String, org.springframework.core.io.Resource> files = new java.util.LinkedHashMap<>();
        for (com.abdatytch.backend.dto.NewsletterAttachmentDTO a : parseAttachments(campaign.getAttachments())) {
            org.springframework.core.io.Resource res = resolveAttachment(a.getUrl());
            if (res != null) {
                String name = a.getFilename() != null && !a.getFilename().isBlank() ? a.getFilename() : res.getFilename();
                files.put(name, res);
            }
        }
        return emailService.sendHtmlEmail(sub.getEmail(), campaign.getSubject(), html, headers, files, inline)
            .then(eventRepository.save(new NewsletterEvent(campaign.getId(), sub.getId(), EVENT_SENT)))
            .thenReturn(Boolean.TRUE)
            .onErrorResume(e -> {
                logger.warn("Échec d'envoi newsletter à {} : {}", sub.getEmail(), e.getMessage());
                return Mono.just(Boolean.FALSE);
            });
    }

    /**
     * Construit le HTML personnalisé : embarque les images du contenu en inline
     * (CID) pour qu'elles s'affichent même sans URL publique, réécrit les liens
     * pour le suivi des clics, ajoute le pixel d'ouverture et le lien de désinscription.
     *
     * @param inlineOut rempli avec les images à joindre en inline (contentId -> ressource)
     */
    private String buildEmailHtml(NewsletterCampaign campaign, NewsletterSubscriber sub,
                                  java.util.Map<String, org.springframework.core.io.Resource> inlineOut) {
        String cid = campaign.getId();
        String sid = sub.getId();

        // 1. Images du contenu (/uploads/...) -> inline cid: (affichage garanti).
        String content = embedInlineImages(campaign.getContentHtml(), inlineOut);

        // 2. Réécriture des liens http(s) -> lien tracké.
        Matcher m = HREF_PATTERN.matcher(content);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            String original = m.group(1);
            String tracked = apiBase() + "/track/click/" + cid + "/" + sid
                    + "?url=" + URLEncoder.encode(original, StandardCharsets.UTF_8);
            m.appendReplacement(sb, Matcher.quoteReplacement("href=\"" + tracked + "\""));
        }
        m.appendTail(sb);

        String pixel = "<img src=\"" + apiBase() + "/track/open/" + cid + "/" + sid
                + "\" width=\"1\" height=\"1\" alt=\"\" style=\"display:none\"/>";
        String unsubscribe = "<p style=\"font-size:12px;color:#888;margin-top:24px;text-align:center\">"
                + "<a href=\"" + apiBase() + "/unsubscribe/" + sub.getUnsubscribeToken()
                + "\" style=\"color:#888\">Se désinscrire</a></p>";

        return sb.toString() + pixel + unsubscribe;
    }

    /**
     * Remplace les &lt;img src="…/uploads/…"&gt; par des références inline cid:
     * et alimente {@code inlineOut} avec les fichiers correspondants. Les autres
     * images (externes, pixel de suivi) sont laissées intactes.
     */
    private String embedInlineImages(String html,
                                     java.util.Map<String, org.springframework.core.io.Resource> inlineOut) {
        if (html == null || html.isEmpty()) return html == null ? "" : html;
        Matcher m = IMG_SRC_PATTERN.matcher(html);
        StringBuilder sb = new StringBuilder();
        int[] idx = {0};
        while (m.find()) {
            String src = m.group(1);
            org.springframework.core.io.Resource res = resolveImageSrc(src);
            if (res != null) {
                String contentId = "nlimg" + (idx[0]++);
                inlineOut.put(contentId, res);
                m.appendReplacement(sb, Matcher.quoteReplacement("src=\"cid:" + contentId + "\""));
            } else {
                m.appendReplacement(sb, Matcher.quoteReplacement(m.group(0)));
            }
        }
        m.appendTail(sb);
        return sb.toString();
    }

    /** Résout une URL d'image pointant vers /uploads/… en ressource fichier (images uniquement). */
    private org.springframework.core.io.Resource resolveImageSrc(String src) {
        if (src == null) return null;
        int i = src.indexOf(publicBaseUrl + "/");
        if (i < 0) return null;
        String path = src.substring(i);
        String lower = path.toLowerCase();
        boolean isImage = lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                || lower.endsWith(".gif") || lower.endsWith(".webp");
        if (!isImage) return null;
        return resolveAttachment(path);
    }

    /* ========================= SUIVI ========================= */

    /** Enregistre une ouverture (unique par abonné) et incrémente le compteur. */
    public Mono<Void> trackOpen(String campaignId, String subscriberId, String ip) {
        return eventRepository.existsByCampaignIdAndSubscriberIdAndEventType(campaignId, subscriberId, EVENT_OPEN)
            .flatMap(exists -> {
                if (Boolean.TRUE.equals(exists)) return Mono.empty();
                NewsletterEvent ev = new NewsletterEvent(campaignId, subscriberId, EVENT_OPEN);
                ev.setIpAddress(ip);
                return eventRepository.save(ev)
                    .then(campaignRepository.findById(campaignId))
                    .flatMap(c -> {
                        c.setOpenCount((c.getOpenCount() == null ? 0 : c.getOpenCount()) + 1);
                        return campaignRepository.save(c);
                    })
                    .then();
            });
    }

    /** Enregistre un clic (unique par abonné) et renvoie l'URL de redirection. */
    public Mono<String> trackClick(String campaignId, String subscriberId, String url, String ip) {
        return eventRepository.existsByCampaignIdAndSubscriberIdAndEventType(campaignId, subscriberId, EVENT_CLICK)
            .flatMap(exists -> {
                if (Boolean.TRUE.equals(exists)) return Mono.just(url);
                NewsletterEvent ev = new NewsletterEvent(campaignId, subscriberId, EVENT_CLICK);
                ev.setUrl(url);
                ev.setIpAddress(ip);
                return eventRepository.save(ev)
                    .then(campaignRepository.findById(campaignId))
                    .flatMap(c -> {
                        c.setClickCount((c.getClickCount() == null ? 0 : c.getClickCount()) + 1);
                        return campaignRepository.save(c);
                    })
                    .thenReturn(url);
            })
            .defaultIfEmpty(url);
    }

    /* ========================= SCHEDULER ========================= */

    /** Envoie les campagnes programmées dont l'échéance est atteinte. */
    public Mono<Long> processScheduledCampaigns() {
        return campaignRepository
            .findByCampaignStatusAndScheduledAtLessThanEqual("SCHEDULED", LocalDateTime.now())
            .flatMap(c -> sendCampaignNow(c.getId()), 1)
            .count();
    }

    /* ========================= STATS ========================= */

    public Mono<NewsletterStatsDTO> getStats() {
        Mono<Long> total = subscriberRepository.count();
        Mono<Long> active = subscriberRepository.countBySubscribedTrue();
        Mono<Long> unsub = subscriberRepository.countBySubscribedFalse();
        Mono<Long> campaigns = campaignRepository.count();

        return Mono.zip(total, active, unsub, campaigns)
            .flatMap(t -> campaignRepository.findAll().collectList().map(list -> {
                long sent = 0, opens = 0, clicks = 0;
                for (NewsletterCampaign c : list) {
                    sent += c.getSentCount() == null ? 0 : c.getSentCount();
                    opens += c.getOpenCount() == null ? 0 : c.getOpenCount();
                    clicks += c.getClickCount() == null ? 0 : c.getClickCount();
                }
                NewsletterStatsDTO dto = new NewsletterStatsDTO();
                dto.setTotalSubscribers(t.getT1());
                dto.setActiveSubscribers(t.getT2());
                dto.setUnsubscribed(t.getT3());
                dto.setTotalCampaigns(t.getT4());
                dto.setEmailsSent(sent);
                dto.setTotalOpens(opens);
                dto.setTotalClicks(clicks);
                return dto;
            }));
    }

    /* ========================= MAPPERS ========================= */

    private NewsletterSubscriberDTO toSubscriberDTO(NewsletterSubscriber s) {
        NewsletterSubscriberDTO dto = new NewsletterSubscriberDTO();
        dto.setId(s.getId());
        dto.setEmail(s.getEmail());
        dto.setName(s.getName());
        dto.setLocale(s.getLocale());
        dto.setSubscribed(s.getSubscribed());
        dto.setSource(s.getSource());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }

    private NewsletterCampaignDTO toCampaignDTO(NewsletterCampaign c) {
        NewsletterCampaignDTO dto = new NewsletterCampaignDTO();
        dto.setId(c.getId());
        dto.setSubject(c.getSubject());
        dto.setContentHtml(c.getContentHtml());
        dto.setCampaignStatus(c.getCampaignStatus());
        dto.setScheduledAt(c.getScheduledAt());
        dto.setSentAt(c.getSentAt());
        dto.setRecipientCount(c.getRecipientCount());
        dto.setSentCount(c.getSentCount());
        dto.setOpenCount(c.getOpenCount());
        dto.setClickCount(c.getClickCount());
        dto.setAttachments(parseAttachments(c.getAttachments()));
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
