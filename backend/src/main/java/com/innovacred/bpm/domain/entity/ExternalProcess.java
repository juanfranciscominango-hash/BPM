package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EXTERNAL_PROCESS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExternalProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    private String description;
    private String referenceType; // NIP, etc.
    private String processType;   // WEB API REST, etc.
    private String tramaTypes;    // INPUT, OUTPUT, etc.
    private String systemName;    // LOGIFLOW, etc.
}
