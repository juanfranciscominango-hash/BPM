package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ProcessService;
import com.innovacred.bpm.application.service.ProcessVariableSchemaService;
import com.innovacred.bpm.domain.entity.ProcessDefinition;
import com.innovacred.bpm.infrastructure.aspect.Auditable;
import lombok.RequiredArgsConstructor;
import org.flowable.engine.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/processes")
@RequiredArgsConstructor
public class ProcessRestController {

    private final ProcessService processService;
    private final ProcessVariableSchemaService schemaService;
    private final TaskService taskService;

    @GetMapping
    public List<ProcessDefinition> listAll() {
        return processService.listAll();
    }

    @PostMapping
    @Auditable(accion = "GUARDAR_PROCESO", entidad = "DefinicionProceso")
    public ProcessDefinition save(@RequestBody ProcessDefinition process) {
        return processService.save(process);
    }

    @PostMapping("/{id}/deploy")
    @Auditable(accion = "DESPLEGAR_PROCESO", entidad = "DefinicionProceso")
    public ProcessDefinition deploy(@PathVariable Long id) {
        return processService.deploy(id);
    }

    @PostMapping("/{key}/start")
    @Auditable(accion = "INICIAR_TRAMITE", entidad = "InstanciaProceso")
    public ResponseEntity<?> start(@PathVariable String key, @RequestBody Map<String, Object> variables) {
        try {
            // Validar y enriquecer con valores por defecto antes de iniciar
            Map<String, Object> enriched = schemaService.validateAndEnrichStartVariables(key, variables);
            processService.startInstance(key, enriched);
            return ResponseEntity.ok(Map.of("message", "Proceso iniciado correctamente"));
        } catch (ProcessVariableSchemaService.ProcessVariableValidationException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Variables inválidas",
                    "errors", ex.getErrors()
            ));
        }
    }

    /** Reclamar una tarea al abrirla (bloqueo optimista) */
    @PostMapping("/tasks/{taskId}/claim")
    public ResponseEntity<Map<String, String>> claimTask(
            @PathVariable String taskId, @RequestBody Map<String, String> body) {
        String username = body != null ? body.get("username") : null;
        try {
            var task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task != null && username != null) {
                taskService.claim(taskId, username);
            }
            return ResponseEntity.ok(Map.of("message", "Tarea reclamada"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("message", "Tarea ya asignada"));
        }
    }

    /** Liberar una tarea (al cerrar sin completar) */
    @PostMapping("/tasks/{taskId}/unclaim")
    public ResponseEntity<Map<String, String>> unclaimTask(@PathVariable String taskId) {
        try {
            var task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task != null && task.getAssignee() != null) {
                taskService.unclaim(taskId);
            }
            return ResponseEntity.ok(Map.of("message", "Tarea liberada"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("message", "Tarea liberada"));
        }
    }

    @GetMapping("/{id}")
    public ProcessDefinition getById(@PathVariable Long id) {
        return processService.getById(id);
    }

    @GetMapping("/definition/{procDefId}")
    public ProcessDefinition getByProcDefId(@PathVariable String procDefId) {
        return processService.getByProcDefId(procDefId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        processService.delete(id);
    }
}
