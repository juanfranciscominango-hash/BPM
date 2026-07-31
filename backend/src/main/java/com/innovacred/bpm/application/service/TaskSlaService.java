package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.AuditLog;
import com.innovacred.bpm.domain.entity.Notification;
import com.innovacred.bpm.domain.entity.TaskSlaConfig;
import com.innovacred.bpm.infrastructure.adapter.persistence.AuditLogRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.NotificationRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TaskSlaConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.TaskService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.RepositoryService;
import org.flowable.task.api.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskSlaService {

    private final TaskSlaConfigRepository slaConfigRepository;
    private final TaskService taskService;
    private final RuntimeService runtimeService;
    private final RepositoryService repositoryService;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    // ────── CRUD ──────

    public List<TaskSlaConfig> findAll() {
        return slaConfigRepository.findAll();
    }

    public List<TaskSlaConfig> findByProcess(String processDefinitionKey) {
        return slaConfigRepository.findByProcessDefinitionKeyAndActiveTrue(processDefinitionKey);
    }

    public Optional<TaskSlaConfig> findById(Long id) {
        return slaConfigRepository.findById(id);
    }

    @Transactional
    public TaskSlaConfig save(TaskSlaConfig config) {
        return slaConfigRepository.save(config);
    }

    @Transactional
    public void delete(Long id) {
        slaConfigRepository.deleteById(id);
    }

    // ────── SLA CALCULATION ──────

    /**
     * Calcula el estado SLA de una tarea en tiempo real.
     * Retorna un Map con: slaStatus, slaDueDateIso, timeRemainingMs, 
     *                      timeElapsedMs, totalDurationMs, percentUsed
     */
    public Map<String, Object> calculateSlaStatus(Task task) {
        Map<String, Object> result = new HashMap<>();
        result.put("slaStatus", "NONE");
        result.put("hasSla", false);

        if (task == null || task.getCreateTime() == null) return result;

        String procDefKey = extractProcessKey(task.getProcessDefinitionId());
        String taskDefKey = task.getTaskDefinitionKey();

        Optional<TaskSlaConfig> configOpt = slaConfigRepository
                .findByProcessDefinitionKeyAndTaskDefinitionKey(procDefKey, taskDefKey);

        if (configOpt.isEmpty() || !configOpt.get().isActive()) return result;

        TaskSlaConfig config = configOpt.get();
        result.put("hasSla", true);

        Instant createTime = task.getCreateTime().toInstant();
        Instant now = Instant.now();
        long totalDurationMs = toMillis(config.getMaxDuration(), config.getTimeUnit());
        long elapsedMs = Duration.between(createTime, now).toMillis();
        long remainingMs = totalDurationMs - elapsedMs;
        double percentUsed = totalDurationMs > 0 ? (double) elapsedMs / totalDurationMs * 100.0 : 0;

        Instant dueDate = createTime.plusMillis(totalDurationMs);

        String status;
        if (remainingMs <= 0) {
            status = "EXPIRED";
        } else if (percentUsed >= config.getWarningThresholdPct()) {
            status = "WARNING";
        } else {
            status = "OK";
        }

        result.put("slaStatus", status);
        result.put("slaDueDateIso", dueDate.toString());
        result.put("timeRemainingMs", Math.max(0, remainingMs));
        result.put("timeElapsedMs", elapsedMs);
        result.put("totalDurationMs", totalDurationMs);
        result.put("percentUsed", Math.round(percentUsed * 100.0) / 100.0);
        result.put("maxDuration", config.getMaxDuration());
        result.put("timeUnit", config.getTimeUnit());
        result.put("expiryAction", config.getExpiryAction());

        return result;
    }

    // ────── REASIGNACIÓN ──────

    @Transactional
    public void reassignTask(String taskId, String newAssignee, String requestedBy, String reason) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) throw new RuntimeException("Tarea no encontrada: " + taskId);

        String previousAssignee = task.getAssignee();
        
        // Reasignar en Flowable
        taskService.setAssignee(taskId, newAssignee);

        // Registrar en auditoría
        auditLogRepository.save(AuditLog.builder()
                .fechaHora(LocalDateTime.now())
                .usuario(requestedBy)
                .accion("REASIGNACION_TAREA")
                .nombreEntidad("Task")
                .idEntidad(taskId)
                .detalles(String.format(
                        "Tarea '%s' reasignada de '%s' a '%s'. Motivo: %s",
                        task.getName(), previousAssignee, newAssignee,
                        reason != null ? reason : "Sin motivo especificado"))
                .estado("COMPLETADO")
                .build());

        // Notificar al nuevo responsable
        notificationRepository.save(Notification.builder()
                .title("Tarea reasignada")
                .message(String.format(
                        "Se te ha asignado la tarea '%s' (caso %s). Reasignada por %s.",
                        task.getName(), task.getProcessInstanceId(), requestedBy))
                .type("INFO")
                .targetUser(newAssignee)
                .build());

        // Notificar al anterior responsable (si existía)
        if (previousAssignee != null && !previousAssignee.isEmpty()) {
            notificationRepository.save(Notification.builder()
                    .title("Tarea reasignada a otro usuario")
                    .message(String.format(
                            "Tu tarea '%s' (caso %s) ha sido reasignada a %s por %s.",
                            task.getName(), task.getProcessInstanceId(), newAssignee, requestedBy))
                    .type("WARNING")
                    .targetUser(previousAssignee)
                    .build());
        }

        log.info("Tarea {} reasignada de '{}' a '{}' por '{}'. Motivo: {}",
                taskId, previousAssignee, newAssignee, requestedBy, reason);
    }

    // ────── DELEGACIÓN ──────

    @Transactional
    public void delegateTask(String taskId, String delegateTo, String requestedBy, String reason) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) throw new RuntimeException("Tarea no encontrada: " + taskId);

        String owner = task.getAssignee();

        // Flowable delegate: establece owner + nuevo assignee
        taskService.delegateTask(taskId, delegateTo);

        auditLogRepository.save(AuditLog.builder()
                .fechaHora(LocalDateTime.now())
                .usuario(requestedBy)
                .accion("DELEGACION_TAREA")
                .nombreEntidad("Task")
                .idEntidad(taskId)
                .detalles(String.format(
                        "Tarea '%s' delegada de '%s' a '%s'. Motivo: %s",
                        task.getName(), owner, delegateTo,
                        reason != null ? reason : "Sin motivo especificado"))
                .estado("COMPLETADO")
                .build());

        notificationRepository.save(Notification.builder()
                .title("Tarea delegada")
                .message(String.format(
                        "Se te ha delegado la tarea '%s' (caso %s) por %s.",
                        task.getName(), task.getProcessInstanceId(), requestedBy))
                .type("INFO")
                .targetUser(delegateTo)
                .build());

        log.info("Tarea {} delegada de '{}' a '{}' por '{}'", taskId, owner, delegateTo, requestedBy);
    }

    // ────── SCHEDULED: Revisar tareas vencidas ──────

    /**
     * Llamado por el SlaScheduledJob cada 5 minutos.
     * Busca tareas activas con SLA vencido y ejecuta la acción configurada.
     */
    @Transactional
    public void checkExpiredTasks() {
        List<TaskSlaConfig> allConfigs = slaConfigRepository.findByActiveTrue();
        if (allConfigs.isEmpty()) return;

        for (TaskSlaConfig config : allConfigs) {
            String procKey = config.getProcessDefinitionKey();
            String taskDefKey = config.getTaskDefinitionKey();

            List<Task> tasks = taskService.createTaskQuery()
                    .processDefinitionKeyLike(procKey + "%")
                    .taskDefinitionKey(taskDefKey)
                    .list();

            for (Task task : tasks) {
                if (task.getCreateTime() == null) continue;

                long totalDurationMs = toMillis(config.getMaxDuration(), config.getTimeUnit());
                long elapsedMs = Duration.between(
                        task.getCreateTime().toInstant(), Instant.now()).toMillis();

                if (elapsedMs > totalDurationMs) {
                    handleExpiredTask(task, config);
                }
            }
        }
    }

    private void handleExpiredTask(Task task, TaskSlaConfig config) {
        // Verificar si ya se notificó (para no duplicar)
        String markerVar = "sla_notified_" + task.getTaskDefinitionKey();
        Object alreadyNotified = null;
        try {
            alreadyNotified = runtimeService.getVariable(task.getProcessInstanceId(), markerVar);
        } catch (Exception e) {
            // Instance might not exist
        }
        
        if (alreadyNotified != null) return; // Ya se procesó

        log.warn("SLA VENCIDO: Tarea '{}' (ID: {}) en instancia {}. Acción: {}",
                task.getName(), task.getId(), task.getProcessInstanceId(), config.getExpiryAction());

        switch (config.getExpiryAction()) {
            case "NOTIFY_SUPERVISOR" -> {
                String target = config.getEscalationTarget();
                if (target != null && !target.isEmpty()) {
                    notificationRepository.save(Notification.builder()
                            .title("⚠️ SLA VENCIDO: " + task.getName())
                            .message(String.format(
                                    "La tarea '%s' (caso %s) ha excedido el tiempo máximo de %d %s. " +
                                    "Responsable actual: %s",
                                    task.getName(), task.getProcessInstanceId(),
                                    config.getMaxDuration(), config.getTimeUnit(),
                                    task.getAssignee() != null ? task.getAssignee() : "Sin asignar"))
                            .type("DANGER")
                            .targetUser(target)
                            .build());
                }
            }
            case "REASSIGN" -> {
                String target = config.getEscalationTarget();
                if (target != null && !target.isEmpty()) {
                    reassignTask(task.getId(), target, "SISTEMA_SLA",
                            "Reasignación automática por vencimiento de SLA");
                }
            }
            case "ESCALATE" -> {
                String target = config.getEscalationTarget();
                if (target != null && !target.isEmpty()) {
                    // Notificar al supervisor Y al responsable actual
                    notificationRepository.save(Notification.builder()
                            .title("🔴 ESCALAMIENTO: " + task.getName())
                            .message(String.format(
                                    "La tarea '%s' (caso %s) ha sido escalada por vencimiento de SLA (%d %s).",
                                    task.getName(), task.getProcessInstanceId(),
                                    config.getMaxDuration(), config.getTimeUnit()))
                            .type("DANGER")
                            .targetUser(target)
                            .build());

                    if (task.getAssignee() != null) {
                        notificationRepository.save(Notification.builder()
                                .title("🔴 Tu tarea ha sido escalada")
                                .message(String.format(
                                        "La tarea '%s' (caso %s) fue escalada a '%s' por vencimiento del SLA.",
                                        task.getName(), task.getProcessInstanceId(), target))
                                .type("DANGER")
                                .targetUser(task.getAssignee())
                                .build());
                    }
                }
            }
        }

        // Marcar como notificado para no repetir
        try {
            runtimeService.setVariable(task.getProcessInstanceId(), markerVar, true);
        } catch (Exception e) {
            log.warn("No se pudo marcar variable de SLA notificado: {}", e.getMessage());
        }
    }

    // ────── UTILS ──────

    private long toMillis(int duration, String unit) {
        return switch (unit.toUpperCase()) {
            case "MINUTES" -> duration * 60_000L;
            case "HOURS"   -> duration * 3_600_000L;
            case "DAYS"    -> duration * 86_400_000L;
            default        -> duration * 3_600_000L; // default HOURS
        };
    }

    private String extractProcessKey(String processDefinitionId) {
        if (processDefinitionId == null) return "";
        return processDefinitionId.contains(":")
                ? processDefinitionId.split(":")[0]
                : processDefinitionId;
    }
}
