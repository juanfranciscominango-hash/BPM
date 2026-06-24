package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "FORMULA_DEFINITION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormulaDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String key;
    
    private String name;
    private String description;
    private int version;
    private String author;
    
    @Column(columnDefinition = "TEXT")
    private String expression;
    
    @Column(columnDefinition = "TEXT", name = "canvas_json")
    private String canvasJson;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (version == 0) {
            version = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
