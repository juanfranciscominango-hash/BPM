package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.runtime.ProcessInstance;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/instances")
@RequiredArgsConstructor
public class InstanceRestController {

    private final RuntimeService runtimeService;
    private final HistoryService historyService;
    private final TaskService taskService;
    private final UserAccountRepository userRepository;

    @GetMapping("/active")
    public List<InstanceResponse> listActive() {
        return runtimeService.createProcessInstanceQuery()
                .list().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/history")
    public List<InstanceResponse> listHistory() {
        return historyService.createHistoricProcessInstanceQuery()
                .orderByProcessInstanceStartTime().desc()
                .list().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{instanceId}")
    public InstanceResponse getInstance(@PathVariable String instanceId) {
        HistoricProcessInstance instance = historyService.createHistoricProcessInstanceQuery()
                .processInstanceId(instanceId)
                .singleResult();
        if (instance != null) {
            return mapToResponse(instance);
        }
        throw new RuntimeException("Proceso no encontrado");
    }

    @GetMapping("/{instanceId}/active-activities")
    public List<String> getActiveActivities(@PathVariable String instanceId) {
        return runtimeService.getActiveActivityIds(instanceId);
    }

    @GetMapping("/{instanceId}/history-activities")
    public List<String> getHistoryActivities(@PathVariable String instanceId) {
        return historyService.createHistoricActivityInstanceQuery()
                .processInstanceId(instanceId)
                .finished()
                .list()
                .stream()
                .map(org.flowable.engine.history.HistoricActivityInstance::getActivityId)
                .distinct()
                .collect(Collectors.toList());
    }

    @GetMapping("/{instanceId}/timeline")
    public List<TimelineItemResponse> getTimeline(@PathVariable String instanceId) {
        return historyService.createHistoricTaskInstanceQuery()
                .processInstanceId(instanceId)
                .orderByHistoricTaskInstanceStartTime().asc()
                .list()
                .stream()
                .map(task -> new TimelineItemResponse(
                        task.getId(),
                        task.getName(),
                        task.getAssignee(),
                        task.getStartTime() != null ? task.getStartTime().toInstant().toString() : null,
                        task.getEndTime() != null ? task.getEndTime().toInstant().toString() : null,
                        task.getEndTime() != null ? "COMPLETED" : "ACTIVE"
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/{instanceId}/tracking")
    public List<TrackingItemResponse> getTracking(@PathVariable String instanceId) {
        return historyService.createHistoricTaskInstanceQuery()
                .processInstanceId(instanceId)
                .includeTaskLocalVariables()
                .orderByHistoricTaskInstanceStartTime().asc()
                .list()
                .stream()
                .map(task -> {
                    String respuesta = "";
                    String observaciones = "";
                    if (task.getTaskLocalVariables() != null) {
                        if (task.getTaskLocalVariables().containsKey("respuesta")) {
                            respuesta = String.valueOf(task.getTaskLocalVariables().get("respuesta"));
                        }
                        if (task.getTaskLocalVariables().containsKey("observaciones")) {
                            observaciones = String.valueOf(task.getTaskLocalVariables().get("observaciones"));
                        }
                    }

                    String situacion = "-";
                    if (task.getDueDate() != null && task.getEndTime() != null) {
                        if (task.getEndTime().after(task.getDueDate())) {
                            situacion = "Vencida";
                        } else {
                            situacion = "A tiempo";
                        }
                    }

                    return new TrackingItemResponse(
                            task.getId(),
                            task.getName(),
                            task.getAssignee(),
                            task.getStartTime() != null ? task.getStartTime().toInstant().toString() : null,
                            task.getEndTime() != null ? task.getEndTime().toInstant().toString() : null,
                            task.getClaimTime() != null ? task.getClaimTime().toInstant().toString() : null,
                            task.getEndTime() != null ? "COMPLETED" : "ACTIVE",
                            respuesta,
                            observaciones,
                            situacion
                    );
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/{instanceId}/export-tracking")
    public ResponseEntity<Resource> exportTracking(@PathVariable String instanceId) {
        List<TrackingItemResponse> tracking = getTracking(instanceId);
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Tarea,Asignado,Inicio,Fin,Reclamo,Estado,Respuesta,Observaciones,Situacion\n");
        
        for (TrackingItemResponse item : tracking) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    item.id() != null ? item.id().replace("\"", "\"\"") : "",
                    item.name() != null ? item.name().replace("\"", "\"\"") : "",
                    item.assignee() != null ? item.assignee().replace("\"", "\"\"") : "",
                    item.startTime() != null ? item.startTime() : "",
                    item.endTime() != null ? item.endTime() : "",
                    item.claimTime() != null ? item.claimTime() : "",
                    item.state() != null ? item.state() : "",
                    item.respuesta() != null ? item.respuesta().replace("\"", "\"\"") : "",
                    item.observaciones() != null ? item.observaciones().replace("\"", "\"\"") : "",
                    item.situacion() != null ? item.situacion() : ""
            ));
        }

        ByteArrayResource resource = new ByteArrayResource(csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tracking_" + instanceId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }

    @DeleteMapping("/{instanceId}")
    public void deleteProcessInstance(@PathVariable String instanceId, @RequestParam(required = false, defaultValue = "Cancelled by user") String reason) {
        runtimeService.deleteProcessInstance(instanceId, reason);
    }

    private String resolveFullName(String startUserId) {
        if (startUserId == null || startUserId.trim().isEmpty() || startUserId.equalsIgnoreCase("Desconocido")) {
            return "Desconocido";
        }
        try {
            var userOpt = userRepository.findByUsername(startUserId);
            if (userOpt.isPresent() && userOpt.get().getFullName() != null && !userOpt.get().getFullName().trim().isEmpty()) {
                return userOpt.get().getFullName();
            }
        } catch (Exception e) {
            // Ignore
        }
        return startUserId;
    }

    private InstanceResponse mapToResponse(ProcessInstance instance) {
        String currentActivity = "En proceso";
        var activeTasks = taskService.createTaskQuery().processInstanceId(instance.getId()).list();
        if (activeTasks != null && !activeTasks.isEmpty()) {
            currentActivity = activeTasks.stream()
                    .map(org.flowable.task.api.Task::getName)
                    .collect(Collectors.joining(", "));
        }
        
        String startUserId = instance.getStartUserId();
        if (startUserId == null || startUserId.trim().isEmpty()) {
            try {
                Object val = runtimeService.getVariable(instance.getId(), "usuarioCreacion");
                if (val != null) {
                    startUserId = String.valueOf(val);
                } else {
                    val = runtimeService.getVariable(instance.getId(), "initiator");
                    if (val != null) {
                        startUserId = String.valueOf(val);
                    }
                }
            } catch (Exception e) {
                // Ignore
            }
        }

        return new InstanceResponse(
                instance.getId(),
                instance.getProcessDefinitionId(),
                instance.getProcessDefinitionKey(),
                instance.getProcessDefinitionName(),
                "ACTIVE",
                instance.getStartTime() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(instance.getStartTime()) : null,
                null,
                resolveFullName(startUserId),
                currentActivity
        );
    }

    private InstanceResponse mapToResponse(HistoricProcessInstance instance) {
        String currentActivity = "Finalizado";
        if (instance.getEndTime() == null) {
            var activeTasks = taskService.createTaskQuery().processInstanceId(instance.getId()).list();
            if (activeTasks != null && !activeTasks.isEmpty()) {
                currentActivity = activeTasks.stream()
                        .map(org.flowable.task.api.Task::getName)
                        .collect(Collectors.joining(", "));
            } else {
                currentActivity = "En proceso";
            }
        }

        String startUserId = instance.getStartUserId();
        if (startUserId == null || startUserId.trim().isEmpty()) {
            try {
                var varInstance = historyService.createHistoricVariableInstanceQuery()
                        .processInstanceId(instance.getId())
                        .variableName("usuarioCreacion")
                        .singleResult();
                if (varInstance != null && varInstance.getValue() != null) {
                    startUserId = String.valueOf(varInstance.getValue());
                } else {
                    varInstance = historyService.createHistoricVariableInstanceQuery()
                            .processInstanceId(instance.getId())
                            .variableName("initiator")
                            .singleResult();
                    if (varInstance != null && varInstance.getValue() != null) {
                        startUserId = String.valueOf(varInstance.getValue());
                    }
                }
            } catch (Exception e) {
                // Ignore
            }
        }

        return new InstanceResponse(
                instance.getId(),
                instance.getProcessDefinitionId(),
                instance.getProcessDefinitionKey(),
                instance.getProcessDefinitionName(),
                instance.getEndTime() != null ? "COMPLETED" : "ACTIVE",
                instance.getStartTime() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(instance.getStartTime()) : null,
                instance.getEndTime() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(instance.getEndTime()) : null,
                resolveFullName(startUserId),
                currentActivity
        );
    }

    public record InstanceResponse(
            String id,
            String processDefinitionId,
            String processDefinitionKey,
            String processDefinitionName,
            String status,
            String startTime,
            String endTime,
            String startUserId,
            String currentActivity
    ) {}

    public record TimelineItemResponse(
            String id,
            String name,
            String assignee,
            String startTime,
            String endTime,
            String state
    ) {}

    public record TrackingItemResponse(
            String id,
            String name,
            String assignee,
            String startTime,
            String endTime,
            String claimTime,
            String state,
            String respuesta,
            String observaciones,
            String situacion
    ) {}
}
