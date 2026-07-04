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
    private final com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository userRepository;

    @GetMapping
    public List<TaskResponse> listTasks(@RequestParam(required = false) String assignee) {
        System.out.println("DEBUG: listTasks called with assignee = " + assignee);
        var query = taskService.createTaskQuery().includeProcessVariables();
        
        boolean isAsesorOnly = false;
        if (assignee != null && !assignee.isEmpty()) {
            var userOpt = userRepository.findByUsername(assignee);
            if (userOpt.isPresent()) {
                var roles = userOpt.get().getRoles().stream()
                        .map(com.innovacred.bpm.domain.entity.Role::getName)
                        .collect(Collectors.toList());
                boolean isAdmin = roles.contains("ADMINISTRADOR");
                boolean isAsesor = roles.contains("ASESOR_CREDITO");
                if (isAsesor && !isAdmin) {
                    isAsesorOnly = true;
                }
            }
        }

        if (assignee != null && !assignee.isEmpty()) {
            query.taskCandidateOrAssigned(assignee);
        }
        
        List<Task> list = query.list();
        System.out.println("DEBUG: Flowable query returned " + list.size() + " tasks. Filter as advisor only: " + isAsesorOnly);
        
        if (isAsesorOnly && assignee != null) {
            final String finalAssignee = assignee;
            list = list.stream().filter(t -> {
                // If it is explicitly assigned to this user, show it
                if (finalAssignee.equalsIgnoreCase(t.getAssignee())) {
                    return true;
                }
                
                // Check if any creator variable matches
                Map<String, Object> vars = t.getProcessVariables();
                String creator = null;
                if (vars.containsKey("usuarioCreacion")) {
                    creator = String.valueOf(vars.get("usuarioCreacion"));
                } else if (vars.containsKey("asesor")) {
                    creator = String.valueOf(vars.get("asesor"));
                } else if (vars.containsKey("asesorAsignado")) {
                    creator = String.valueOf(vars.get("asesorAsignado"));
                }
                
                if (creator != null && !creator.trim().isEmpty()) {
                    return creator.equalsIgnoreCase(finalAssignee);
                }
                
                // Fallback: check Flowable process start user ID
                try {
                    org.flowable.engine.runtime.ProcessInstance pi = runtimeService.createProcessInstanceQuery()
                        .processInstanceId(t.getProcessInstanceId())
                        .singleResult();
                    if (pi != null && pi.getStartUserId() != null) {
                        return pi.getStartUserId().equalsIgnoreCase(finalAssignee);
                    }
                } catch (Exception e) {}
                
                return false;
            }).collect(Collectors.toList());
        }

        for (Task t : list) {
            System.out.println("  -> Task ID: " + t.getId() + " | Name: " + t.getName() + " | Assignee: " + t.getAssignee());
        }
        
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/{taskId}/complete")
    public org.springframework.http.ResponseEntity<?> completeTask(@PathVariable String taskId, @RequestBody(required = false) Map<String, Object> variables) {
        try {
            bpmTaskService.completeTask(taskId, variables);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            try {
                java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("c:/ProyectosJava/BMP/backend/error.txt", true));
                e.printStackTrace(pw);
                pw.close();
            } catch (Exception ex) {}
            return org.springframework.http.ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
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

    private String resolveFullName(String username) {
        if (username == null || username.trim().isEmpty() || username.equalsIgnoreCase("Desconocido") || username.equalsIgnoreCase("anonymousUser")) {
            return "Desconocido";
        }
        try {
            var userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent() && userOpt.get().getFullName() != null && !userOpt.get().getFullName().trim().isEmpty()) {
                return userOpt.get().getFullName();
            }
        } catch (Exception e) {
            // Ignore
        }
        return username;
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

        Double monto = 0.0;
        if (processVariables.containsKey("monto")) {
            try {
                monto = Double.valueOf(String.valueOf(processVariables.get("monto")));
            } catch (Exception e) {}
        } else if (processVariables.containsKey("monto_solicitado")) {
            try {
                monto = Double.valueOf(String.valueOf(processVariables.get("monto_solicitado")));
            } catch (Exception e) {}
        }

        Integer plazo = 0;
        if (processVariables.containsKey("plazo")) {
            try {
                plazo = Integer.valueOf(String.valueOf(processVariables.get("plazo")));
            } catch (Exception e) {}
        } else if (processVariables.containsKey("plazo_meses")) {
            try {
                plazo = Integer.valueOf(String.valueOf(processVariables.get("plazo_meses")));
            } catch (Exception e) {}
        }

        String producto = "";
        if (processVariables.containsKey("producto")) {
            producto = String.valueOf(processVariables.get("producto"));
        } else if (processVariables.containsKey("producto_desc")) {
            producto = String.valueOf(processVariables.get("producto_desc"));
        }

        String creator = "";
        if (processVariables.containsKey("usuarioCreacion")) {
            creator = String.valueOf(processVariables.get("usuarioCreacion"));
        } else if (processVariables.containsKey("asesor")) {
            creator = String.valueOf(processVariables.get("asesor"));
        } else if (processVariables.containsKey("asesorAsignado")) {
            creator = String.valueOf(processVariables.get("asesorAsignado"));
        } else if (processVariables.containsKey("initiator")) {
            creator = String.valueOf(processVariables.get("initiator"));
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
                numeroCaso,
                monto,
                plazo,
                producto,
                resolveFullName(creator)
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
            String numeroCaso,
            Double monto,
            Integer plazo,
            String producto,
            String asesor
    ) {}
}
