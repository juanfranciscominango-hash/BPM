package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "BPM_WEBHOOK_CONFIG")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WebhookConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_definition_key")
    private String processDefinitionKey; // Si es null, aplica a todos los procesos

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "secret_key")
    private String secretKey; // Para firmar el payload (HMAC) o usar como token

    @Column(name = "events", nullable = false)
    private String events; // Ej: "PROCESS_STARTED,TASK_COMPLETED,PROCESS_COMPLETED"

    @Builder.Default
    @Column(name = "active")
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
