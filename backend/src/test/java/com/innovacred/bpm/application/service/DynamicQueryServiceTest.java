package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.dto.CaseQueryRequest;
import com.innovacred.bpm.domain.dto.CaseQueryResult;
import org.flowable.engine.HistoryService;
import org.flowable.engine.TaskService;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.history.HistoricProcessInstanceQuery;
import org.flowable.task.api.Task;
import org.flowable.task.api.TaskQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DynamicQueryServiceTest {

    @Mock
    private HistoryService historyService;

    @Mock
    private TaskService taskService;

    @Mock
    private HistoricProcessInstanceQuery historicQuery;
    
    @Mock
    private TaskQuery taskQuery;

    @InjectMocks
    private DynamicQueryService queryService;

    @Test
    void testExecuteQuery_AllFilters() {
        // Given
        CaseQueryRequest request = new CaseQueryRequest();
        request.setProcessDefinitionKey("FLUJO_CREDITO");
        request.setStatus("OPEN");
        request.setStartedBy("user1");
        request.setCurrentAssignee("asesor1");
        Map<String, Object> vars = new HashMap<>();
        vars.put("monto", 5000);
        request.setVariables(vars);

        when(historyService.createHistoricProcessInstanceQuery()).thenReturn(historicQuery);
        when(historicQuery.includeProcessVariables()).thenReturn(historicQuery);
        when(historicQuery.processDefinitionKey(anyString())).thenReturn(historicQuery);
        when(historicQuery.unfinished()).thenReturn(historicQuery);
        when(historicQuery.startedBy(anyString())).thenReturn(historicQuery);
        when(historicQuery.variableValueEquals(anyString(), any())).thenReturn(historicQuery);
        when(historicQuery.orderByProcessInstanceStartTime()).thenReturn(historicQuery);
        when(historicQuery.desc()).thenReturn(historicQuery);

        HistoricProcessInstance mockPi = mock(HistoricProcessInstance.class);
        when(mockPi.getId()).thenReturn("pi-1");
        when(mockPi.getProcessDefinitionKey()).thenReturn("FLUJO_CREDITO");
        when(mockPi.getStartUserId()).thenReturn("user1");
        when(mockPi.getProcessVariables()).thenReturn(vars);
        when(historicQuery.listPage(0, 10)).thenReturn(Collections.singletonList(mockPi));

        // Mock para la tarea actual
        when(taskService.createTaskQuery()).thenReturn(taskQuery);
        when(taskQuery.processInstanceId("pi-1")).thenReturn(taskQuery);
        Task mockTask = mock(Task.class);
        when(mockTask.getAssignee()).thenReturn("asesor1");
        when(taskQuery.list()).thenReturn(Collections.singletonList(mockTask));

        // When
        List<CaseQueryResult> results = queryService.executeQuery(request);

        // Then
        assertEquals(1, results.size());
        assertEquals("pi-1", results.get(0).getProcessInstanceId());
        assertEquals("asesor1", results.get(0).getCurrentAssignee());
        
        verify(historicQuery).processDefinitionKey("FLUJO_CREDITO");
        verify(historicQuery).unfinished();
        verify(historicQuery).startedBy("user1");
        verify(historicQuery).variableValueEquals("monto", 5000);
    }
}
