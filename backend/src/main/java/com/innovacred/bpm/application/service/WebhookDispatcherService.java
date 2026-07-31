package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.WebhookConfig;
import com.innovacred.bpm.infrastructure.adapter.persistence.WebhookConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookDispatcherService {

    private final WebhookConfigRepository webhookRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public void dispatchEvent(String processDefKey, String eventType, String processInstanceId, String taskId, Map<String, Object> payloadData) {
        // Ejecutar de forma asíncrona para no bloquear el hilo principal de Flowable
        CompletableFuture.runAsync(() -> {
            try {
                List<WebhookConfig> configs = webhookRepository.findByActiveTrue().stream()
                        .filter(w -> (w.getProcessDefinitionKey() == null || w.getProcessDefinitionKey().isBlank() || w.getProcessDefinitionKey().equals(processDefKey)))
                        .filter(w -> w.getEvents() != null && w.getEvents().contains(eventType))
                        .collect(Collectors.toList());

                if (configs.isEmpty()) return;

                Map<String, Object> payload = new HashMap<>();
                payload.put("event", eventType);
                payload.put("processDefinitionKey", processDefKey);
                payload.put("processInstanceId", processInstanceId);
                payload.put("taskId", taskId);
                payload.put("timestamp", java.time.Instant.now().toString());
                payload.put("data", payloadData);

                for (WebhookConfig config : configs) {
                    sendWebhook(config, payload);
                }
            } catch (Exception e) {
                log.error("Error despachando webhook para evento {} (Instancia: {}): {}", eventType, processInstanceId, e.getMessage());
            }
        });
    }

    private void sendWebhook(WebhookConfig config, Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (config.getSecretKey() != null && !config.getSecretKey().isBlank()) {
                // Se podría implementar firma HMAC aquí si fuera necesario
                headers.set("Authorization", "Bearer " + config.getSecretKey());
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(config.getUrl(), request, String.class);
            log.info("Webhook enviado exitosamente a {} para evento {}", config.getUrl(), payload.get("event"));
        } catch (Exception e) {
            log.error("Error al enviar webhook a {}: {}", config.getUrl(), e.getMessage());
        }
    }

    public List<WebhookConfig> getAll() {
        return webhookRepository.findAll();
    }
    
    public List<WebhookConfig> getByProcess(String procKey) {
        return webhookRepository.findByProcessDefinitionKeyAndActiveTrue(procKey);
    }

    public WebhookConfig save(WebhookConfig config) {
        return webhookRepository.save(config);
    }

    public void delete(Long id) {
        webhookRepository.deleteById(id);
    }
}
