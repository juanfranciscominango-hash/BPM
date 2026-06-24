package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PROCESS_DEFINITION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcessDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String key;
    
    private String name;
    private String category;
    private int version;
    
    @Column(columnDefinition = "TEXT")
    private String bpmnXml;
    
    private String deploymentId; // Flowable Deployment ID
    private String procDefId;    // Flowable Process Definition ID
    
    private Long metaEntityId;   // ID de la entidad asociada para formularios dinámicos
    
    private LocalDateTime lastUpdated;
    private String status; // DRAFT, DEPLOYED
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
