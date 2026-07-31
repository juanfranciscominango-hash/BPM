package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ProcessVariableSchemaService;
import com.innovacred.bpm.domain.entity.ProcessVariableSchema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/variable-schema")
@RequiredArgsConstructor
public class ProcessVariableSchemaRestController {

    private final ProcessVariableSchemaService schemaService;

    // ── CRUD ──

    @GetMapping("/process/{processKey}")
    public List<ProcessVariableSchema> getByProcess(@PathVariable String processKey) {
        return schemaService.findAllByProcess(processKey);
    }

    @GetMapping("/process/{processKey}/active")
    public List<ProcessVariableSchema> getActiveByProcess(@PathVariable String processKey) {
        return schemaService.findByProcess(processKey);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcessVariableSchema> getById(@PathVariable Long id) {
        return schemaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ProcessVariableSchema create(@RequestBody ProcessVariableSchema schema) {
        return schemaService.save(schema);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcessVariableSchema> update(
            @PathVariable Long id, @RequestBody ProcessVariableSchema schema) {
        return schemaService.findById(id).map(existing -> {
            schema.setId(id);
            schema.setCreatedAt(existing.getCreatedAt());
            return ResponseEntity.ok(schemaService.save(schema));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (schemaService.findById(id).isEmpty())
            return ResponseEntity.notFound().build();
        schemaService.delete(id);
        return ResponseEntity.ok().build();
    }

    // ── Validación on-demand ──

    /**
     * Valida un conjunto de variables contra el esquema de un proceso.
     * Útil para que el frontend valide antes de enviar al inicio.
     */
    @PostMapping("/validate/{processKey}")
    public ResponseEntity<Map<String, Object>> validate(
            @PathVariable String processKey,
            @RequestBody Map<String, Object> variables) {
        try {
            Map<String, Object> enriched = schemaService.validateAndEnrichStartVariables(processKey, variables);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "enrichedVariables", enriched
            ));
        } catch (ProcessVariableSchemaService.ProcessVariableValidationException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "errors", ex.getErrors()
            ));
        }
    }
}
