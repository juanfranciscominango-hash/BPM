package com.innovacred.bpm.application.service;

import lombok.RequiredArgsConstructor;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.history.HistoricActivityInstance;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final RuntimeService runtimeService;
    private final HistoryService historyService;
    private final RepositoryService repositoryService;

    public List<String> getActiveActivityIds(String instanceId) {
        return runtimeService.getActiveActivityIds(instanceId);
    }

    public List<Map<String, Object>> getAuditTrail(String instanceId) {
        List<HistoricActivityInstance> activities = historyService.createHistoricActivityInstanceQuery()
                .processInstanceId(instanceId)
                .orderByHistoricActivityInstanceStartTime().asc()
                .list();

        return activities.stream().map(a -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("activityName", a.getActivityName() != null ? a.getActivityName() : a.getActivityId());
            map.put("activityType", a.getActivityType());
            map.put("startTime", a.getStartTime());
            map.put("endTime", a.getEndTime() != null ? a.getEndTime() : "En progreso");
            map.put("duration", a.getDurationInMillis() != null ? a.getDurationInMillis() : 0L);
            map.put("assignee", a.getAssignee() != null ? a.getAssignee() : "Sistema");
            return map;
        }).collect(Collectors.toList());
    }

    public String getBpmnXmlByInstance(String instanceId) {
        var instance = historyService.createHistoricProcessInstanceQuery()
                .processInstanceId(instanceId)
                .singleResult();
        
        if (instance == null) return null;

        InputStream is = repositoryService.getProcessModel(instance.getProcessDefinitionId());
        try {
            return new String(is.readAllBytes());
        } catch (Exception e) {
            throw new RuntimeException("Error leyendo BPMN XML", e);
        }
    }
}
