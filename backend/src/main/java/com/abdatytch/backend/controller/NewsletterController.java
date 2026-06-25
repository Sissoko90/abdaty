package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.NewsletterCampaignRequestDTO;
import com.abdatytch.backend.dto.request.NewsletterSubscribeRequestDTO;
import com.abdatytch.backend.dto.response.NewsletterCampaignDTO;
import com.abdatytch.backend.dto.response.NewsletterStatsDTO;
import com.abdatytch.backend.dto.response.NewsletterSubscriberDTO;
import com.abdatytch.backend.service.impl.NewsletterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

/**
 * API Newsletter.
 *
 * Endpoints PUBLICS : inscription, désinscription, suivi (pixel d'ouverture,
 * redirection de clic). Endpoints ADMIN : gestion des abonnés, des campagnes et
 * statistiques (protégés par {@code @PreAuthorize("hasRole('ADMIN')")}).
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/newsletter")
public class NewsletterController {

    /** Pixel GIF transparent 1x1 pour le suivi d'ouverture. */
    private static final byte[] PIXEL_GIF = Base64.getDecoder().decode(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    /* ========================= PUBLIC ========================= */

    /** Inscription publique à la newsletter. */
    @PostMapping("/subscribe")
    public Mono<ResponseEntity<Map<String, String>>> subscribe(@Valid @RequestBody NewsletterSubscribeRequestDTO dto) {
        return newsletterService.subscribe(dto, dto.getSource())
            .map(s -> ResponseEntity.ok(Map.of("message", "Inscription confirmée", "email", s.getEmail())));
    }

    /** Désinscription « one-click » (RFC 8058) : Gmail/Outlook envoient un POST
     *  sur l'URL List-Unsubscribe. Renvoie 200 sans corps. */
    @PostMapping("/unsubscribe/{token}")
    public Mono<ResponseEntity<Void>> unsubscribeOneClick(@PathVariable String token) {
        return newsletterService.unsubscribe(token).thenReturn(ResponseEntity.ok().<Void>build());
    }

    /** Désinscription publique via jeton (lien dans l'email). */
    @GetMapping("/unsubscribe/{token}")
    public Mono<ResponseEntity<String>> unsubscribe(@PathVariable String token) {
        return newsletterService.unsubscribe(token)
            .map(ok -> ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(ok
                    ? "<html><body style='font-family:sans-serif;text-align:center;padding:60px'>"
                        + "<h2>Vous êtes désinscrit.</h2><p>Vous ne recevrez plus nos emails.</p></body></html>"
                    : "<html><body style='font-family:sans-serif;text-align:center;padding:60px'>"
                        + "<h2>Lien invalide.</h2></body></html>"));
    }

    /** Suivi d'ouverture : renvoie un pixel transparent et enregistre l'événement. */
    @GetMapping("/track/open/{campaignId}/{subscriberId}")
    public Mono<ResponseEntity<byte[]>> trackOpen(@PathVariable String campaignId,
                                                  @PathVariable String subscriberId,
                                                  ServerWebExchange exchange) {
        return newsletterService.trackOpen(campaignId, subscriberId, clientIp(exchange))
            .thenReturn(ResponseEntity.ok()
                .contentType(MediaType.IMAGE_GIF)
                .header("Cache-Control", "no-store, no-cache, must-revalidate")
                .body(PIXEL_GIF));
    }

    /** Suivi de clic : enregistre puis redirige (302) vers l'URL d'origine. */
    @GetMapping("/track/click/{campaignId}/{subscriberId}")
    public Mono<ResponseEntity<Void>> trackClick(@PathVariable String campaignId,
                                                 @PathVariable String subscriberId,
                                                 @RequestParam String url,
                                                 ServerWebExchange exchange) {
        return newsletterService.trackClick(campaignId, subscriberId, url, clientIp(exchange))
            .map(target -> ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).<Void>build());
    }

    /* ========================= ADMIN : ABONNÉS ========================= */

    @GetMapping("/subscribers")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<NewsletterSubscriberDTO> listSubscribers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return newsletterService.listSubscribers(page, size);
    }

    @PatchMapping("/subscribers/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<NewsletterSubscriberDTO>> setActive(@PathVariable String id,
                                                                   @RequestParam("value") boolean value) {
        return newsletterService.setSubscriberActive(id, value)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subscribers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<Void>> deleteSubscriber(@PathVariable String id) {
        return newsletterService.deleteSubscriber(id).thenReturn(ResponseEntity.noContent().<Void>build());
    }

    /* ========================= ADMIN : CAMPAGNES ========================= */

    @GetMapping("/campaigns")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<NewsletterCampaignDTO> listCampaigns() {
        return newsletterService.listCampaigns();
    }

    @GetMapping("/campaigns/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<NewsletterCampaignDTO>> getCampaign(@PathVariable String id) {
        return newsletterService.getCampaign(id).map(ResponseEntity::ok).defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/campaigns")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<NewsletterCampaignDTO>> createCampaign(@Valid @RequestBody NewsletterCampaignRequestDTO dto) {
        return newsletterService.createCampaign(dto).map(c -> ResponseEntity.status(HttpStatus.CREATED).body(c));
    }

    @PutMapping("/campaigns/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<NewsletterCampaignDTO>> updateCampaign(@PathVariable String id,
                                                                      @Valid @RequestBody NewsletterCampaignRequestDTO dto) {
        return newsletterService.updateCampaign(id, dto)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/campaigns/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<Void>> deleteCampaign(@PathVariable String id) {
        return newsletterService.deleteCampaign(id).thenReturn(ResponseEntity.noContent().<Void>build());
    }

    /** Envoi immédiat d'une campagne. */
    @PostMapping("/campaigns/{id}/send")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<NewsletterCampaignDTO>> sendNow(@PathVariable String id) {
        return newsletterService.sendCampaignNow(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /** Programmation de l'envoi d'une campagne à une date donnée. */
    @PostMapping("/campaigns/{id}/schedule")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<NewsletterCampaignDTO>> schedule(@PathVariable String id,
                                                                @RequestParam("at") String at) {
        return newsletterService.scheduleCampaign(id, LocalDateTime.parse(at))
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /* ========================= ADMIN : STATS ========================= */

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<NewsletterStatsDTO> stats() {
        return newsletterService.getStats();
    }

    /** Extrait l'IP cliente de la requête. */
    private String clientIp(ServerWebExchange exchange) {
        return exchange.getRequest().getRemoteAddress() != null
            ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
            : null;
    }
}
