package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.dto.CaseQueryRequest;
import com.innovacred.bpm.domain.dto.CaseQueryResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.HistoryService;
import org.flowable.engine.TaskService;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.history.HistoricProcessInstanceQuery;
import org.flowable.task.api.Task;
import org.flowable.variable.api.history.HistoricVariableInstance;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicQueryService {

    private final HistoryService historyService;
    private final TaskService taskService;

    /**
     * Resuelve una consulta dinámica de Casos (Process Instances) basada en múltiples filtros
     */
    public List<CaseQueryResult> executeQuery(CaseQueryRequest request) {
        log.info("Ejecutando consulta dinámica: {}", request);

        HistoricProcessInstanceQuery query = historyService.createHistoricProcessInstanceQuery()
                .includeProcessVariables();

        // 1. Filtros de Proceso
        if (request.getProcessDefinitionKey() != null && !request.getProcessDefinitionKey().trim().isEmpty()) {
            query.processDefinitionKey(request.getProcessDefinitionKey());
        }

        if ("OPEN".equalsIgnoreCase(request.getStatus())) {
            query.unfinished();
        } else if ("CLOSED".equalsIgnoreCase(request.getStatus())) {
            query.finished();
        }

        if (request.getCreatedAfter() != null) {
            query.startedAfter(request.getCreatedAfter());
        }
        if (request.getCreatedBefore() != null) {
            query.startedBefore(request.getCreatedBefore());
        }

        // 2. Filtros de Usuario (Creador)
        if (request.getStartedBy() != null && !request.getStartedBy().trim().isEmpty()) {
            query.startedBy(request.getStartedBy());
        }

        // 3. Filtro por Variables de Negocio
        if (request.getVariables() != null && !request.getVariables().isEmpty()) {
            for (Map.Entry<String, Object> entry : request.getVariables().entrySet()) {
                if (entry.getValue() instanceof String) {
                    query.variableValueLikeIgnoreCase(entry.getKey(), "%" + entry.getValue() + "%");
                } else {
                    query.variableValueEquals(entry.getKey(), entry.getValue());
                }
            }
        }

        // Ejecutar consulta base de procesos
        query.orderByProcessInstanceStartTime().desc();
        List<HistoricProcessInstance> processInstances = query.listPage(request.getStart(), request.getSize());

        // 4. Mapeo de Resultados y Cruce con Tareas Activas (Current Assignee)
        List<CaseQueryResult> results = new ArrayList<>();
        
        for (HistoricProcessInstance pi : processInstances) {
            String currentAssignee = null;
            
            // Si el proceso no ha terminado, buscar la tarea activa para saber quién lo tiene
            if (pi.getEndTime() == null) {
                List<Task> activeTasks = taskService.createTaskQuery()
                        .processInstanceId(pi.getId())
                        .list();
                if (!activeTasks.isEmpty()) {
                    currentAssignee = activeTasks.get(0).getAssignee();
                }
            }

            // Aplicar Filtro de Current Assignee (Filtro en memoria post-query para simplificar)
            if (request.getCurrentAssignee() != null && !request.getCurrentAssignee().trim().isEmpty()) {
                if (currentAssignee == null || !currentAssignee.equalsIgnoreCase(request.getCurrentAssignee())) {
                    continue; // Saltar este caso si no coincide el assignee actual
                }
            }

            // Mapear variables del proceso al resultado
            Map<String, Object> processVariables = pi.getProcessVariables();
            if (processVariables == null) {
                processVariables = new HashMap<>();
            }

            CaseQueryResult result = CaseQueryResult.builder()
                    .processInstanceId(pi.getId())
                    .processDefinitionKey(pi.getProcessDefinitionKey())
                    .processDefinitionName(pi.getProcessDefinitionName())
                    .startedBy(pi.getStartUserId())
                    .startTime(pi.getStartTime())
                    .endTime(pi.getEndTime())
                    .currentAssignee(currentAssignee)
                    .variables(processVariables)
                    .build();
                    
            results.add(result);
        }

        return results;
    }
}
