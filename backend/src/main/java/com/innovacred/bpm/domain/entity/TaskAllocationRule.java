package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "BPM_TASK_ALLOCATION_RULE", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"process_definition_key", "task_definition_key"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAllocationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_definition_key", nullable = false)
    private String processDefinitionKey;

    @Column(name = "task_definition_key", nullable = false)
    private String taskDefinitionKey;

    @Column(name = "allocation_method", nullable = false)
    private String allocationMethod; // EVERYONE, LEAST_LOADED, ROUND_ROBIN, SPECIFIC

    @Column(name = "candidate_group")
    private String candidateGroup; // Rol o grupo de Flowable (ej: 'Asesor', 'Aprobador')

    @Column(name = "specific_expression")
    private String specificExpression; // Variable del caso (ej: 'creador_caso')

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    private String taskName;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
