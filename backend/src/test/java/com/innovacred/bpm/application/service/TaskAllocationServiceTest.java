package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.TaskAllocationRule;
import com.innovacred.bpm.infrastructure.adapter.persistence.TaskAllocationRuleRepository;
import org.flowable.engine.TaskService;
import org.flowable.task.api.Task;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskAllocationServiceTest {

    @Mock
    private TaskAllocationRuleRepository ruleRepository;
    @Mock
    private TaskService flowableTaskService;
    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private TaskAllocationService taskAllocationService;

    @Test
    void testAllocateTask_RoundRobin() {
        // Given
        Task task = mock(Task.class);
        when(task.getId()).thenReturn("task-123");
        when(task.getProcessDefinitionId()).thenReturn("process:1:456");
        when(task.getTaskDefinitionKey()).thenReturn("task1");

        TaskAllocationRule rule = new TaskAllocationRule();
        rule.setActive(true);
        rule.setAllocationMethod("ROUND_ROBIN");
        rule.setCandidateGroup("analistas");

        when(ruleRepository.findByProcessDefinitionKeyAndTaskDefinitionKey("process", "task1"))
                .thenReturn(Optional.of(rule));

        // Mock users in group
        List<String> users = List.of("userA", "userB");
        when(jdbcTemplate.queryForList(anyString(), eq(String.class), eq("analistas")))
                .thenReturn(users);

        // First round robin index (should pick index 0)
        taskAllocationService.allocateTask(task);
        verify(flowableTaskService).setAssignee("task-123", "userA");

        // We could test the cyclic nature but that relies on internal static/instance state map in the service
    }

    @Test
    void testAllocateTask_LeastLoaded() {
        // Given
        Task task = mock(Task.class);
        when(task.getId()).thenReturn("task-123");
        when(task.getProcessDefinitionId()).thenReturn("process:1:456");
        when(task.getTaskDefinitionKey()).thenReturn("task1");

        TaskAllocationRule rule = new TaskAllocationRule();
        rule.setActive(true);
        rule.setAllocationMethod("LEAST_LOADED");
        rule.setCandidateGroup("analistas");

        when(ruleRepository.findByProcessDefinitionKeyAndTaskDefinitionKey("process", "task1"))
                .thenReturn(Optional.of(rule));

        // Mock users in group
        List<String> users = List.of("userA", "userB");
        when(jdbcTemplate.queryForList(startsWith("SELECT u.username FROM sec_user u"), eq(String.class), eq("analistas")))
                .thenReturn(users);

        // Mock active counts (userA has 5, userB has 2)
        List<Map<String, Object>> counts = new ArrayList<>();
        Map<String, Object> mapA = new HashMap<>();
        mapA.put("assignee", "userA");
        mapA.put("cnt", 5L);
        counts.add(mapA);

        Map<String, Object> mapB = new HashMap<>();
        mapB.put("assignee", "userB");
        mapB.put("cnt", 2L);
        counts.add(mapB);

        when(jdbcTemplate.queryForList(startsWith("SELECT COALESCE"))).thenReturn(counts);

        // When
        taskAllocationService.allocateTask(task);

        // Then
        // userB has fewer tasks, so they should be assigned
        verify(flowableTaskService).setAssignee("task-123", "userB");
    }
}
