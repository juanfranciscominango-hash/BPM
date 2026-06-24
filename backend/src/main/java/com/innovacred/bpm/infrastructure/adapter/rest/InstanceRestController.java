package com.innovacred.bpm.infrastructure.adapter.rest;

import lombok.RequiredArgsConstructor;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.runtime.ProcessInstance;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/instances")
@RequiredArgsConstructor
public class InstanceRestController {

    private final RuntimeService runtimeService;
    private final HistoryService historyService;

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
                .finished()
                .list().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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

    @DeleteMapping("/{instanceId}")
    public void deleteProcessInstance(@PathVariable String instanceId, @RequestParam(required = false, defaultValue = "Cancelled by user") String reason) {
        runtimeService.deleteProcessInstance(instanceId, reason);
    }

    private InstanceResponse mapToResponse(ProcessInstance instance) {
        return new InstanceResponse(
                instance.getId(),
                instance.getProcessDefinitionId(),
                instance.getProcessDefinitionKey(),
                instance.getProcessDefinitionName(),
                "ACTIVE",
                instance.getStartTime() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(instance.getStartTime()) : null,
                null
        );
    }

    private InstanceResponse mapToResponse(HistoricProcessInstance instance) {
        return new InstanceResponse(
                instance.getId(),
                instance.getProcessDefinitionId(),
                instance.getProcessDefinitionKey(),
                instance.getProcessDefinitionName(),
                instance.getEndTime() != null ? "COMPLETED" : "ACTIVE",
                instance.getStartTime() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(instance.getStartTime()) : null,
                instance.getEndTime() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(instance.getEndTime()) : null
        );
    }

    public record InstanceResponse(
            String id,
            String processDefinitionId,
            String processDefinitionKey,
            String processDefinitionName,
            String status,
            String startTime,
            String endTime
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
