package com.innovacred.bpm.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "crm_tarjeta_credito")
@Data
public class TarjetaCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String entidad;

    @Column(name = "saldo_actual", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoActual;

    @Column(name = "cupo_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal cupoTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_financiero_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private PerfilFinanciero perfilFinanciero;
}
