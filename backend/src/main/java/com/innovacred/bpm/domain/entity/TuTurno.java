package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "tu_turno")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuTurno implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_turno", nullable = false, length = 20)
    private String codigoTurno; // ej: A-008, C-014

    @Column(name = "secuencia", nullable = false)
    private Integer secuencia;

    @Column(name = "identificacion_cliente", length = 30)
    private String identificacionCliente;

    @Column(name = "nombre_cliente", length = 150)
    private String nombreCliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "servicio_id", nullable = false)
    private TuServicio servicio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ventanilla_id")
    private TuVentanilla ventanilla;

    @Column(name = "usuario_asesor", length = 100)
    private String usuarioAsesor;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado; // EMITIDO, EN_ESPERA, LLAMADO, EN_ATENCION, FINALIZADO, AUSENTE, DERIVADO

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "fecha_llamado")
    private LocalDateTime fechaLlamado;

    @Column(name = "fecha_inicio_atencion")
    private LocalDateTime fechaInicioAtencion;

    @Column(name = "fecha_fin_atencion")
    private LocalDateTime fechaFinAtencion;

    @Column(name = "tiempo_espera_segundos")
    private Long tiempoEsperaSegundos;

    @Column(name = "tiempo_atencion_segundos")
    private Long tiempoAtencionSegundos;

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    @Column(name = "process_instance_id", length = 100)
    private String processInstanceId;
}
