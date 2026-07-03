package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.DocumentService;
import com.innovacred.bpm.application.service.SignatureService;
import com.innovacred.bpm.domain.entity.DocumentDefinition;
import com.innovacred.bpm.domain.entity.StoredDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentRestController {

    private final DocumentService documentService;
    private final SignatureService signatureService;

    @GetMapping("/definitions/{processKey}")
    public List<DocumentDefinition> getDefinitions(@PathVariable String processKey) {
        return documentService.listDefinitionsByProcess(processKey);
    }

    @GetMapping("/definitions/all")
    public List<DocumentDefinition> getAllDefinitions() {
        return documentService.listDefinitionsByProcess(null);
    }

    @PostMapping("/definitions/upload")
    public String uploadTemplate(@RequestParam("file") MultipartFile file) throws Exception {
        return documentService.uploadTemplate(file);
    }

    @PostMapping("/definitions")
    public DocumentDefinition saveDefinition(@RequestBody DocumentDefinition definition) {
        return documentService.saveDefinition(definition);
    }

    @PostMapping("/upload")
    public StoredDocument upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("instanceId") String instanceId,
            @RequestParam("definitionId") Long definitionId,
            @RequestParam("user") String user) throws Exception {
        return documentService.uploadFile(file, instanceId, definitionId, user);
    }

    @GetMapping("/instance/{instanceId}")
    public List<StoredDocument> getByInstance(@PathVariable String instanceId) {
        return documentService.listByInstance(instanceId);
    }

    @PostMapping("/generate/{definitionId}")
    public ResponseEntity<?> generate(
            @PathVariable Long definitionId,
            @RequestParam String instanceId,
            @RequestBody Map<String, Object> variables,
            @RequestParam String user) throws Exception {
        
        try {
            Map<String, String> result = documentService.generateFromOfficeTemplate(definitionId, instanceId, variables, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            StoredDocument doc = documentService.generateAndStore(definitionId, instanceId, variables, user);
            return ResponseEntity.ok(doc);
        }
    }

    @PostMapping("/generate-by-name/{documentName}")
    public ResponseEntity<?> generateByName(
            @PathVariable String documentName,
            @RequestParam String instanceId,
            @RequestBody Map<String, Object> variables,
            @RequestParam String user) {
        
        try {
            DocumentDefinition def = documentService.getDefinitionByName(documentName);
            try {
                if (def.getTemplatePath() != null && !def.getTemplatePath().isEmpty()) {
                    Map<String, String> result = documentService.generateFromOfficeTemplate(def.getId(), instanceId, variables, user);
                    return ResponseEntity.ok(result);
                } else {
                    StoredDocument doc = documentService.generateAndStore(def.getId(), instanceId, variables, user);
                    return ResponseEntity.ok(doc);
                }
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of("message", "Error generando documento: " + e.getMessage()));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/sign/{documentId}")
    public StoredDocument sign(
            @PathVariable Long documentId,
            @RequestParam String username,
            @RequestParam String pin) {
        return signatureService.signDocument(documentId, username, pin);
    }
}
