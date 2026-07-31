package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ProcessDefinition;
import com.innovacred.bpm.application.service.ProcessVariableSchemaService;
import com.innovacred.bpm.application.service.ProcessErrorService;
import com.innovacred.bpm.application.service.TaskActionService;
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
    private final ProcessVariableSchemaService variableSchemaService;
    private final TaskActionService taskActionService;
    private final ProcessErrorService errorService;

    @Transactional
    public void completeTask(String taskId, Map<String, Object> variables) {
        log.info("Completando tarea: {} con variables: {}", taskId, variables);
        
        // 1. Obtener información de la tarea antes de completarla
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw new RuntimeException("Tarea no encontrada");
        }

        // 2. Validar tipos de variables contra el esquema del proceso
        ProcessDefinition procDef = processService.getByProcDefId(task.getProcessDefinitionId());
        String processKey = "";
        if (procDef != null && variables != null && !variables.isEmpty()) {
            processKey = task.getProcessDefinitionId().contains(":")
                    ? task.getProcessDefinitionId().split(":")[0]
                    : task.getProcessDefinitionId();
            variableSchemaService.validateCompleteVariables(processKey, variables);
        }

        try {
            // 2.1 Ejecutar Reglas de Acción ON_EXIT
            if (processKey.isEmpty() && procDef != null) {
                processKey = task.getProcessDefinitionId().contains(":")
                        ? task.getProcessDefinitionId().split(":")[0]
                        : task.getProcessDefinitionId();
            }
            if (!processKey.isEmpty()) {
                taskActionService.executeRulesForEvent(
                        task.getProcessInstanceId(), processKey, task.getTaskDefinitionKey(), task.getId(), "ON_EXIT");
            }

        // 3. Persistencia en tabla de negocio (si el proceso está vinculado a una meta-entidad)
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

        // 4. Completar en Flowable
        taskService.complete(taskId, variables);
        
        } catch (TaskActionService.TaskActionValidationException ex) {
            throw ex; // Permitir que la validación llegue al usuario sin loguear error de sistema
        } catch (Exception ex) {
            errorService.logError(task.getProcessInstanceId(), processKey, taskId, "SYSTEM", 
                    "Error al completar la tarea " + task.getName() + ": " + ex.getMessage(), ex);
            throw new RuntimeException("Ocurrió un error al procesar la tarea: " + ex.getMessage());
        }
    }

    public Map<String, Object> evaluateRule(String taskId, String ruleKey) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) throw new RuntimeException("Tarea no encontrada");

        ProcessDefinition procDef = processService.getByProcDefId(task.getProcessDefinitionId());
        if (procDef == null) throw new RuntimeException("Definición de proceso no encontrada");

        return ruleExecutionService.executeRuleWithProcessContext(ruleKey, procDef, task.getProcessInstanceId());
    }
}
