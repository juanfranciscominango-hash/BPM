package com.innovacred.bpm.infrastructure.adapter.bpm;

import com.innovacred.bpm.application.service.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component("restConnectorDelegate")
@RequiredArgsConstructor
public class RestConnectorDelegate implements JavaDelegate {

    private final ExternalApiService externalApiService;

    @Override
    public void execute(DelegateExecution execution) {
        // Obtenemos el nombre de la API desde una extensión de la tarea o variable
        String apiName = (String) execution.getVariable("apiName");
        
        if (apiName == null) {
            throw new RuntimeException("Variable 'apiName' es requerida para el conector REST");
        }

        Map<String, Object> variables = execution.getVariables();
        var response = externalApiService.executeApi(apiName, variables);
        
        // Guardamos la respuesta en el proceso
        execution.setVariable(apiName + "_response", response.getBody());
        execution.setVariable(apiName + "_status", response.getStatusCode().value());
    }
}
