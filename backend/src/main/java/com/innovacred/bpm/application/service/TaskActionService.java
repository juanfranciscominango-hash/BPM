package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.TaskActionRule;
import com.innovacred.bpm.infrastructure.adapter.persistence.TaskActionRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskActionService {

    private final TaskActionRuleRepository ruleRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final ProcessErrorService errorService;

    private final ExpressionParser parser = new SpelExpressionParser();

    // ── CRUD ──

    public List<TaskActionRule> getRulesByProcess(String processDefKey) {
        return ruleRepository.findByProcessDefinitionKey(processDefKey);
    }
    
    public List<TaskActionRule> getRulesByProcessAndTask(String processDefKey, String taskDefKey) {
        return ruleRepository.findByProcessDefinitionKeyAndTaskDefinitionKey(processDefKey, taskDefKey);
    }

    public Optional<TaskActionRule> getRuleById(Long id) {
        return ruleRepository.findById(id);
    }

    @Transactional
    public TaskActionRule saveRule(TaskActionRule rule) {
        return ruleRepository.save(rule);
    }

    @Transactional
    public void deleteRule(Long id) {
        ruleRepository.deleteById(id);
    }

    // ── EJECUCIÓN DE REGLAS ──

    /**
     * Evalúa y ejecuta todas las reglas configuradas para un evento de tarea.
     */
    public void executeRulesForEvent(String processInstanceId, String processDefKey, String taskDefKey, String taskId, String eventTrigger) {
        List<TaskActionRule> rules = ruleRepository.findByProcessDefinitionKeyAndTaskDefinitionKeyAndEventTriggerAndActiveTrueOrderBySortOrderAsc(
                processDefKey, taskDefKey, eventTrigger);

        if (rules.isEmpty()) return;

        if (processInstanceId == null && taskId != null) {
            org.flowable.task.api.Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task != null) {
                processInstanceId = task.getProcessInstanceId();
            }
        }

        Map<String, Object> variables = processInstanceId != null ? runtimeService.getVariables(processInstanceId) : Map.of();
        StandardEvaluationContext context = new StandardEvaluationContext(variables);
        // Agregar variables directamente como properties del context
        variables.forEach(context::setVariable);
        context.setVariable("processInstanceId", processInstanceId);
        context.setVariable("taskId", taskId);

        for (TaskActionRule rule : rules) {
            try {
                // 1. Verificar condición de ejecución
                if (rule.getConditionExpression() != null && !rule.getConditionExpression().isBlank()) {
                    Boolean shouldExecute = evaluateBooleanExpression(rule.getConditionExpression(), context);
                    if (Boolean.FALSE.equals(shouldExecute)) {
                        continue;
                    }
                }

                // 2. Ejecutar acción según el tipo
                executeAction(rule, context, variables, processInstanceId, taskId);

            } catch (TaskActionValidationException ex) {
                // Relanzar validaciones para que lleguen al usuario
                throw ex;
            } catch (Exception ex) {
                log.error("Error ejecutando regla '{}' en tarea '{}': {}", rule.getRuleName(), taskDefKey, ex.getMessage());
                // Registrar error en ProcessErrorLog
                errorService.logError(processInstanceId, processDefKey, taskId, "SYSTEM", 
                        "Error evaluando regla de tarea: " + rule.getRuleName(), ex);
                throw new RuntimeException("Error en regla de negocio: " + rule.getRuleName());
            }
        }
    }

    private void executeAction(TaskActionRule rule, StandardEvaluationContext context, Map<String, Object> variables, String processInstanceId, String taskId) {
        log.info("Ejecutando regla '{}' ({})", rule.getRuleName(), rule.getActionType());
        
        switch (rule.getActionType()) {
            case "VALIDATION" -> {
                Boolean isValid = evaluateBooleanExpression(rule.getActionExpression(), context);
                if (Boolean.FALSE.equals(isValid)) {
                    throw new TaskActionValidationException(rule.getErrorMessage() != null ? rule.getErrorMessage() : "Validación fallida");
                }
            }
            case "ASSIGNMENT" -> {
                Object result = evaluateExpression(rule.getActionExpression(), context);
                String target = rule.getTargetVariable();
                if (target != null && !target.isBlank()) {
                    runtimeService.setVariable(processInstanceId, target, result);
                    variables.put(target, result);
                    context.setVariable(target, result);
                }
            }
            case "EXPRESSION" -> {
                evaluateExpression(rule.getActionExpression(), context);
            }
            case "NOTIFICATION" -> {
                // Aquí se integraría con NotificationService
                log.info("Simulando Notificación: {} -> {}", rule.getTargetUser(), rule.getActionExpression());
            }
            case "API_CALL" -> {
                // Aquí se integraría con el ApiManagerService
                log.info("Simulando Llamada API: {}", rule.getActionExpression());
            }
        }
    }

    private Boolean evaluateBooleanExpression(String expression, StandardEvaluationContext context) {
        // Adaptar sintaxis Bizagi/JUEL ${...} a SPEL si es necesario, o evaluar directo
        String exp = expression.startsWith("${") && expression.endsWith("}") 
                ? expression.substring(2, expression.length() - 1) 
                : expression;
        
        Expression parsedExpression = parser.parseExpression(exp);
        return parsedExpression.getValue(context, Boolean.class);
    }

    private Object evaluateExpression(String expression, StandardEvaluationContext context) {
        String exp = expression.startsWith("${") && expression.endsWith("}") 
                ? expression.substring(2, expression.length() - 1) 
                : expression;
                
        Expression parsedExpression = parser.parseExpression(exp);
        return parsedExpression.getValue(context);
    }

    public static class TaskActionValidationException extends RuntimeException {
        public TaskActionValidationException(String message) {
            super(message);
        }
    }
}
