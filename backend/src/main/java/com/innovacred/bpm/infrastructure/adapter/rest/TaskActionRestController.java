package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.TaskActionService;
import com.innovacred.bpm.domain.entity.TaskActionRule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/task-actions")
@RequiredArgsConstructor
public class TaskActionRestController {

    private final TaskActionService actionService;

    @GetMapping("/process/{processDefKey}")
    public List<TaskActionRule> getByProcess(@PathVariable String processDefKey) {
        return actionService.getRulesByProcess(processDefKey);
    }

    @GetMapping("/process/{processDefKey}/task/{taskDefKey}")
    public List<TaskActionRule> getByTask(@PathVariable String processDefKey, @PathVariable String taskDefKey) {
        return actionService.getRulesByProcessAndTask(processDefKey, taskDefKey);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskActionRule> getById(@PathVariable Long id) {
        return actionService.getRuleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TaskActionRule create(@RequestBody TaskActionRule rule) {
        return actionService.saveRule(rule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskActionRule> update(@PathVariable Long id, @RequestBody TaskActionRule rule) {
        return actionService.getRuleById(id).map(existing -> {
            rule.setId(id);
            rule.setCreatedAt(existing.getCreatedAt());
            return ResponseEntity.ok(actionService.saveRule(rule));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (actionService.getRuleById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        actionService.deleteRule(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Evalúa las reglas de un evento específico (ej. ON_SAVE, ON_EXIT).
     * El frontend lo llama para ejecutar validaciones y acciones sin completar la tarea en Flowable.
     */
    @PostMapping("/evaluate/{eventTrigger}/{processDefKey}/{taskDefKey}/{taskId}")
    public ResponseEntity<?> evaluateEvent(
            @PathVariable String eventTrigger,
            @PathVariable String processDefKey,
            @PathVariable String taskDefKey,
            @PathVariable String taskId,
            @RequestBody Map<String, Object> currentVariables) {
        
        try {
            // Evaluamos y si todo está bien, simplemente retorna OK.
            actionService.executeRulesForEvent(
                    // Process instance id will be taken from runtime if needed, 
                    // or we pass it in the body. Let's assume we can get it from task
                    // Or we just rely on the service to get it from taskId.
                    // For now, pass a dummy or require processInstanceId in path if needed.
                    // Let's modify executeRulesForEvent in service or get processInstanceId here.
                    null, // we will fix this in a sec
                    processDefKey, taskDefKey, taskId, eventTrigger);
            return ResponseEntity.ok(Map.of("success", true, "message", "Evaluación exitosa"));
        } catch (TaskActionService.TaskActionValidationException ex) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "error", ex.getMessage()));
        }
    }
}
