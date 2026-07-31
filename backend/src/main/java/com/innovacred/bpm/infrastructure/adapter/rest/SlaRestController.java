package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.TaskSlaService;
import com.innovacred.bpm.domain.entity.TaskSlaConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sla")
@RequiredArgsConstructor
public class SlaRestController {

    private final TaskSlaService taskSlaService;

    // ────── CRUD de configuración de SLAs ──────

    @GetMapping("/configs")
    public List<TaskSlaConfig> getAllConfigs() {
        return taskSlaService.findAll();
    }

    @GetMapping("/configs/process/{processKey}")
    public List<TaskSlaConfig> getByProcess(@PathVariable String processKey) {
        return taskSlaService.findByProcess(processKey);
    }

    @GetMapping("/configs/{id}")
    public ResponseEntity<TaskSlaConfig> getById(@PathVariable Long id) {
        return taskSlaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/configs")
    public TaskSlaConfig createConfig(@RequestBody TaskSlaConfig config) {
        return taskSlaService.save(config);
    }

    @PutMapping("/configs/{id}")
    public ResponseEntity<TaskSlaConfig> updateConfig(
            @PathVariable Long id, @RequestBody TaskSlaConfig config) {
        return taskSlaService.findById(id)
                .map(existing -> {
                    config.setId(id);
                    config.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(taskSlaService.save(config));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/configs/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        if (taskSlaService.findById(id).isPresent()) {
            taskSlaService.delete(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ────── Reasignación y Delegación ──────

    @PostMapping("/tasks/{taskId}/reassign")
    public ResponseEntity<Map<String, String>> reassignTask(
            @PathVariable String taskId,
            @RequestBody Map<String, String> body) {
        String newAssignee = body.get("newAssignee");
        String requestedBy = body.get("requestedBy");
        String reason = body.get("reason");

        if (newAssignee == null || newAssignee.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "El campo 'newAssignee' es obligatorio"));
        }

        taskSlaService.reassignTask(taskId, newAssignee, requestedBy, reason);
        return ResponseEntity.ok(Map.of(
                "message", "Tarea reasignada correctamente a " + newAssignee));
    }

    @PostMapping("/tasks/{taskId}/delegate")
    public ResponseEntity<Map<String, String>> delegateTask(
            @PathVariable String taskId,
            @RequestBody Map<String, String> body) {
        String delegateTo = body.get("delegateTo");
        String requestedBy = body.get("requestedBy");
        String reason = body.get("reason");

        if (delegateTo == null || delegateTo.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "El campo 'delegateTo' es obligatorio"));
        }

        taskSlaService.delegateTask(taskId, delegateTo, requestedBy, reason);
        return ResponseEntity.ok(Map.of(
                "message", "Tarea delegada correctamente a " + delegateTo));
    }

    // ────── Forzar chequeo de SLAs (para admin) ──────

    @PostMapping("/check-expired")
    public ResponseEntity<Map<String, String>> forceCheckExpired() {
        taskSlaService.checkExpiredTasks();
        return ResponseEntity.ok(Map.of("message", "Verificación de SLAs ejecutada"));
    }
}
