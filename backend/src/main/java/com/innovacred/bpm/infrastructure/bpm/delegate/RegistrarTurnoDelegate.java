package com.innovacred.bpm.infrastructure.bpm.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("registrarTurnoTaskDelegate")
@RequiredArgsConstructor
@Slf4j
public class RegistrarTurnoDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) {
        String codigoTurno = (String) execution.getVariable("codigoTurno");
        log.info("[RegistrarTurnoDelegate] Turno '{}' encolado correctamente en Flowable Engine. Instancia: {}",
                codigoTurno, execution.getProcessInstanceId());
    }
}
