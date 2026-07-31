package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "BPM_TASK_SLA_CONFIG", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"process_definition_key", "task_definition_key"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskSlaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_definition_key", nullable = false)
    private String processDefinitionKey;

    @Column(name = "task_definition_key", nullable = false)
    private String taskDefinitionKey;

    /** Nombre descriptivo de la tarea (para UI) */
    @Column(name = "task_name")
    private String taskName;

    /** Tiempo máximo permitido para completar la tarea */
    @Column(name = "max_duration", nullable = false)
    private Integer maxDuration;

    /** Unidad de tiempo: MINUTES, HOURS, DAYS */
    @Column(name = "time_unit", nullable = false)
    private String timeUnit;

    /** Porcentaje del tiempo para mostrar advertencia (ej: 80 = amarillo al 80%) */
    @Column(name = "warning_threshold_pct")
    @Builder.Default
    private Integer warningThresholdPct = 80;

    /** Acción al vencer: NOTIFY_SUPERVISOR, REASSIGN, ESCALATE */
    @Column(name = "expiry_action", nullable = false)
    private String expiryAction;

    /** Usuario o rol al que se escala cuando vence */
    @Column(name = "escalation_target")
    private String escalationTarget;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
