package com.innovacred.bpm.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmortizationInstallmentDto {
    private Integer numeroCuota;
    private LocalDate fechaPago;
    private BigDecimal cuota;
    private BigDecimal capital;
    private BigDecimal interes;
    private BigDecimal seguroDesgravamen;
    private BigDecimal cuotaTotal;
    private BigDecimal saldoDeudor;
}
