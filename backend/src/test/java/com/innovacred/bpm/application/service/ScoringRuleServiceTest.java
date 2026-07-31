package com.innovacred.bpm.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ScoringRuleServiceTest {

    private ScoringRuleService scoringRuleService;

    @BeforeEach
    void setUp() {
        scoringRuleService = new ScoringRuleService();
    }

    @Test
    void testEvaluateScoring_Aprobado() {
        // Given: Cliente con altos ingresos y pocas deudas
        Map<String, Object> variables = new HashMap<>();
        variables.put("ingresos", "5000"); // Gana 5000
        variables.put("deudas", "500");    // Paga 500 en otras deudas
        variables.put("monto", "10000");   // Pide 10,000
        variables.put("plazo", "60");      // A 60 meses
        variables.put("tasa", "12.0");     // 12% anual

        // When
        Map<String, Object> result = scoringRuleService.evaluateScoring(variables);

        // Then
        // Su cuota será baja (~222), total deudas: 722. DTI = 722/5000 = ~14.4%
        Double dti = (Double) result.get("dti");
        assertTrue(dti < 35.0, "El DTI debería ser menor al 35% para ingresos altos");
        assertEquals("APROBADO", result.get("decision"));
    }

    @Test
    void testEvaluateScoring_Rechazado() {
        // Given: Cliente con bajos ingresos y deudas altas
        Map<String, Object> variables = new HashMap<>();
        variables.put("ingresos", "1000");
        variables.put("deudas", "600");
        variables.put("monto", "5000");
        variables.put("plazo", "12");
        variables.put("tasa", "15.0");

        // When
        Map<String, Object> result = scoringRuleService.evaluateScoring(variables);

        // Then
        // Su cuota será alta (~451), total deudas: 1051. DTI = 1051/1000 = ~105.1%
        Double dti = (Double) result.get("dti");
        assertTrue(dti > 50.0, "El DTI debería ser mayor al 50% para alto endeudamiento");
        assertEquals("RECHAZADO", result.get("decision"));
    }

    @Test
    void testEvaluateScoring_DatosInsuficientes() {
        // Given: Falta información clave
        Map<String, Object> variables = new HashMap<>();
        variables.put("ingresos", "0");
        variables.put("deudas", "0");
        variables.put("monto", "0");
        variables.put("plazo", "0");
        variables.put("tasa", "0");

        // When
        Map<String, Object> result = scoringRuleService.evaluateScoring(variables);

        // Then
        assertEquals("RECHAZADO", result.get("decision"));
        assertEquals("Datos insuficientes o inválidos para evaluación.", result.get("justificacion"));
    }
}
