package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "PARAMETRIC_TABLE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParametricTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String label;
    private String description;
    
    @OneToMany(mappedBy = "table", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParametricColumn> columns;
}
