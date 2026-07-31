package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "tu_servicio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuServicio implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 30)
    private String codigo; // CAJAS, ATENCION, CREDITO, PREFERENCIAL

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "prefijo", nullable = false, length = 5)
    private String prefijo; // C, A, CR, P

    @Column(name = "prioridad", nullable = false)
    private Integer prioridad; // 1 = Máxima prioridad (Preferencial), 10 = Normal

    @Column(name = "sla_espera_minutos")
    private Integer slaEsperaMinutos;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
