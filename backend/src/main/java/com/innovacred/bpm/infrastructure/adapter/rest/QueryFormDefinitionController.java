package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.domain.entity.QueryFormDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.QueryFormDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/queries/forms")
@RequiredArgsConstructor
public class QueryFormDefinitionController {

    private final QueryFormDefinitionRepository repository;
    private static final String DEFAULT_FORM_NAME = "DEFAULT_QUERY_FORM";

    @GetMapping("/default")
    public ResponseEntity<QueryFormDefinition> getDefaultForm() {
        return repository.findByName(DEFAULT_FORM_NAME)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public static class SaveFormRequest {
        private String schemaJson;
        public String getSchemaJson() { return schemaJson; }
        public void setSchemaJson(String schemaJson) { this.schemaJson = schemaJson; }
    }

    @PostMapping
    public ResponseEntity<QueryFormDefinition> saveForm(@RequestBody SaveFormRequest request) {
        QueryFormDefinition form = repository.findByName(DEFAULT_FORM_NAME)
                .orElseGet(() -> QueryFormDefinition.builder().name(DEFAULT_FORM_NAME).build());
        
        form.setSchemaJson(request.getSchemaJson());
        QueryFormDefinition saved = repository.save(form);
        return ResponseEntity.ok(saved);
    }
}
