package com.innovacred.bpm.infrastructure.adapter.rest;

import lombok.RequiredArgsConstructor;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardRestController {

    private final RuntimeService runtimeService;
    private final HistoryService historyService;
    private final TaskService taskService;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        long activeInstances = runtimeService.createProcessInstanceQuery().count();
        long completedInstances = historyService.createHistoricProcessInstanceQuery().finished().count();
        long pendingTasks = taskService.createTaskQuery().count();
        
        return Map.of(
            "activeInstances", activeInstances,
            "completedInstances", completedInstances,
            "pendingTasks", pendingTasks,
            "efficiency", 85 // Simulado por ahora
        );
    }
}
