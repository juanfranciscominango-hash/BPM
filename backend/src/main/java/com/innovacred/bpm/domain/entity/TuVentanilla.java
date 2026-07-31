package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "tu_ventanilla")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuVentanilla implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_ventanilla", nullable = false)
    private Integer numeroVentanilla;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre; // Ventanilla 1, Ventanilla 2, etc.

    @Column(name = "agencia", length = 100)
    private String agencia;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado; // DISPONIBLE, EN_PAUSA, ALMUERZO, OFFLINE

    @Column(name = "usuario_actual", length = 100)
    private String usuarioActual;
}
