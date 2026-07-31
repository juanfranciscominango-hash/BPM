package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.WebhookConfig;
import com.innovacred.bpm.infrastructure.adapter.persistence.WebhookConfigRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.HashMap;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookDispatcherServiceTest {

    @Mock
    private WebhookConfigRepository webhookRepository;

    @InjectMocks
    private WebhookDispatcherService webhookDispatcherService;

    @Test
    void testDispatchEvent() {
        // Given
        WebhookConfig config = new WebhookConfig();
        config.setActive(true);
        config.setUrl("http://localhost:9999/dummy-webhook");
        config.setEvents("TASK_COMPLETED");
        config.setProcessDefinitionKey("flujo_credito");

        when(webhookRepository.findByActiveTrue()).thenReturn(Collections.singletonList(config));

        // When
        webhookDispatcherService.dispatchEvent(
                "flujo_credito", "TASK_COMPLETED", "proc-123", "task-456", new HashMap<>()
        );

        // Then
        // Since dispatchEvent is async, we use timeout to wait for the interaction
        verify(webhookRepository, timeout(1000)).findByActiveTrue();
        // We cannot easily verify RestTemplate since it's instantiated inside, 
        // but this verifies the async flow executes correctly and queries the repo.
    }
}
