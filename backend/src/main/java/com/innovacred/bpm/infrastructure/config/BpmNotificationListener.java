package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.Notification;
import com.innovacred.bpm.infrastructure.adapter.persistence.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.flowable.task.service.delegate.DelegateTask;
import org.flowable.task.service.delegate.TaskListener;
import org.springframework.stereotype.Component;

@Component("bpmNotificationListener")
@RequiredArgsConstructor
public class BpmNotificationListener implements TaskListener {

    private final NotificationRepository notificationRepository;

    @Override
    public void notify(DelegateTask delegateTask) {
        String eventName = delegateTask.getEventName();
        String assignee = delegateTask.getAssignee();

        if ("create".equals(eventName) && assignee != null) {
            notificationRepository.save(Notification.builder()
                    .title("Nueva Tarea Asignada")
                    .message("Se te ha asignado la tarea: " + delegateTask.getName())
                    .type("info")
                    .targetUser(assignee)
                    .build());
        }
    }
}
