package com.innovacred.bpm.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditOperationResponseDto {
    private String operacionId;
    private BigDecimal montoAprobado;
    private Integer plazoMeses;
    private BigDecimal tasaInteres;
}
