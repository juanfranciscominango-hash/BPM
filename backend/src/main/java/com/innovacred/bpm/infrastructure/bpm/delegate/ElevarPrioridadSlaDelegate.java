package com.innovacred.bpm.infrastructure.bpm.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("elevarPrioridadSlaTaskDelegate")
@RequiredArgsConstructor
@Slf4j
public class ElevarPrioridadSlaDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) {
        String codigoTurno = (String) execution.getVariable("codigoTurno");
        log.warn("[ElevarPrioridadSlaDelegate] ⚠️ SLA de espera excedido para el turno '{}'. Elevando prioridad a nivel máximo.", codigoTurno);
    }
}
