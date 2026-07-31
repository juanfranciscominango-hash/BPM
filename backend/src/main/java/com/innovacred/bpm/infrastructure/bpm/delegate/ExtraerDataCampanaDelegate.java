package com.innovacred.bpm.infrastructure.bpm.delegate;

import com.innovacred.bpm.application.service.CampanaMensajeriaService;
import com.innovacred.bpm.domain.entity.CampanaMensajeria;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Service Task Delegate — Etapa 2 del flujo de Mensajería Automática.
 *
 * Lee las variables del proceso (filtros del formulario de la Etapa 1),
 * persiste la campaña en la base de datos y extrae los destinatarios
 * aplicando los filtros dinámicos configurados.
 *
 * Variables de entrada esperadas (seteadas por el formulario Tarea 1):
 *   - campana_nombre       (String)
 *   - campana_canal        (String) EMAIL | SMS | PORTAL
 *   - campana_asunto       (String)
 *   - campana_mensaje      (String)
 *   - filtro_estado        (String)
 *   - filtro_producto      (String)
 *   - filtro_edad_desde    (Integer)
 *   - filtro_edad_hasta    (Integer)
 *   - filtro_monto_minimo  (Double)
 *   - filtro_agencia       (String)
 *
 * Variables de salida escritas en el proceso:
 *   - campana_id             (Long)
 *   - total_destinatarios    (Integer)
 *   - preview_total_email    (Integer)
 *   - preview_total_sms      (Integer)
 *   - preview_total_portal   (Integer)
 */
@Component("extraerDataCampanaTask")
@RequiredArgsConstructor
@Slf4j
public class ExtraerDataCampanaDelegate implements JavaDelegate {

    private final CampanaMensajeriaService campanaMensajeriaService;

    @Override
    public void execute(DelegateExecution execution) {
        log.info("[ExtraerDataCampanaDelegate] Iniciando extracción de data para instancia: {}",
                execution.getProcessInstanceId());

        // 1. Construir la entidad desde las variables del proceso
        // 1. Construir la entidad desde las variables del proceso (soportando camelCase y snake_case)
        String nombre = getString(execution, "nombreCampana", getString(execution, "campana_nombre", "Campaña sin nombre"));
        String canal = getString(execution, "canalEnvio", getString(execution, "campana_canal", "PORTAL"));
        String asunto = getString(execution, "asunto", getString(execution, "campana_asunto", ""));
        String mensaje = getString(execution, "cuerpoMensaje", getString(execution, "campana_mensaje", ""));
        String agencia = getString(execution, "filtroAgencia", getString(execution, "filtro_agencia", null));
        String estado = getString(execution, "filtroEstado", getString(execution, "filtro_estado", null));

        CampanaMensajeria campana = CampanaMensajeria.builder()
                .nombre(nombre)
                .canal(canal)
                .asuntoEmail(asunto)
                .cuerpoMensaje(mensaje)
                .filtroEstadoProceso(estado)
                .filtroProducto(getString(execution, "filtro_producto", null))
                .filtroEdadDesde(getInteger(execution, "filtro_edad_desde"))
                .filtroEdadHasta(getInteger(execution, "filtro_edad_hasta"))
                .filtroMontoMinimo(getDouble(execution, "filtro_monto_minimo"))
                .filtroAgencia(agencia)
                .responsable(getString(execution, "initiator", "sistema"))
                .processInstanceId(execution.getProcessInstanceId())
                .estado("BORRADOR")
                .build();

        // 2. Guardar borrador inicial
        CampanaMensajeria guardada = campanaMensajeriaService.guardar(campana);
        log.info("[ExtraerDataCampanaDelegate] Campaña guardada con ID: {} (Nombre: {}, Canal: {})", guardada.getId(), nombre, canal);

        Object gridCriterios = execution.getVariable("gridCriteriosSegmentacion");
        if (gridCriterios != null) {
            log.info("[ExtraerDataCampanaDelegate] Criterios dinámicos de segmentación recibidos: {}", gridCriterios);
        }

        Object gridBotones = execution.getVariable("gridBotonesInteractivos");
        if (gridBotones != null) {
            log.info("[ExtraerDataCampanaDelegate] Botones interactivos CTA recibidos: {}", gridBotones);
        }

        String tipoEncabezado = getString(execution, "tipoEncabezado", "NINGUNO");
        String urlHeaderMedia = getString(execution, "urlHeaderMedia", "");
        String piePagina = getString(execution, "piePagina", "");

        log.info("[ExtraerDataCampanaDelegate] Configuración rica de notificación - Encabezado: {}, MediaURL: {}, PiePagina: {}",
                tipoEncabezado, urlHeaderMedia, piePagina);

        // 3. Extraer destinatarios y calcular métricas de preview
        CampanaMensajeria conMetricas = campanaMensajeriaService
                .extraerDestinatariosYCalcularMetricas(execution.getProcessInstanceId());

        // 4. Escribir resultados como variables del proceso (soportando camelCase y snake_case)
        execution.setVariable("campana_id",           conMetricas.getId());

        // Snake case / preview prefix
        execution.setVariable("total_destinatarios",   conMetricas.getTotalDestinatarios());
        execution.setVariable("preview_total_email",   conMetricas.getTotalEmail());
        execution.setVariable("preview_total_sms",     conMetricas.getTotalSms());
        execution.setVariable("preview_total_portal",  conMetricas.getTotalPortal());
        execution.setVariable("preview_total_whatsapp",conMetricas.getTotalWhatsapp());
        execution.setVariable("total_whatsapp",        conMetricas.getTotalWhatsapp());

        // CamelCase (nombres usados por los formularios dinámicos)
        execution.setVariable("totalDestinatarios",  conMetricas.getTotalDestinatarios());
        execution.setVariable("totalEmail",          conMetricas.getTotalEmail());
        execution.setVariable("totalSms",            conMetricas.getTotalSms());
        execution.setVariable("totalPortal",         conMetricas.getTotalPortal());
        execution.setVariable("totalWhatsapp",       conMetricas.getTotalWhatsapp());

        log.info("[ExtraerDataCampanaDelegate] Extracción completada. Total destinatarios: {} (Email: {}, Portal: {}, SMS: {}, WhatsApp: {})",
                conMetricas.getTotalDestinatarios(), conMetricas.getTotalEmail(), conMetricas.getTotalPortal(), conMetricas.getTotalSms(), conMetricas.getTotalWhatsapp());
    }

    // ── Helpers tipados ──────────────────────────────────────────
    private String getString(DelegateExecution e, String key, String defaultVal) {
        Object val = e.getVariable(key);
        return val != null ? val.toString() : defaultVal;
    }

    private Integer getInteger(DelegateExecution e, String key) {
        Object val = e.getVariable(key);
        if (val == null) return null;
        try { return Integer.parseInt(val.toString()); } catch (NumberFormatException ex) { return null; }
    }

    private Double getDouble(DelegateExecution e, String key) {
        Object val = e.getVariable(key);
        if (val == null) return null;
        try { return Double.parseDouble(val.toString()); } catch (NumberFormatException ex) { return null; }
    }
}
