package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Define el esquema de variables para un proceso.
 * Cada registro representa una variable tipada con sus restricciones:
 * tipo de dato, si es obligatoria, valor por defecto y descripción.
 */
@Entity
@Table(name = "BPM_PROCESS_VARIABLE_SCHEMA",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"process_definition_key", "variable_name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcessVariableSchema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Clave del proceso (ej: "Flujo_Credito_Completo").
     * Debe coincidir con processDefinitionKey en Flowable.
     */
    @Column(name = "process_definition_key", nullable = false)
    private String processDefinitionKey;

    /** Nombre de la variable (ej: "monto", "identificacion") */
    @Column(name = "variable_name", nullable = false)
    private String variableName;

    /** Etiqueta amigable para UI (ej: "Monto del Préstamo") */
    @Column(name = "label")
    private String label;

    /**
     * Tipo de dato esperado: STRING | NUMBER | BOOLEAN | DATE | OBJECT
     */
    @Column(name = "data_type", nullable = false)
    private String dataType;

    /** Si es true, el proceso no puede iniciarse sin esta variable */
    @Column(name = "required")
    private boolean required;

    /** Valor por defecto serializado como String (ej: "0", "true", "PENDIENTE") */
    @Column(name = "default_value")
    private String defaultValue;

    /** Descripción para formularios y documentación */
    @Column(name = "description")
    private String description;

    /** 
     * Expresión de validación opcional (regex para STRING, rango para NUMBER).
     * Ej: "^[0-9]{10}$" para cédula ecuatoriana 
     */
    @Column(name = "validation_expression")
    private String validationExpression;

    /** Mensaje de error a mostrar si la validación falla */
    @Column(name = "validation_message")
    private String validationMessage;

    /** Orden de aparición en formularios */
    @Column(name = "sort_order")
    private int sortOrder;

    @Builder.Default
    @Column(name = "active")
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
