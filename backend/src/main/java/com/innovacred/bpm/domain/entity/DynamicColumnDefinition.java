package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dynamic_column_definition")
@Getter
@Setter
public class DynamicColumnDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_name", unique = true, nullable = false)
    private String keyName;

    @Column(name = "label_name", nullable = false)
    private String labelName;

    @Column(name = "variable_name", nullable = false)
    private String variableName;

    @Column(name = "column_type", nullable = false)
    private String columnType; // "text", "currency", "number", "date"

    @Column(name = "is_visible")
    private boolean visible = true;
}
