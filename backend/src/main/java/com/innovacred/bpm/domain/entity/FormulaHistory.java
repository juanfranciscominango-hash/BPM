package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "FORMULA_HISTORY")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormulaHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formula_definition_id", nullable = false)
    private FormulaDefinition formulaDefinition;
    
    private String key;
    private String name;
    private String description;
    private int version;
    private String author;
    
    @Column(columnDefinition = "TEXT")
    private String expression;
    
    @Column(columnDefinition = "TEXT", name = "canvas_json")
    private String canvasJson;
    
    private LocalDateTime archivedAt;
}
