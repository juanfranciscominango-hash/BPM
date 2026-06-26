package com.innovacred.bpm.infrastructure.adapter.rest;

import lombok.RequiredArgsConstructor;
import org.flowable.task.api.Task;
import org.flowable.engine.TaskService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskRestController {

    private final TaskService taskService;
    private final RepositoryService repositoryService;
    private final RuntimeService runtimeService;
    private final com.innovacred.bpm.application.service.BpmTaskService bpmTaskService;

    @GetMapping
    public List<TaskResponse> listTasks(@RequestParam(required = false) String assignee) {
        var query = taskService.createTaskQuery().includeProcessVariables();
        if (assignee != null && !assignee.isEmpty()) {
            query.taskCandidateOrAssigned(assignee);
        }
        
        return query.list().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/{taskId}/complete")
    public void completeTask(@PathVariable String taskId, @RequestBody(required = false) Map<String, Object> variables) {
        bpmTaskService.completeTask(taskId, variables);
    }

    @PostMapping("/{taskId}/evaluate-rule/{ruleKey}")
    public Map<String, Object> evaluateRuleForTask(
            @PathVariable String taskId, 
            @PathVariable String ruleKey) {
        return bpmTaskService.evaluateRule(taskId, ruleKey);
    }

    @GetMapping("/{taskId}/variables")
    public Map<String, Object> getTaskVariables(@PathVariable String taskId) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task != null) {
            return taskService.getVariables(taskId);
        }
        return Map.of();
    }

    @PostMapping("/{taskId}/variables")
    public void saveTaskVariables(@PathVariable String taskId, @RequestBody Map<String, Object> variables) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task != null && variables != null) {
            taskService.setVariables(taskId, variables);
        }
    }

    private TaskResponse mapToResponse(Task task) {
        Map<String, Object> processVariables = task.getProcessVariables();
        
        String ident = "";
        if (processVariables.containsKey("identificacion")) {
            ident = String.valueOf(processVariables.get("identificacion"));
        } else if (processVariables.containsKey("interviniente_int_identificacion")) {
            ident = String.valueOf(processVariables.get("interviniente_int_identificacion"));
        }

        String nombres = "";
        if (processVariables.containsKey("nombres")) {
            nombres = String.valueOf(processVariables.get("nombres"));
        } else if (processVariables.containsKey("interviniente_int_nombres_completos")) {
            nombres = String.valueOf(processVariables.get("interviniente_int_nombres_completos"));
        }

        String processName = task.getProcessDefinitionId();
        try {
            processName = repositoryService.getProcessDefinition(task.getProcessDefinitionId()).getName();
        } catch (Exception e) {
            // fallback if null or not found
        }

        String numeroCaso = task.getProcessInstanceId(); // default fallback
        try {
            org.flowable.engine.runtime.ProcessInstance pi = runtimeService.createProcessInstanceQuery().processInstanceId(task.getProcessInstanceId()).singleResult();
            if (pi != null && pi.getName() != null && !pi.getName().trim().isEmpty()) {
                numeroCaso = pi.getName();
            }
        } catch (Exception e) {}

        return new TaskResponse(
                task.getId(),
                task.getName(),
                task.getAssignee(),
                task.getCreateTime() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(task.getCreateTime()) : null,
                task.getProcessInstanceId(),
                task.getProcessDefinitionId(),
                task.getTaskDefinitionKey(),
                processName,
                ident,
                nombres,
                numeroCaso
        );
    }

    public record TaskResponse(
            String id,
            String name,
            String assignee,
            String createTime,
            String processInstanceId,
            String processDefinitionId,
            String taskDefinitionKey,
            String processName,
            String identificacion,
            String nombreCompleto,
            String numeroCaso
    ) {}
}
