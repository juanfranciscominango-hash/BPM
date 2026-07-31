package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.DocumentDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.DocumentDefinitionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.StoredDocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentDefinitionRepository definitionRepository;

    @Mock
    private StoredDocumentRepository storedDocumentRepository;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void testSaveDefinition() {
        // Given
        DocumentDefinition definition = new DocumentDefinition();
        definition.setName("Contrato de Credito");
        definition.setExportFormat("PDF");

        DocumentDefinition savedDefinition = new DocumentDefinition();
        savedDefinition.setId(1L);
        savedDefinition.setName("Contrato de Credito");
        savedDefinition.setExportFormat("PDF");

        when(definitionRepository.save(any(DocumentDefinition.class))).thenReturn(savedDefinition);

        // When
        DocumentDefinition result = documentService.saveDefinition(definition);

        // Then
        verify(definitionRepository).save(definition);
        assertEquals(1L, result.getId());
        assertEquals("Contrato de Credito", result.getName());
    }
}
