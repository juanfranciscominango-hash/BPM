package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ExternalProcess;
import com.innovacred.bpm.domain.entity.TramaField;
import com.innovacred.bpm.infrastructure.adapter.persistence.ExternalProcessRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TramaFieldRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExternalProcessServiceTest {

    @Mock
    private ExternalProcessRepository externalProcessRepository;

    @Mock
    private TramaFieldRepository tramaFieldRepository;

    @Mock
    private ExternalApiService externalApiService;

    @InjectMocks
    private ExternalProcessService externalProcessService;

    @Test
    void testExecuteProcess() {
        // Given
        ExternalProcess process = new ExternalProcess();
        process.setId(1L);
        process.setCode("FLUJO_CREDITO");

        when(externalProcessRepository.findByCode("FLUJO_CREDITO")).thenReturn(Optional.of(process));
        
        TramaField field = new TramaField();
        field.setId(100L);
        field.setName("clientId");
        field.setDefaultValue("");
        when(tramaFieldRepository.findByProcessIdAndTramaType(1L, "INPUT")).thenReturn(Collections.singletonList(field));

        when(externalApiService.executeApiWithBody(eq("FLUJO_CREDITO"), anyString(), anyMap()))
                .thenReturn(ResponseEntity.ok("{\"status\":\"SUCCESS\"}"));

        Map<String, Object> variables = new HashMap<>();
        variables.put("clientId", "12345");

        // When
        Map<String, Object> result = externalProcessService.executeProcess("FLUJO_CREDITO", variables);

        // Then
        verify(externalApiService).executeApiWithBody(eq("FLUJO_CREDITO"), anyString(), eq(variables));
        // En caso de éxito no lanza excepción
    }
}
