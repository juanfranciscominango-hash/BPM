package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Registro de errores de proceso.
 * Cada vez que una tarea o integración falla, se guarda aquí
 * con toda la información necesaria para diagnóstico y reintento.
 */
@Entity
@Table(name = "BPM_PROCESS_ERROR_LOG")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcessErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID de la instancia de proceso donde ocurrió el error */
    @Column(name = "process_instance_id", nullable = false)
    private String processInstanceId;

    /** Clave del proceso (ej: "Flujo_Credito_Completo") */
    @Column(name = "process_definition_key")
    private String processDefinitionKey;

    /** ID de la tarea en Flowable donde ocurrió el error */
    @Column(name = "task_id")
    private String taskId;

    /** Nombre de la tarea (para mostrar en UI) */
    @Column(name = "task_name")
    private String taskName;

    /** Tipo de error: VALIDATION | INTEGRATION | SYSTEM | TIMEOUT */
    @Column(name = "error_type", nullable = false)
    private String errorType;

    /** Mensaje de error principal */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    /** Stack trace completo para diagnóstico */
    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    /** 
     * Estado del error: PENDING | RETRYING | RESOLVED | IGNORED
     */
    @Column(name = "status", nullable = false)
    private String status;

    /** Número de reintentos realizados */
    @Column(name = "retry_count")
    private int retryCount;

    /** Máximo de reintentos permitidos */
    @Column(name = "max_retries")
    private int maxRetries;

    /** Usuario que resolvió o ignoró el error (si aplica) */
    @Column(name = "resolved_by")
    private String resolvedBy;

    /** Notas del operador al resolver/ignorar */
    @Column(name = "resolution_notes")
    private String resolutionNotes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
        if (this.errorType == null) this.errorType = "SYSTEM";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
