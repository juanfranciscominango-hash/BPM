package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ProcessErrorLog;
import com.innovacred.bpm.infrastructure.adapter.persistence.ProcessErrorLogRepository;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.task.api.Task;
import org.flowable.task.api.TaskQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessErrorServiceTest {

    @Mock
    private ProcessErrorLogRepository errorLogRepository;
    
    @Mock
    private RuntimeService runtimeService;
    
    @Mock
    private TaskService taskService;

    @InjectMocks
    private ProcessErrorService processErrorService;

    @Test
    void testLogError() {
        // Given
        TaskQuery query = mock(TaskQuery.class);
        Task task = mock(Task.class);
        
        when(taskService.createTaskQuery()).thenReturn(query);
        when(query.taskId("task-123")).thenReturn(query);
        when(query.singleResult()).thenReturn(task);
        when(task.getName()).thenReturn("Api Call Task");

        Exception simulatedError = new RuntimeException("API connection timeout");

        // When
        processErrorService.logError(
                "instance-456", "flujo_credito", "task-123",
                "API_ERROR", "Fallo al llamar al CRM", simulatedError
        );

        // Then
        ArgumentCaptor<ProcessErrorLog> captor = ArgumentCaptor.forClass(ProcessErrorLog.class);
        verify(errorLogRepository).save(captor.capture());

        ProcessErrorLog savedLog = captor.getValue();
        assertEquals("instance-456", savedLog.getProcessInstanceId());
        assertEquals("API_ERROR", savedLog.getErrorType());
        assertEquals("PENDING", savedLog.getStatus());
        assertEquals("Api Call Task", savedLog.getTaskName());
        assertEquals("Fallo al llamar al CRM", savedLog.getErrorMessage());
    }
}
