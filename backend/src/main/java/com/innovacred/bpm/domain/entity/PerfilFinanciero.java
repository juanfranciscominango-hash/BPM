package com.innovacred.bpm.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "crm_perfil_financiero")
@Data
public class PerfilFinanciero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ingresos_mensuales", precision = 15, scale = 2)
    private BigDecimal ingresosMensuales;

    @Column(name = "valor_maximo_prestamo", precision = 15, scale = 2)
    private BigDecimal valorMaximoPrestamo;

    @Column(name = "valor_maximo_endeudamiento", precision = 15, scale = 2)
    private BigDecimal valorMaximoEndeudamiento;

    @Column(name = "cuota_estimada_mensual", precision = 15, scale = 2)
    private BigDecimal cuotaEstimadaMensual;

    @OneToMany(mappedBy = "perfilFinanciero", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeudaExterna> deudasOtrasEntidades = new ArrayList<>();

    @OneToMany(mappedBy = "perfilFinanciero", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TarjetaCredito> tarjetasCredito = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    @JsonIgnore
    @ToString.Exclude
    private Lead lead;

    // Helper methods for bidirectional relationships
    public void addDeuda(DeudaExterna deuda) {
        deudasOtrasEntidades.add(deuda);
        deuda.setPerfilFinanciero(this);
    }

    public void removeDeuda(DeudaExterna deuda) {
        deudasOtrasEntidades.remove(deuda);
        deuda.setPerfilFinanciero(null);
    }

    public void addTarjeta(TarjetaCredito tarjeta) {
        tarjetasCredito.add(tarjeta);
        tarjeta.setPerfilFinanciero(this);
    }

    public void removeTarjeta(TarjetaCredito tarjeta) {
        tarjetasCredito.remove(tarjeta);
        tarjeta.setPerfilFinanciero(null);
    }
}
