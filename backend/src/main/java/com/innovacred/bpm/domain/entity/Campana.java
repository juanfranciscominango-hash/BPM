package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "crm_campana")
@Data
public class Campana {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_campana", nullable = false, unique = true, length = 50)
    private String codigoCampana;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "ultima_actualizacion")
    private LocalDate ultimaActualizacion;

    @Column(name = "presupuesto_asignado", precision = 15, scale = 2)
    private BigDecimal presupuestoAsignado;

    @Column(name = "presupuesto_ejecutado", precision = 15, scale = 2)
    private BigDecimal presupuestoEjecutado;

    @Column(name = "leads_generados")
    private Integer leadsGenerados;

    @Column(name = "conversiones")
    private Integer conversiones;

    @Column(name = "tasa_apertura", length = 20)
    private String tasaApertura;

    @Column(length = 20)
    private String roi;

    @Column(length = 150)
    private String responsable;
}
