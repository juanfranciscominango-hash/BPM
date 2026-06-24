package com.innovacred.bpm.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "META_ATTRIBUTE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MetaAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id")
    private MetaEntity entity;

    private String name;
    private String label;
    private String type; // STRING, NUMBER, DATE, BOOLEAN, JSON, PARAMETRICA
    private boolean required;
    private Long parametricTableId; // ID de la tabla paramétrica vinculada
    private Integer fieldSize;       // Tamaño máx (VARCHAR) o precisión (NUMERIC)
}
