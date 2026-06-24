package com.innovacred.bpm.infrastructure.bpm.delegate;

import com.innovacred.bpm.application.service.FormulaService;
import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Service Task Delegate para ejecutar una fórmula dinámica dentro de un proceso de Flowable.
 * Se espera que el proceso defina los siguientes Field Injections:
 * - formulaKey: La clave única de la fórmula a evaluar
 * - resultVariable: El nombre de la variable donde se guardará el resultado
 */
@Component("evaluateFormulaDelegate")
@RequiredArgsConstructor
public class EvaluateFormulaDelegate implements JavaDelegate {

    private final FormulaService formulaService;
    
    private org.flowable.common.engine.api.delegate.Expression formulaKey;
    private org.flowable.common.engine.api.delegate.Expression resultVariable;

    @Override
    public void execute(DelegateExecution execution) {
        if (formulaKey == null || resultVariable == null) {
            throw new IllegalArgumentException("formulaKey y resultVariable son requeridos para EvaluateFormulaDelegate");
        }
        
        String key = (String) formulaKey.getValue(execution);
        String resultVarName = (String) resultVariable.getValue(execution);
        
        Map<String, Object> processVariables = execution.getVariables();
        
        Object result = formulaService.evaluateFormulaByKey(key, processVariables);
        
        execution.setVariable(resultVarName, result);
    }
}
