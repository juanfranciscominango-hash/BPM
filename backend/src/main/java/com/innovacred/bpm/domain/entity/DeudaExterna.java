package com.innovacred.bpm.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "crm_deuda_externa")
@Data
public class DeudaExterna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String entidad;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal saldo;

    @Column(length = 100)
    private String producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_financiero_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private PerfilFinanciero perfilFinanciero;
}
