package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ProcessErrorLog;
import com.innovacred.bpm.infrastructure.adapter.persistence.ProcessErrorLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.task.api.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessErrorService {

    private final ProcessErrorLogRepository errorLogRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;

    // ── LOGGER DE ERRORES ──

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ProcessErrorLog logError(String processInstanceId, String processDefKey, String taskId, 
                                    String errorType, String message, Exception ex) {
        
        String taskName = null;
        if (taskId != null) {
            Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task != null) taskName = task.getName();
        }

        String stackTrace = ex != null ? extractStackTrace(ex) : null;

        ProcessErrorLog errorLog = ProcessErrorLog.builder()
                .processInstanceId(processInstanceId)
                .processDefinitionKey(processDefKey)
                .taskId(taskId)
                .taskName(taskName)
                .errorType(errorType)
                .errorMessage(message)
                .stackTrace(stackTrace)
                .status("PENDING")
                .retryCount(0)
                .maxRetries(3) // Configurable
                .build();

        log.error("Proceso Error [{}] Instancia: {}, Tarea: {} - {}", errorType, processInstanceId, taskName, message);
        return errorLogRepository.save(errorLog);
    }

    // ── GESTIÓN DE ERRORES ──

    public List<ProcessErrorLog> getErrorsByInstance(String processInstanceId) {
        return errorLogRepository.findByProcessInstanceIdOrderByCreatedAtDesc(processInstanceId);
    }
    
    public List<ProcessErrorLog> getPendingErrors() {
        return errorLogRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    @Transactional
    public ProcessErrorLog retryError(Long errorId, String user) {
        ProcessErrorLog error = errorLogRepository.findById(errorId)
                .orElseThrow(() -> new RuntimeException("Error no encontrado"));
                
        if (!"PENDING".equals(error.getStatus()) && !"RETRYING".equals(error.getStatus())) {
            throw new RuntimeException("El error no está en estado de reintento válido");
        }

        error.setRetryCount(error.getRetryCount() + 1);
        error.setStatus("RETRYING");
        error.setResolvedBy(user);
        error.setResolutionNotes("Reintento manual iniciado");
        
        errorLogRepository.save(error);
        log.info("Usuario {} inició reintento manual para el error {}", user, errorId);
        
        // La lógica específica del reintento de la tarea o conector va aquí o se despacha
        // Si es una tarea atascada por fallo al completarse, el frontend llamará de nuevo a completar
        return error;
    }

    @Transactional
    public ProcessErrorLog resolveError(Long errorId, String user, String notes) {
        ProcessErrorLog error = errorLogRepository.findById(errorId)
                .orElseThrow(() -> new RuntimeException("Error no encontrado"));
        
        error.setStatus("RESOLVED");
        error.setResolvedBy(user);
        error.setResolutionNotes(notes);
        return errorLogRepository.save(error);
    }

    @Transactional
    public ProcessErrorLog ignoreError(Long errorId, String user, String notes) {
        ProcessErrorLog error = errorLogRepository.findById(errorId)
                .orElseThrow(() -> new RuntimeException("Error no encontrado"));
        
        error.setStatus("IGNORED");
        error.setResolvedBy(user);
        error.setResolutionNotes(notes);
        return errorLogRepository.save(error);
    }

    private String extractStackTrace(Exception ex) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement element : ex.getStackTrace()) {
            sb.append(element.toString()).append("\n");
        }
        return sb.toString();
    }
}
