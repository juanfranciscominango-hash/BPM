package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SCREEN_DEFINITION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScreenDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String processKey; // Relación con el proceso
    private String taskKey;    // Relación con una tarea específica (opcional)
    
    @Column(columnDefinition = "TEXT")
    private String layoutJson; // Estructura de filas, columnas, tabs, etc.
    
    private boolean isDefault;
}
