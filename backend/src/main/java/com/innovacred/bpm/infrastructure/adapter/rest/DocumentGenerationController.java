package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.CreditOperationService;
import com.innovacred.bpm.application.service.PdfGeneratorService;
import com.innovacred.bpm.domain.dto.AmortizationTableResponseDto;
import com.innovacred.bpm.domain.dto.CreditOperationRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentGenerationController {

    private final PdfGeneratorService pdfGeneratorService;
    private final CreditOperationService creditOperationService;

    @PostMapping("/contrato")
    public ResponseEntity<Map<String, String>> generarContrato(@RequestBody Map<String, Object> requestVariables) {
        log.info("Generando contrato con variables: {}", requestVariables);
        try {
            Map<String, Object> variables = normalizeVariables(requestVariables);
            String base64 = pdfGeneratorService.generatePdfFromHtml("contrato", variables);
            
            Map<String, String> response = new HashMap<>();
            response.put("documentBase64", base64);
            response.put("fileName", "Contrato_" + variables.getOrDefault("identificacion", "000") + ".pdf");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al generar el contrato", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/pagare")
    public ResponseEntity<Map<String, String>> generarPagare(@RequestBody Map<String, Object> requestVariables) {
        log.info("Generando pagare con variables: {}", requestVariables);
        try {
            Map<String, Object> variables = normalizeVariables(requestVariables);
            
            // Generar la tabla de amortización para el pagaré
            BigDecimal monto = new BigDecimal(variables.getOrDefault("monto_aprobado", "0").toString());
            Integer plazo = Integer.valueOf(variables.getOrDefault("plazo_aprobado", "0").toString());
            
            CreditOperationRequestDto creditReq = CreditOperationRequestDto.builder()
                    .monto(monto)
                    .plazoMeses(plazo)
                    .tasaInteres(new BigDecimal("16.0"))
                    .build();
                    
            AmortizationTableResponseDto table = creditOperationService.generateAmortizationTable(creditReq);
            variables.put("tablaAmortizacion", table.getTablaAmortizacion());
            variables.put("monto", monto);
            variables.put("plazoMeses", plazo);
            variables.put("tasaInteres", "16.0");
            
            String base64 = pdfGeneratorService.generatePdfFromHtml("pagare", variables);
            
            Map<String, String> response = new HashMap<>();
            response.put("documentBase64", base64);
            response.put("fileName", "Pagare_" + variables.getOrDefault("identificacion", "000") + ".pdf");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al generar el pagare", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private Map<String, Object> normalizeVariables(Map<String, Object> input) {
        Map<String, Object> output = new HashMap<>(input);
        
        // Mapear nombres de variables de la pantalla a los esperados por la plantilla
        if (input.containsKey("interviniente_int_nombres_completos")) {
            output.put("nombresCompletos", input.get("interviniente_int_nombres_completos"));
        }
        if (input.containsKey("interviniente_int_identificacion")) {
            output.put("identificacion", input.get("interviniente_int_identificacion"));
        }
        if (input.containsKey("monto_aprobado")) {
            output.put("monto", input.get("monto_aprobado"));
        }
        if (input.containsKey("plazo_aprobado")) {
            output.put("plazoMeses", input.get("plazo_aprobado"));
        }
        
        return output;
    }
}
