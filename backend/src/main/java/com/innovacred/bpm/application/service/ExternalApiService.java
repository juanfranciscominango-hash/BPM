package com.innovacred.bpm.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovacred.bpm.domain.entity.ApiDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.ApiDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalApiService {

    private final ApiDefinitionRepository apiDefinitionRepository;
    private final CryptoService cryptoService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<String> executeApi(String apiName, Map<String, Object> variables) {
        ApiDefinition api = apiDefinitionRepository.findByName(apiName)
                .orElseThrow(() -> new RuntimeException("API no definida: " + apiName));

        String url = resolveVariables(api.getUrl(), variables);
        String body = resolveVariables(api.getBodyTemplate(), variables);
        return execute(api, apiName, url, body, variables);
    }

    public ResponseEntity<String> executeApiWithBody(String apiName, String rawBody, Map<String, Object> variables) {
        ApiDefinition api = apiDefinitionRepository.findByName(apiName)
                .orElseThrow(() -> new RuntimeException("API no definida: " + apiName));

        String url = resolveVariables(api.getUrl(), variables);
        return execute(api, apiName, url, rawBody, variables);
    }

    private ResponseEntity<String> execute(ApiDefinition api, String apiName, String url, String body, Map<String, Object> variables) {
        HttpMethod method = HttpMethod.valueOf(api.getMethod().toUpperCase());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        boolean requiresEncryption = false;
        
        if (api.getHeadersJson() != null && !api.getHeadersJson().trim().isEmpty()) {
            try {
                Map<String, String> parsedHeaders = objectMapper.readValue(api.getHeadersJson(), new TypeReference<Map<String, String>>() {});
                for (Map.Entry<String, String> entry : parsedHeaders.entrySet()) {
                    if ("__encrypt".equalsIgnoreCase(entry.getKey())) {
                        requiresEncryption = "true".equalsIgnoreCase(entry.getValue());
                    } else {
                        headers.add(entry.getKey(), resolveVariables(entry.getValue(), variables));
                    }
                }
            } catch (Exception ex) {
                log.warn("No se pudieron parsear las cabeceras JSON para {}: {}", apiName, ex.getMessage());
            }
        }

        // Si el API requiere encriptación (ej: CONSULTA_CLIENTE), envolvemos el body
        if (requiresEncryption && (method == HttpMethod.POST || method == HttpMethod.PUT)) {
            try {
                Map<String, String> encryptedPayload = cryptoService.encryptRequest(body);
                body = objectMapper.writeValueAsString(encryptedPayload);
                log.info("Payload encriptado con éxito para {}", apiName);
            } catch (Exception ex) {
                throw new RuntimeException("Fallo encriptando el payload: " + ex.getMessage(), ex);
            }
        }

        HttpEntity<String> entity;
        if (method == HttpMethod.GET || method == HttpMethod.DELETE) {
            entity = new HttpEntity<>(headers);
        } else {
            entity = new HttpEntity<>(body, headers);
        }

        log.info("Ejecutando API externa [{}]: {} {}", apiName, method, url);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, method, entity, String.class);
            String responseBody = response.getBody();
            
            if (requiresEncryption && responseBody != null && responseBody.contains("\"SessionKey\"")) {
                try {
                    Map<String, String> encRes = objectMapper.readValue(responseBody, new TypeReference<Map<String, String>>() {});
                    String decryptedJson = cryptoService.decryptResponse(encRes);
                    return ResponseEntity.status(response.getStatusCode()).headers(response.getHeaders()).body(decryptedJson);
                } catch (Exception e) {
                    log.error("Fallo desencriptando la respuesta de {}", apiName, e);
                }
            }
            return response;
        } catch (Exception e) {
            log.error("Error ejecutando API externa {}: {}", apiName, e.getMessage());
            throw new RuntimeException("Error en llamada externa: " + e.getMessage());
        }
    }

    private String resolveVariables(String template, Map<String, Object> variables) {
        if (template == null || variables == null) return template;
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "${" + entry.getKey() + "}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            // Usar String.replace (literal) en lugar de replaceAll (regex) para evitar 'No group with name'
            result = result.replace(placeholder, value);
        }
        return result;
    }
}
