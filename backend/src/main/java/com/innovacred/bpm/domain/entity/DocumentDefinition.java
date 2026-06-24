package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DOCUMENT_DEFINITION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private String processKey;
    
    private boolean isTemplate; // Indica si es una plantilla para generar
    @Column(columnDefinition = "TEXT")
    private String templateContent; // Contenido HTML/Texto con placeholders {{var}}
    private String templatePath; // Ruta opcional
    
    @Column(columnDefinition = "TEXT")
    private String mappingJson; // Mapeo de Tags a Variables de Proceso
    
    private String exportFormat; // PDF, DOCX, etc.
    
    private boolean required;
}
