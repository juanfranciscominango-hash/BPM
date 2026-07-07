package com.innovacred.bpm;

import com.innovacred.bpm.application.service.FormulaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BpmLibraryUtilsTest {

    @Autowired
    private FormulaService formulaService;

    @Test
    public void testLibraryRulesEvaluation() {
        Map<String, Object> variables = new HashMap<>();
        
        // 1. Test age calculation
        Object ageRes = formulaService.evaluateFormula("@bpmUtils.calcularEdad('2000-01-01')", variables);
        assertNotNull(ageRes);
        assertTrue((Integer) ageRes > 20);
        
        // 2. Test weekend check (2026-07-04 was a Saturday)
        Object isWeekend = formulaService.evaluateFormula("@bpmUtils.esFinSemana('2026-07-04')", variables);
        assertEquals(true, isWeekend);
        
        // 3. Test weekday check (2026-07-06 was a Monday)
        Object isWeekendMon = formulaService.evaluateFormula("@bpmUtils.esFinSemana('2026-07-06')", variables);
        assertEquals(false, isWeekendMon);

        // 4. Test Ecuadorian ID validation
        Object isValidCedula = formulaService.evaluateFormula("@bpmUtils.validarCedulaEcuatoriana('1722245220')", variables);
        assertEquals(true, isValidCedula);

        Object isInvalidCedula = formulaService.evaluateFormula("@bpmUtils.validarCedulaEcuatoriana('1722245229')", variables);
        assertEquals(false, isInvalidCedula);

        // 5. Test currency formatting
        Object formattedCurrency = formulaService.evaluateFormula("@bpmUtils.formatearMoneda(1250.50)", variables);
        assertNotNull(formattedCurrency);
        assertTrue(formattedCurrency.toString().contains("1.250") || formattedCurrency.toString().contains("1,250"));
    }
}
