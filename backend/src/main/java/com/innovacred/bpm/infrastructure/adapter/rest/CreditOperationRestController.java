package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.CreditOperationService;
import com.innovacred.bpm.domain.dto.AmortizationTableResponseDto;
import com.innovacred.bpm.domain.dto.CreditOperationRequestDto;
import com.innovacred.bpm.domain.dto.CreditOperationResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/credit-operation")
@RequiredArgsConstructor
public class CreditOperationRestController {

    private final CreditOperationService creditOperationService;

    @PostMapping("/generate-operation")
    public ResponseEntity<CreditOperationResponseDto> generateCreditOperation(@RequestBody CreditOperationRequestDto request) {
        log.info("Generando operacion de credito con parametros: {}", request);
        try {
            CreditOperationResponseDto response = creditOperationService.generateCreditOperation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al generar la operacion de credito", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/generate-amortization")
    public ResponseEntity<AmortizationTableResponseDto> generateAmortizationTable(@RequestBody CreditOperationRequestDto request) {
        log.info("Generando tabla de amortizacion con parametros: {}", request);
        try {
            AmortizationTableResponseDto response = creditOperationService.generateAmortizationTable(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al generar tabla de amortizacion", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
