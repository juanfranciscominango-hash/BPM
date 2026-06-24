package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.DocumentService;
import com.innovacred.bpm.application.service.SignatureService;
import com.innovacred.bpm.domain.entity.DocumentDefinition;
import com.innovacred.bpm.domain.entity.StoredDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public StoredDocument generate(
            @PathVariable Long definitionId,
            @RequestParam String instanceId,
            @RequestBody Map<String, Object> variables,
            @RequestParam String user) throws Exception {
        return documentService.generateAndStore(definitionId, instanceId, variables, user);
    }

    @PostMapping("/sign/{documentId}")
    public StoredDocument sign(
            @PathVariable Long documentId,
            @RequestParam String username,
            @RequestParam String pin) {
        return signatureService.signDocument(documentId, username, pin);
    }
}
