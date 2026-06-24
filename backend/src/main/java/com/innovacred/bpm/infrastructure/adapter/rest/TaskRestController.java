package com.innovacred.bpm.infrastructure.adapter.rest;

import lombok.RequiredArgsConstructor;
import org.flowable.task.api.Task;
import org.flowable.engine.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskRestController {

    private final TaskService taskService;
    private final com.innovacred.bpm.application.service.BpmTaskService bpmTaskService;

    @GetMapping
    public List<TaskResponse> listTasks(@RequestParam(required = false) String assignee) {
        var query = taskService.createTaskQuery();
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
        return new TaskResponse(
                task.getId(),
                task.getName(),
                task.getAssignee(),
                task.getCreateTime().toString(),
                task.getProcessInstanceId(),
                task.getProcessDefinitionId(),
                task.getTaskDefinitionKey()
        );
    }

    public record TaskResponse(
            String id,
            String name,
            String assignee,
            String createTime,
            String processInstanceId,
            String processDefinitionId,
            String taskDefinitionKey
    ) {}
}
