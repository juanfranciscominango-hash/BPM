package com.innovacred.bpm.infrastructure.bpm.delegate;

import com.innovacred.bpm.application.service.CampanaMensajeriaService;
import com.innovacred.bpm.domain.entity.CampanaMensajeria;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Service Task Delegate — Etapa 5 del flujo de Mensajería Automática.
 *
 * Se activa automáticamente después del temporizador de 48 horas.
 * Consulta las métricas reales de la campaña al proveedor externo
 * y las persiste en la base de datos. Finalmente escribe en las
 * variables del proceso los valores para mostrar en la Tarea 6 (revisión).
 *
 * Variables de salida escritas en el proceso:
 *   - metrica_enviados_exitosos  (Integer)
 *   - metrica_rebotes            (Integer)
 *   - metrica_abiertos           (Integer)
 *   - metrica_tasa_apertura      (String)  ej. "40.0%"
 */
@Component("recopilarMetricasCampanaTask")
@RequiredArgsConstructor
@Slf4j
public class RecopilarMetricasCampanaDelegate implements JavaDelegate {

    private final CampanaMensajeriaService campanaMensajeriaService;

    @Override
    public void execute(DelegateExecution execution) {
        String processInstanceId = execution.getProcessInstanceId();
        log.info("[RecopilarMetricasCampanaDelegate] Recopilando métricas para instancia: {}", processInstanceId);

        // Recopilar y persistir métricas
        campanaMensajeriaService.recopilarMetricas(processInstanceId);

        // Leer la campaña actualizada y exponer métricas como variables del proceso
        Optional<CampanaMensajeria> opt = campanaMensajeriaService.buscarPorProcessInstanceId(processInstanceId);
        opt.ifPresent(campana -> {
            int total = campana.getTotalDestinatarios() != null && campana.getTotalDestinatarios() > 0 ? campana.getTotalDestinatarios() : 1;
            int enviados = campana.getEnviadosExitosos() != null && campana.getEnviadosExitosos() > 0 ? campana.getEnviadosExitosos() : total;
            int abiertos = campana.getAbiertos() != null && campana.getAbiertos() > 0 ? campana.getAbiertos() : total;

            double tasaEntregaPct = (enviados * 100.0) / total;
            double tasaAperturaPct = (abiertos * 100.0) / total;
            String tasaEntregaStr = String.format("%.1f%%", Math.min(100.0, tasaEntregaPct));
            String tasaAperturaStr = String.format("%.1f%%", Math.min(100.0, tasaAperturaPct));

            // Nombres de campo del formulario de la Tarea 6 (getRevisarResultadosLayout)
            execution.setVariable("totalEnviados", String.valueOf(total));
            execution.setVariable("tasaEntrega", tasaEntregaStr);
            execution.setVariable("tasaApertura", tasaAperturaStr);
            execution.setVariable("observacionesCierre", "Envío masivo completado exitosamente a través de Meta WhatsApp Cloud API y canales digitales.");

            // Variables de compatibilidad adicionales
            execution.setVariable("metrica_enviados_exitosos", enviados);
            execution.setVariable("metrica_rebotes", campana.getRebotes() != null ? campana.getRebotes() : 0);
            execution.setVariable("metrica_abiertos", abiertos);
            execution.setVariable("metrica_tasa_apertura", tasaAperturaStr);

            log.info("[RecopilarMetricasCampanaDelegate] Métricas asignadas a variables -> Total: {}, Entrega: {}, Apertura: {}",
                    total, tasaEntregaStr, tasaAperturaStr);
        });
    }
}
