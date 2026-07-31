package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.WebhookDispatcherService;
import com.innovacred.bpm.domain.entity.WebhookConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class WebhookRestController {

    private final WebhookDispatcherService webhookService;

    @GetMapping
    public List<WebhookConfig> getAll() {
        return webhookService.getAll();
    }

    @PostMapping
    public WebhookConfig create(@RequestBody WebhookConfig config) {
        return webhookService.save(config);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebhookConfig> update(@PathVariable Long id, @RequestBody WebhookConfig config) {
        config.setId(id);
        return ResponseEntity.ok(webhookService.save(config));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        webhookService.delete(id);
        return ResponseEntity.ok().build();
    }
}
