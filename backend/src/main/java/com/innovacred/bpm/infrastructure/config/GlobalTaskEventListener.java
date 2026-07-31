package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.application.service.ProcessErrorService;
import com.innovacred.bpm.application.service.TaskActionService;
import com.innovacred.bpm.application.service.WebhookDispatcherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import java.util.HashMap;
import java.util.Map;
import org.flowable.common.engine.api.delegate.event.FlowableEngineEntityEvent;
import org.flowable.common.engine.api.delegate.event.FlowableEvent;
import org.flowable.common.engine.api.delegate.event.FlowableEventListener;
import org.flowable.common.engine.api.delegate.event.FlowableEngineEventType;
import org.flowable.task.api.Task;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class GlobalTaskEventListener implements FlowableEventListener {

    private final ObjectProvider<TaskActionService> taskActionServiceProvider;
    private final ObjectProvider<ProcessErrorService> errorServiceProvider;
    private final ObjectProvider<WebhookDispatcherService> webhookDispatcherServiceProvider;

    @Override
    public void onEvent(FlowableEvent event) {
        if (event instanceof FlowableEngineEntityEvent entityEvent) {
            Object entity = entityEvent.getEntity();
            
            if (entity instanceof Task task) {
                String eventType = event.getType().name();
                String eventTrigger = null;

                if (FlowableEngineEventType.TASK_CREATED.name().equals(eventType)) {
                    eventTrigger = "ON_ENTER";
                } else if (FlowableEngineEventType.TASK_COMPLETED.name().equals(eventType)) {
                    // eventTrigger = "ON_EXIT"; // Se evalúa en BpmTaskService para poder detener la transacción
                }

                String processKey = task.getProcessDefinitionId() != null && task.getProcessDefinitionId().contains(":") 
                        ? task.getProcessDefinitionId().split(":")[0] 
                        : task.getProcessDefinitionId();

                if (eventTrigger != null) {
                    try {
                        taskActionServiceProvider.getIfAvailable().executeRulesForEvent(
                                task.getProcessInstanceId(), 
                                processKey, 
                                task.getTaskDefinitionKey(), 
                                task.getId(), 
                                eventTrigger);
                    } catch (Exception ex) {
                        log.error("Error en GlobalTaskEventListener ({}): {}", eventTrigger, ex.getMessage());
                    }
                }
                
                if ("TASK_CREATED".equals(eventType) || "TASK_COMPLETED".equals(eventType)) {
                    Map<String, Object> data = new HashMap<>();
                    data.put("taskName", task.getName());
                    data.put("assignee", task.getAssignee());
                    WebhookDispatcherService dispatcher = webhookDispatcherServiceProvider.getIfAvailable();
                    if (dispatcher != null) {
                        dispatcher.dispatchEvent(processKey, eventType, task.getProcessInstanceId(), task.getId(), data);
                    }
                }
            } else if (entity instanceof org.flowable.engine.runtime.Execution || entity instanceof org.flowable.engine.runtime.ProcessInstance) {
                String eventType = event.getType().name();
                if ("PROCESS_STARTED".equals(eventType) || "PROCESS_COMPLETED".equals(eventType)) {
                    // Intentar obtener info del proceso
                    String processInstId = entityEvent.getProcessInstanceId();
                    String processDefId = entityEvent.getProcessDefinitionId();
                    String processKey = processDefId != null && processDefId.contains(":") ? processDefId.split(":")[0] : processDefId;
                    
                    Map<String, Object> data = new HashMap<>();
                    WebhookDispatcherService dispatcher = webhookDispatcherServiceProvider.getIfAvailable();
                    if (dispatcher != null) {
                        dispatcher.dispatchEvent(processKey, eventType, processInstId, null, data);
                    }
                }
            }
        }
    }

    @Override
    public boolean isFailOnException() {
        return false;
    }
    
    @Override
    public boolean isFireOnTransactionLifecycleEvent() {
        return false;
    }

    @Override
    public String getOnTransaction() {
        return null;
    }
}
