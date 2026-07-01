package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.dto.AmortizationInstallmentDto;
import com.innovacred.bpm.domain.dto.AmortizationTableResponseDto;
import com.innovacred.bpm.domain.dto.CreditOperationRequestDto;
import com.innovacred.bpm.domain.dto.CreditOperationResponseDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CreditOperationService {

    public CreditOperationResponseDto generateCreditOperation(CreditOperationRequestDto request) {
        String operacionId = "OP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return CreditOperationResponseDto.builder()
                .operacionId(operacionId)
                .montoAprobado(request.getMonto())
                .plazoMeses(request.getPlazoMeses())
                .tasaInteres(request.getTasaInteres())
                .build();
    }
    
    public AmortizationTableResponseDto generateAmortizationTable(CreditOperationRequestDto request) {
        BigDecimal monto = request.getMonto();
        Integer plazo = request.getPlazoMeses();
        // Tasa anual a tasa mensual (ej. 16% -> 0.16 / 12)
        BigDecimal tasaMensual = request.getTasaInteres().divide(new BigDecimal("100"), 8, RoundingMode.HALF_UP)
                .divide(new BigDecimal("12"), 8, RoundingMode.HALF_UP);
        LocalDate fechaDesembolso = request.getFechaDesembolso() != null ? request.getFechaDesembolso() : LocalDate.now();

        List<AmortizationInstallmentDto> cuotas = new ArrayList<>();

        BigDecimal cuotaFija = BigDecimal.ZERO;
        if (tasaMensual.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal factor = BigDecimal.ONE.add(tasaMensual).pow(plazo);
            BigDecimal numerador = monto.multiply(tasaMensual).multiply(factor);
            BigDecimal denominador = factor.subtract(BigDecimal.ONE);
            cuotaFija = numerador.divide(denominador, 2, RoundingMode.HALF_UP);
        } else {
            cuotaFija = monto.divide(new BigDecimal(plazo), 2, RoundingMode.HALF_UP);
        }

        BigDecimal saldoDeudor = monto;

        for (int i = 1; i <= plazo; i++) {
            BigDecimal interes = saldoDeudor.multiply(tasaMensual).setScale(2, RoundingMode.HALF_UP);
            BigDecimal capital = cuotaFija.subtract(interes).setScale(2, RoundingMode.HALF_UP);
            
            if (i == plazo) {
                capital = saldoDeudor;
                cuotaFija = capital.add(interes);
            }
            
            saldoDeudor = saldoDeudor.subtract(capital).setScale(2, RoundingMode.HALF_UP);
            
            if (saldoDeudor.compareTo(BigDecimal.ZERO) < 0) {
                saldoDeudor = BigDecimal.ZERO;
            }

            cuotas.add(AmortizationInstallmentDto.builder()
                    .numeroCuota(i)
                    .fechaPago(fechaDesembolso.plusMonths(i))
                    .cuota(cuotaFija)
                    .capital(capital)
                    .interes(interes)
                    .saldoDeudor(saldoDeudor)
                    .build());
        }

        return AmortizationTableResponseDto.builder()
                .tablaAmortizacion(cuotas)
                .build();
    }
}
