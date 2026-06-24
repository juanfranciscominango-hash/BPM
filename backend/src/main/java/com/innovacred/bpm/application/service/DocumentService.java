package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.DocumentDefinition;
import com.innovacred.bpm.domain.entity.StoredDocument;
import com.innovacred.bpm.infrastructure.adapter.persistence.DocumentDefinitionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.StoredDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentDefinitionRepository definitionRepository;
    private final StoredDocumentRepository storedDocumentRepository;
    private final String STORAGE_DIR = "C:/ProyectosJava/BMP/storage/";

    public DocumentDefinition saveDefinition(DocumentDefinition definition) {
        return definitionRepository.save(definition);
    }

    public StoredDocument uploadFile(MultipartFile file, String processInstanceId, Long definitionId, String user) throws Exception {
        File directory = new File(STORAGE_DIR);
        if (!directory.exists()) directory.mkdirs();

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(STORAGE_DIR + fileName);
        Files.copy(file.getInputStream(), filePath);

        StoredDocument doc = StoredDocument.builder()
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .storagePath(fileName)
                .processInstanceId(processInstanceId)
                .definitionId(definitionId)
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(user)
                .build();

        return storedDocumentRepository.save(doc);
    }

    public List<StoredDocument> listByInstance(String instanceId) {
        return storedDocumentRepository.findByProcessInstanceId(instanceId);
    }

    public List<DocumentDefinition> listDefinitionsByProcess(String processKey) {
        return definitionRepository.findByProcessKey(processKey);
    }

    /**
     * Genera un documento basado en una plantilla HTML/Texto reemplazando placeholders {{variable}}
     */
    public String generateFromTemplate(String templateContent, Map<String, Object> data) {
        if (templateContent == null) return "";
        String result = templateContent;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String placeholder = "\\{\\{" + entry.getKey() + "\\}\\}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replaceAll(placeholder, value);
        }
        return result;
    }

    public StoredDocument generateAndStore(Long definitionId, String instanceId, Map<String, Object> variables, String user) throws Exception {
        DocumentDefinition def = definitionRepository.findById(definitionId)
                .orElseThrow(() -> new RuntimeException("Definición no encontrada"));

        String content = generateFromTemplate(def.getTemplateContent(), variables);
        String fileName = "GENERATED_" + def.getName().replace(" ", "_") + "_" + UUID.randomUUID().toString().substring(0, 8) + ".html";
        
        File directory = new File(STORAGE_DIR);
        if (!directory.exists()) directory.mkdirs();

        Path filePath = Paths.get(STORAGE_DIR + fileName);
        Files.writeString(filePath, content);

        StoredDocument doc = StoredDocument.builder()
                .fileName(fileName)
                .contentType("text/html")
                .storagePath(fileName)
                .processInstanceId(instanceId)
                .definitionId(definitionId)
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(user)
                .build();

        return storedDocumentRepository.save(doc);
    }
}
