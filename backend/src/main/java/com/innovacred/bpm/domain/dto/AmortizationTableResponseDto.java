package com.innovacred.bpm.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmortizationTableResponseDto {
    private List<AmortizationInstallmentDto> tablaAmortizacion;
}
