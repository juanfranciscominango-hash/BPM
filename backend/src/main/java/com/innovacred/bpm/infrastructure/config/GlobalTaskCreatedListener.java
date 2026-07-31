package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.application.service.TaskAllocationService;
import org.flowable.common.engine.api.delegate.event.FlowableEngineEventType;
import org.flowable.common.engine.api.delegate.event.FlowableEvent;
import org.flowable.common.engine.api.delegate.event.FlowableEventListener;
import org.flowable.common.engine.impl.event.FlowableEntityEventImpl;
import org.flowable.task.api.Task;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
public class GlobalTaskCreatedListener implements FlowableEventListener {

    private final TaskAllocationService taskAllocationService;

    // Use @Lazy injection to prevent circular reference with Flowable initialization
    public GlobalTaskCreatedListener(@Lazy TaskAllocationService taskAllocationService) {
        this.taskAllocationService = taskAllocationService;
    }

    @Override
    public void onEvent(FlowableEvent event) {
        if (event.getType() == FlowableEngineEventType.TASK_CREATED) {
            if (event instanceof FlowableEntityEventImpl) {
                FlowableEntityEventImpl entityEvent = (FlowableEntityEventImpl) event;
                if (entityEvent.getEntity() instanceof Task) {
                    Task task = (Task) entityEvent.getEntity();
                    taskAllocationService.allocateTask(task);
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
