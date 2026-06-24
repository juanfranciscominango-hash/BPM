package com.innovacred.bpm.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "crm_lead")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombresCompletos;

    @Column(length = 20)
    private String identificacion;

    @Column(length = 150)
    private String empresa;

    @Column(length = 20)
    private String telefono;

    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String estado; // FRIO, TIBIO, CALIENTE, CONVERTIDO, DESCARTADO

    @Column(precision = 15, scale = 2)
    private BigDecimal montoEstimado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "Asesor_id")
    private Asesor AsesorAsignado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "origen_id")
    private OrigenLead origen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campana_id")
    @JsonIgnore
    @ToString.Exclude
    private Campana campana;

    @Column(length = 255)
    private String referencia;

    @OneToOne(mappedBy = "lead", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private PerfilFinanciero perfilFinanciero;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
