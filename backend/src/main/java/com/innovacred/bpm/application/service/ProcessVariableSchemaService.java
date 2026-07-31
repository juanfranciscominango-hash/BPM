package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ProcessVariableSchema;
import com.innovacred.bpm.infrastructure.adapter.persistence.ProcessVariableSchemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Servicio de esquema de variables de proceso.
 *
 * Responsabilidades:
 *  1. CRUD de definiciones de variables por proceso.
 *  2. Validación de variables al iniciar un proceso.
 *  3. Validación de variables al completar una tarea.
 *  4. Aplicar valores por defecto cuando no se proveen.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessVariableSchemaService {

    private final ProcessVariableSchemaRepository schemaRepository;

    // ────── CRUD ──────

    public List<ProcessVariableSchema> findByProcess(String processKey) {
        return schemaRepository.findByProcessDefinitionKeyAndActiveTrueOrderBySortOrderAsc(processKey);
    }

    public List<ProcessVariableSchema> findAllByProcess(String processKey) {
        return schemaRepository.findByProcessDefinitionKey(processKey);
    }

    public Optional<ProcessVariableSchema> findById(Long id) {
        return schemaRepository.findById(id);
    }

    @Transactional
    public ProcessVariableSchema save(ProcessVariableSchema schema) {
        return schemaRepository.save(schema);
    }

    @Transactional
    public void delete(Long id) {
        schemaRepository.deleteById(id);
    }

    // ────── VALIDACIÓN AL INICIAR PROCESO ──────

    /**
     * Valida que las variables de inicio de proceso cumplan el esquema definido.
     * Aplica valores por defecto para las no obligatorias ausentes.
     *
     * @param processKey Clave del proceso
     * @param variables  Variables enviadas por el usuario
     * @return Mapa de variables enriquecido con valores por defecto
     * @throws ProcessVariableValidationException si falta una variable obligatoria o el tipo no coincide
     */
    public Map<String, Object> validateAndEnrichStartVariables(
            String processKey, Map<String, Object> variables) {

        List<ProcessVariableSchema> schemas = schemaRepository
                .findByProcessDefinitionKeyAndActiveTrueOrderBySortOrderAsc(processKey);

        if (schemas.isEmpty()) return variables; // Sin esquema definido → pasar todo

        Map<String, Object> enriched = variables != null ? new HashMap<>(variables) : new HashMap<>();
        List<String> errors = new ArrayList<>();

        for (ProcessVariableSchema schema : schemas) {
            String varName = schema.getVariableName();
            Object value = enriched.get(varName);

            if (value == null || value.toString().isBlank()) {
                if (schema.isRequired()) {
                    errors.add(String.format("Variable obligatoria '%s' (%s) no fue proporcionada.",
                            schema.getLabel() != null ? schema.getLabel() : varName, varName));
                } else if (schema.getDefaultValue() != null) {
                    enriched.put(varName, parseTypedValue(schema.getDefaultValue(), schema.getDataType()));
                    log.debug("Variable '{}' no enviada, aplicando default: {}", varName, schema.getDefaultValue());
                }
            } else {
                // Validar tipo
                String typeError = validateType(varName, value, schema.getDataType());
                if (typeError != null) errors.add(typeError);

                // Validar expresión regex (solo STRING)
                if (schema.getValidationExpression() != null && !schema.getValidationExpression().isBlank()) {
                    String regexError = validateExpression(varName, value.toString(),
                            schema.getValidationExpression(),
                            schema.getValidationMessage());
                    if (regexError != null) errors.add(regexError);
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new ProcessVariableValidationException(errors);
        }

        return enriched;
    }

    /**
     * Valida variables al completar una tarea (solo las que pertenecen al esquema).
     * Más permisivo que al iniciar: no exige todas las variables, solo valida las presentes.
     */
    public void validateCompleteVariables(String processKey, Map<String, Object> variables) {
        List<ProcessVariableSchema> schemas = schemaRepository
                .findByProcessDefinitionKeyAndActiveTrueOrderBySortOrderAsc(processKey);

        if (schemas.isEmpty() || variables == null) return;

        List<String> errors = new ArrayList<>();
        Map<String, ProcessVariableSchema> schemaMap = new HashMap<>();
        schemas.forEach(s -> schemaMap.put(s.getVariableName(), s));

        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            ProcessVariableSchema schema = schemaMap.get(entry.getKey());
            if (schema == null) continue; // Variable extra no definida → permitir

            if (entry.getValue() != null) {
                String typeError = validateType(entry.getKey(), entry.getValue(), schema.getDataType());
                if (typeError != null) errors.add(typeError);
            }
        }

        if (!errors.isEmpty()) {
            throw new ProcessVariableValidationException(errors);
        }
    }

    // ────── HELPERS ──────

    private String validateType(String varName, Object value, String expectedType) {
        try {
            switch (expectedType.toUpperCase()) {
                case "NUMBER" -> {
                    if (!(value instanceof Number)) {
                        Double.parseDouble(value.toString()); // intentar convertir
                    }
                }
                case "BOOLEAN" -> {
                    if (!(value instanceof Boolean)) {
                        String s = value.toString().toLowerCase();
                        if (!s.equals("true") && !s.equals("false"))
                            return String.format("Variable '%s' debe ser BOOLEAN (true/false), recibido: '%s'", varName, value);
                    }
                }
                case "DATE" -> {
                    // Aceptar ISO 8601 o yyyy-MM-dd
                    if (!value.toString().matches("\\d{4}-\\d{2}-\\d{2}.*"))
                        return String.format("Variable '%s' debe ser DATE (yyyy-MM-dd), recibido: '%s'", varName, value);
                }
                // STRING y OBJECT → siempre válidos
            }
        } catch (NumberFormatException e) {
            return String.format("Variable '%s' debe ser NUMBER, recibido: '%s'", varName, value);
        }
        return null;
    }

    private String validateExpression(String varName, String value, String regex, String message) {
        try {
            if (!Pattern.matches(regex, value)) {
                return message != null && !message.isBlank()
                        ? message
                        : String.format("Variable '%s' no cumple el formato requerido (valor: '%s')", varName, value);
            }
        } catch (Exception e) {
            log.warn("Error al evaluar expresión de validación para '{}': {}", varName, e.getMessage());
        }
        return null;
    }

    private Object parseTypedValue(String raw, String dataType) {
        if (raw == null) return null;
        return switch (dataType.toUpperCase()) {
            case "NUMBER"  -> { try { yield Double.parseDouble(raw); } catch (Exception e) { yield raw; } }
            case "BOOLEAN" -> Boolean.parseBoolean(raw);
            default        -> raw;
        };
    }

    // ────── EXCEPCIÓN INTERNA ──────

    public static class ProcessVariableValidationException extends RuntimeException {
        private final List<String> errors;

        public ProcessVariableValidationException(List<String> errors) {
            super("Validación de variables fallida: " + String.join("; ", errors));
            this.errors = errors;
        }

        public List<String> getErrors() {
            return errors;
        }
    }
}
