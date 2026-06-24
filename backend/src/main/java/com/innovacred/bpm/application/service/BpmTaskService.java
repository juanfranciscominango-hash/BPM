package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ProcessDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.task.api.Task;
import org.flowable.engine.TaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BpmTaskService {

    private final TaskService taskService;
    private final ProcessService processService;
    private final MetaService metaService;
    private final TableGeneratorService tableGeneratorService;
    private final RuleExecutionService ruleExecutionService;

    @Transactional
    public void completeTask(String taskId, Map<String, Object> variables) {
        log.info("Completando tarea: {} con variables: {}", taskId, variables);
        
        // 1. Obtener información de la tarea antes de completarla
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw new RuntimeException("Tarea no encontrada");
        }

        // 2. Persistencia en tabla de negocio (si el proceso está vinculado a una meta-entidad)
        ProcessDefinition procDef = processService.getByProcDefId(task.getProcessDefinitionId());
        
        if (procDef != null && procDef.getMetaEntityId() != null && variables != null && !variables.isEmpty()) {
            var entity = metaService.listarEntidades().stream()
                    .filter(e -> e.getId().equals(procDef.getMetaEntityId()))
                    .findFirst().orElse(null);
            
            if (entity != null) {
                var attributes = metaService.listarAtributos(entity.getId());
                tableGeneratorService.generateTable(entity, attributes);
                tableGeneratorService.insertData(entity, attributes, variables, task.getProcessInstanceId());
            }
        }

        // 3. Completar en Flowable
        taskService.complete(taskId, variables);
    }

    public Map<String, Object> evaluateRule(String taskId, String ruleKey) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) throw new RuntimeException("Tarea no encontrada");

        ProcessDefinition procDef = processService.getByProcDefId(task.getProcessDefinitionId());
        if (procDef == null) throw new RuntimeException("Definición de proceso no encontrada");

        return ruleExecutionService.executeRuleWithProcessContext(ruleKey, procDef, task.getProcessInstanceId());
    }
}
