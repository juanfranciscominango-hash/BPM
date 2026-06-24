package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "RULE_DEFINITION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RuleDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String key;
    
    private String name;
    private String category;
    private int version;
    
    @Column(columnDefinition = "TEXT")
    private String dmnXml;
    
    private String deploymentId; // Flowable DMN Deployment ID
    
    private Long metaEntityId;   // ID de la entidad vinculada para el contexto de la regla
    
    private LocalDateTime lastUpdated;
    private String status; // DRAFT, DEPLOYED
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
