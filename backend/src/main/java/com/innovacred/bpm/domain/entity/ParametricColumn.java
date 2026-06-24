package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "PARAMETRIC_COLUMN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParametricColumn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String label;
    private String type; // string, number, boolean, reference

    @Column(name = "is_primary_key")
    private Boolean primaryKey;

    @Column(name = "referenced_table_id")
    private Long referencedTableId;       // solo aplica cuando type = "reference"

    @Column(name = "referenced_table_label")
    private String referencedTableLabel;  // etiqueta de la tabla referenciada (para mostrar en UI)

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "table_id")
    private ParametricTable table;
}

