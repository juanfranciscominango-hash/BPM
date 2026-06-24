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

    private InstanceResponse mapToResponse(ProcessInstance instance) {
        return new InstanceResponse(
                instance.getId(),
                instance.getProcessDefinitionId(),
                instance.getProcessDefinitionKey(),
                instance.getProcessDefinitionName(),
                "ACTIVE",
                instance.getStartTime().toString(),
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
                instance.getStartTime().toString(),
                instance.getEndTime() != null ? instance.getEndTime().toString() : null
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
}
