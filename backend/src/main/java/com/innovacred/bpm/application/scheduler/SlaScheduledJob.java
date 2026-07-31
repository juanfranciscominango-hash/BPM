package com.innovacred.bpm.application.scheduler;

import com.innovacred.bpm.application.service.TaskSlaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaScheduledJob {

    private final TaskSlaService taskSlaService;

    /**
     * Ejecuta la verificación de SLAs cada 5 minutos.
     * Busca tareas activas cuyo tiempo haya excedido el SLA configurado
     * y ejecuta la acción definida (notificar, reasignar o escalar).
     */
    @Scheduled(fixedRate = 300_000) // cada 5 minutos
    public void checkExpiredSlas() {
        log.debug("Ejecutando verificación de SLAs...");
        try {
            taskSlaService.checkExpiredTasks();
        } catch (Exception e) {
            log.error("Error en verificación de SLAs: {}", e.getMessage(), e);
        }
    }
}
