package com.abdatytch.backend.controller;

import com.abdatytch.backend.dto.request.ContactRequestDTO;
import com.abdatytch.backend.dto.response.ContactMessageDTO;
import com.abdatytch.backend.service.impl.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * API du formulaire de contact.
 *
 * POST public (réception d'un message + email). Lecture / gestion réservées aux
 * administrateurs.
 */
@RestController
@RequestMapping("${app.api.prefix}/${app.api.version}/contact")
public class ContactController {

    private final ContactService service;

    public ContactController(ContactService service) {
        this.service = service;
    }

    /** Réception publique d'un message de contact. */
    @PostMapping
    public Mono<ResponseEntity<Map<String, String>>> submit(@Valid @RequestBody ContactRequestDTO dto,
                                                            ServerWebExchange exchange) {
        String ip = exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() : null;
        return service.create(dto, ip)
            .map(saved -> ResponseEntity.ok(Map.of("message", "Message reçu", "id", saved.getId())));
    }

    /** Liste paginée des messages (admin). */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<ContactMessageDTO> list(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "50") int size) {
        return service.list(page, size);
    }

    /** Statistiques (total + non lus). */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<Map<String, Long>> stats() {
        return Mono.zip(service.count(), service.unreadCount())
            .map(t -> Map.of("total", t.getT1(), "unread", t.getT2()));
    }

    /** Marque un message comme lu / non lu. */
    @PatchMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<ContactMessageDTO>> markRead(@PathVariable String id,
                                                            @RequestParam(defaultValue = "true") boolean value) {
        return service.markRead(id, value).map(ResponseEntity::ok).defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /** Supprime un message. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<Void>> delete(@PathVariable String id) {
        return service.delete(id).thenReturn(ResponseEntity.noContent().<Void>build());
    }
}
