package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "STORED_DOCUMENT")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoredDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String fileName;
    private String contentType;
    private String storagePath;
    
    private String processInstanceId;
    private Long definitionId; // Referencia a DocumentDefinition
    
    private LocalDateTime uploadedAt;
    private String uploadedBy;
    
    // Digital Signature Fields
    private boolean isSigned;
    private String signatureHash;
    private String signedBy;
    private LocalDateTime signedAt;
}
