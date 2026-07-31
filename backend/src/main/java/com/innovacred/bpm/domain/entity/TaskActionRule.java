package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Regla de acción de actividad (estilo Bizagi).
 *
 * Define qué lógica se ejecuta en un evento específico de una tarea:
 *   - ON_ENTER  → al abrir/entrar a la tarea
 *   - ON_SAVE   → al guardar el formulario sin completar
 *   - ON_EXIT   → al completar/salir de la tarea
 *
 * Tipos de acción soportados:
 *   - EXPRESSION : evalúa una expresión Groovy/JUEL sobre variables del proceso
 *   - VALIDATION : valida una condición y lanza error si no se cumple
 *   - ASSIGNMENT : asigna un valor a una variable del proceso
 *   - NOTIFICATION: envía una notificación al usuario/grupo
 *   - API_CALL  : llama a un endpoint externo configurado (via API Manager)
 */
@Entity
@Table(name = "BPM_TASK_ACTION_RULE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskActionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Clave del proceso */
    @Column(name = "process_definition_key", nullable = false)
    private String processDefinitionKey;

    /** Clave de la tarea (taskDefinitionKey en Flowable) */
    @Column(name = "task_definition_key", nullable = false)
    private String taskDefinitionKey;

    /** Nombre de tarea para UI */
    @Column(name = "task_name")
    private String taskName;

    /** Evento que dispara esta regla: ON_ENTER | ON_SAVE | ON_EXIT */
    @Column(name = "event_trigger", nullable = false)
    private String eventTrigger;

    /** Tipo de acción: EXPRESSION | VALIDATION | ASSIGNMENT | NOTIFICATION | API_CALL */
    @Column(name = "action_type", nullable = false)
    private String actionType;

    /** Nombre descriptivo de la regla */
    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    /**
     * Condición de ejecución (JUEL).
     * Si es null/vacío, la regla se ejecuta siempre.
     * Ej: "${monto > 50000}" → solo ejecutar si monto mayor a 50000
     */
    @Column(name = "condition_expression")
    private String conditionExpression;

    /**
     * Cuerpo de la acción según tipo:
     * - VALIDATION: expresión booleana que debe ser TRUE para pasar (ej: "${cedula != null}")
     * - ASSIGNMENT:  "variable = expresion"  (ej: "tasa = monto * 0.15")
     * - NOTIFICATION: mensaje a enviar (puede incluir ${variable} del proceso)
     * - API_CALL: clave del conector en API Manager
     * - EXPRESSION: expresión libre de evaluación
     */
    @Column(name = "action_expression", columnDefinition = "TEXT")
    private String actionExpression;

    /** Mensaje de error para VALIDATION (se muestra al usuario si falla) */
    @Column(name = "error_message")
    private String errorMessage;

    /** Usuario/grupo destino para NOTIFICATION */
    @Column(name = "target_user")
    private String targetUser;

    /** Nombre de la variable destino para ASSIGNMENT */
    @Column(name = "target_variable")
    private String targetVariable;

    /** Orden de ejecución (se ejecutan de menor a mayor) */
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
