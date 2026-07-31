package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.TaskSlaConfig;
import com.innovacred.bpm.infrastructure.adapter.persistence.AuditLogRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.NotificationRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TaskSlaConfigRepository;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.task.api.Task;
import org.flowable.task.api.TaskQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskSlaServiceTest {

    @Mock
    private TaskSlaConfigRepository slaConfigRepository;
    @Mock
    private TaskService taskService;
    @Mock
    private RuntimeService runtimeService;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private TaskSlaService taskSlaService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testCalculateSlaStatus_OK() {
        // Given
        Task task = mock(Task.class);
        when(task.getCreateTime()).thenReturn(new Date());
        when(task.getProcessDefinitionId()).thenReturn("process:1:123");
        when(task.getTaskDefinitionKey()).thenReturn("task1");

        TaskSlaConfig config = new TaskSlaConfig();
        config.setActive(true);
        config.setMaxDuration(10);
        config.setTimeUnit("DAYS");
        config.setWarningThresholdPct(80);

        when(slaConfigRepository.findByProcessDefinitionKeyAndTaskDefinitionKey("process", "task1"))
                .thenReturn(Optional.of(config));

        // When
        Map<String, Object> result = taskSlaService.calculateSlaStatus(task);

        // Then
        assertEquals(true, result.get("hasSla"));
        assertEquals("OK", result.get("slaStatus"));
    }

    @Test
    void testCalculateSlaStatus_Expired() {
        // Given
        Task task = mock(Task.class);
        // Create time was 11 days ago
        when(task.getCreateTime()).thenReturn(new Date(System.currentTimeMillis() - 11L * 24 * 3600 * 1000));
        when(task.getProcessDefinitionId()).thenReturn("process:1:123");
        when(task.getTaskDefinitionKey()).thenReturn("task1");

        TaskSlaConfig config = new TaskSlaConfig();
        config.setActive(true);
        config.setMaxDuration(10);
        config.setTimeUnit("DAYS");
        config.setWarningThresholdPct(80);

        when(slaConfigRepository.findByProcessDefinitionKeyAndTaskDefinitionKey("process", "task1"))
                .thenReturn(Optional.of(config));

        // When
        Map<String, Object> result = taskSlaService.calculateSlaStatus(task);

        // Then
        assertEquals(true, result.get("hasSla"));
        assertEquals("EXPIRED", result.get("slaStatus"));
    }

    @Test
    void testReassignTask() {
        // Given
        TaskQuery query = mock(TaskQuery.class);
        Task task = mock(Task.class);
        
        when(taskService.createTaskQuery()).thenReturn(query);
        when(query.taskId("task-123")).thenReturn(query);
        when(query.singleResult()).thenReturn(task);
        
        when(task.getName()).thenReturn("Test Task");
        when(task.getAssignee()).thenReturn("userA");
        when(task.getProcessInstanceId()).thenReturn("proc-456");

        // When
        taskSlaService.reassignTask("task-123", "userB", "admin", "SLA Expired");

        // Then
        verify(taskService).setAssignee("task-123", "userB");
        verify(auditLogRepository).save(any());
        // Verify 2 notifications (one for userB, one for userA)
        verify(notificationRepository, times(2)).save(any());
    }
}
