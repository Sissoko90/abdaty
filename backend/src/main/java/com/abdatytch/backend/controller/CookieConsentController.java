package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.CookieConsentRequestDTO;
import com.abdatytch.backend.dto.response.CookieConsentDTO;
import com.abdatytch.backend.dto.response.CookieConsentStatsDTO;
import com.abdatytch.backend.service.impl.CookieConsentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * API Consentements cookies.
 *
 * POST public (enregistrement depuis le bandeau) ; lecture et statistiques
 * réservées aux administrateurs.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/cookie-consents")
public class CookieConsentController {

    private final CookieConsentService service;

    public CookieConsentController(CookieConsentService service) {
        this.service = service;
    }

    /** Enregistre un consentement (public). */
    @PostMapping
    public Mono<ResponseEntity<CookieConsentDTO>> record(@RequestBody CookieConsentRequestDTO dto,
                                                         ServerWebExchange exchange) {
        String ip = exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() : null;
        String ua = exchange.getRequest().getHeaders().getFirst("User-Agent");
        return service.record(dto, ip, ua).map(ResponseEntity::ok);
    }

    /** Liste paginée des consentements (admin). */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<CookieConsentDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return service.list(page, size);
    }

    /** Statistiques des consentements (admin). */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<CookieConsentStatsDTO> stats() {
        return service.stats();
    }
}
