package com.innovacred.bpm.infrastructure.bpm.delegate;

import com.innovacred.bpm.application.service.CampanaMensajeriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Service Task Delegate — Etapa 4 del flujo de Mensajería Automática.
 *
 * Se activa cuando el Responsable confirma el envío en el preview (Tarea 3).
 * Orquesta el envío masivo a través del canal configurado
 * (EMAIL, SMS o PORTAL) delegando la lógica al CampanaMensajeriaService.
 *
 * Prerequisitos:
 *   - La variable "decision" debe ser 'ENVIAR'
 *   - La campaña debe existir en BD con estado PREVIEW
 *
 * Variables de entrada esperadas:
 *   - processInstanceId (automático vía Flowable)
 */
@Component("ejecutarEnvioMasivoTask")
@RequiredArgsConstructor
@Slf4j
public class EjecutarEnvioMasivoDelegate implements JavaDelegate {

    private final CampanaMensajeriaService campanaMensajeriaService;

    @Override
    public void execute(DelegateExecution execution) {
        String processInstanceId = execution.getProcessInstanceId();
        log.info("[EjecutarEnvioMasivoDelegate] Iniciando envío masivo para instancia: {}", processInstanceId);

        campanaMensajeriaService.ejecutarEnvioMasivo(processInstanceId);

        log.info("[EjecutarEnvioMasivoDelegate] Envío masivo completado para instancia: {}", processInstanceId);
    }
}
