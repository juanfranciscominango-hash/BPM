package com.innovacred.bpm.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovacred.bpm.domain.entity.ExternalProcess;
import com.innovacred.bpm.domain.entity.TramaField;
import com.innovacred.bpm.infrastructure.adapter.persistence.ExternalProcessRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TramaFieldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalProcessService {

    private final ExternalProcessRepository externalProcessRepository;
    private final TramaFieldRepository tramaFieldRepository;
    private final ExternalApiService externalApiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> executeProcess(String processCode, Map<String, Object> variables) {
        ExternalProcess process = externalProcessRepository.findByCode(processCode)
                .orElseThrow(() -> new RuntimeException("Proceso no encontrado: " + processCode));

        List<TramaField> inputFields = tramaFieldRepository.findByProcessIdAndTramaType(process.getId(), "INPUT");
        
        Map<String, Object> payloadMap = buildPayload(inputFields, null, variables);
        String rawBody;
        try {
            rawBody = objectMapper.writeValueAsString(payloadMap);
            log.info("Payload generado para {}: {}", processCode, rawBody);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializando payload para " + processCode, e);
        }

        ResponseEntity<String> response = externalApiService.executeApiWithBody(processCode, rawBody, variables);
        
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Llamada a API falló para " + processCode + " con estado " + response.getStatusCode());
        }

        List<TramaField> outputFields = tramaFieldRepository.findByProcessIdAndTramaType(process.getId(), "OUTPUT");
        try {
            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
            return parseResponse(outputFields, null, responseMap);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parseando respuesta para " + processCode, e);
        }
    }

    private Map<String, Object> buildPayload(List<TramaField> fields, Long parentId, Map<String, Object> variables) {
        Map<String, Object> currentLevel = new HashMap<>();
        List<TramaField> children = fields.stream()
                .filter(f -> (parentId == null && f.getParentId() == null) || (parentId != null && parentId.equals(f.getParentId())))
                .collect(Collectors.toList());

        for (TramaField child : children) {
            List<TramaField> grandChildren = fields.stream()
                    .filter(f -> child.getId().equals(f.getParentId()))
                    .collect(Collectors.toList());

            if (grandChildren.isEmpty()) {
                // Nodo hoja, obtener valor
                Object value = resolveValue(child, variables);
                // Omitir si es nulo y está configurado
                if (value == null && Boolean.TRUE.equals(child.getOmitIfNull())) {
                    continue;
                }
                currentLevel.put(child.getName(), value);
            } else {
                // Nodo compuesto
                Map<String, Object> nested = buildPayload(fields, child.getId(), variables);
                if (!nested.isEmpty() || !Boolean.TRUE.equals(child.getOmitIfNull())) {
                    currentLevel.put(child.getName(), nested);
                }
            }
        }
        
        // Si es la raíz (_Root), desanidamos sus propiedades hacia arriba
        if (parentId == null && currentLevel.size() == 1 && currentLevel.containsKey("_Root")) {
            Object rootVal = currentLevel.get("_Root");
            if (rootVal instanceof Map) {
                return (Map<String, Object>) rootVal;
            }
        }
        
        return currentLevel;
    }

    private Object resolveValue(TramaField field, Map<String, Object> variables) {
        // Lógica simplificada de asignación
        if (variables != null && variables.containsKey(field.getName())) {
            return variables.get(field.getName());
        }
        return field.getDefaultValue();
    }

    private Map<String, Object> parseResponse(List<TramaField> fields, Long parentId, Map<String, Object> responseMap) {
        Map<String, Object> result = new HashMap<>();
        List<TramaField> children = fields.stream()
                .filter(f -> (parentId == null && f.getParentId() == null) || (parentId != null && parentId.equals(f.getParentId())))
                .collect(Collectors.toList());

        // Si es la raíz (_Root), usamos el mapa actual para buscar sus hijos
        boolean isRootLevel = (parentId == null && children.size() == 1 && "_Root".equals(children.get(0).getName()));
        
        if (isRootLevel) {
             TramaField rootField = children.get(0);
             return parseResponse(fields, rootField.getId(), responseMap);
        }

        for (TramaField child : children) {
            List<TramaField> grandChildren = fields.stream()
                    .filter(f -> child.getId().equals(f.getParentId()))
                    .collect(Collectors.toList());

            if (grandChildren.isEmpty()) {
                if (responseMap != null && responseMap.containsKey(child.getName())) {
                    result.put(child.getName(), responseMap.get(child.getName()));
                } else if (child.getDefaultValue() != null) {
                    result.put(child.getName(), child.getDefaultValue());
                }
            } else {
                Object nestedObj = responseMap != null ? responseMap.get(child.getName()) : null;
                if (nestedObj instanceof Map) {
                    Map<String, Object> nestedResult = parseResponse(fields, child.getId(), (Map<String, Object>) nestedObj);
                    result.put(child.getName(), nestedResult);
                } else {
                    // Tratar de parsear aunque no exista en el JSON original para poner defaults si aplican
                    Map<String, Object> nestedResult = parseResponse(fields, child.getId(), new HashMap<>());
                    if (!nestedResult.isEmpty()) {
                         result.put(child.getName(), nestedResult);
                    }
                }
            }
        }
        return result;
    }
}
