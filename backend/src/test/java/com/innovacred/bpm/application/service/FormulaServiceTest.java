package com.innovacred.bpm.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.BeanFactory;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class FormulaServiceTest {

    @Mock
    private BeanFactory beanFactory;

    @InjectMocks
    private FormulaService formulaService;

    @Test
    void testEvaluateFormula() {
        // Given
        String expression = "(monto * tasa) / 100";
        Map<String, Object> variables = new HashMap<>();
        variables.put("monto", 5000);
        variables.put("tasa", 15);

        // When
        Object result = formulaService.evaluateFormula(expression, variables);

        // Then
        // 5000 * 15 / 100 = 750
        assertEquals(750, result);
    }

    @Test
    void testEvaluateFormula_LogicExpression() {
        // Given
        String expression = "edad >= 18 and ingresos > 1000";
        Map<String, Object> variables = new HashMap<>();
        variables.put("edad", 25);
        variables.put("ingresos", 1500);

        // When
        Object result = formulaService.evaluateFormula(expression, variables);

        // Then
        assertEquals(true, result);
    }
}
