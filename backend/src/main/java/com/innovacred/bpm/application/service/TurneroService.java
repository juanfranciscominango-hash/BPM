package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.TuServicio;
import com.innovacred.bpm.domain.entity.TuTurno;
import com.innovacred.bpm.domain.entity.TuVentanilla;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuServicioRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuTurnoRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuVentanillaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.task.api.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TurneroService {

    private final TuServicioRepository servicioRepository;
    private final TuVentanillaRepository ventanillaRepository;
    private final TuTurnoRepository turnoRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;

    /**
     * Emite un nuevo turno desde el Kiosco de Autoservicio
     */
    @Transactional
    public TuTurno emitirTurno(String codigoServicio, String identificacionCliente, String nombreCliente) {
        TuServicio servicio = servicioRepository.findByCodigo(codigoServicio.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado: " + codigoServicio));

        LocalDateTime inicioDia = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        Integer maxSecuencia = turnoRepository.findMaxSecuenciaHoy(servicio.getCodigo(), inicioDia);
        int nuevaSecuencia = (maxSecuencia != null ? maxSecuencia : 0) + 1;
        String codigoTurno = String.format("%s-%03d", servicio.getPrefijo(), nuevaSecuencia);

        TuTurno turno = TuTurno.builder()
                .codigoTurno(codigoTurno)
                .secuencia(nuevaSecuencia)
                .identificacionCliente(identificacionCliente)
                .nombreCliente(nombreCliente != null && !nombreCliente.isBlank() ? nombreCliente : "Cliente")
                .servicio(servicio)
                .estado("EMITIDO")
                .fechaEmision(LocalDateTime.now())
                .build();

        turno = turnoRepository.save(turno);

        // Iniciar proceso BPM Flowable
        Map<String, Object> variables = new HashMap<>();
        variables.put("turnoId", turno.getId());
        variables.put("codigoTurno", codigoTurno);
        variables.put("codigoServicio", servicio.getCodigo());
        variables.put("identificacionCliente", identificacionCliente);

        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("flujo_gestion_turnos", variables);
        turno.setProcessInstanceId(processInstance.getId());
        turno.setEstado("EN_ESPERA");
        turno = turnoRepository.save(turno);

        log.info("[TurneroService] Turno emitido exitosamente: {} para servicio {}", codigoTurno, servicio.getNombre());
        return turno;
    }

    /**
     * Llama al siguiente turno en cola para la ventanilla del asesor
     */
    @Transactional
    public TuTurno llamarSiguienteTurno(Integer numeroVentanilla, String usuarioAsesor) {
        TuVentanilla ventanilla = ventanillaRepository.findByNumeroVentanilla(numeroVentanilla)
                .orElseThrow(() -> new RuntimeException("Ventanilla no encontrada: " + numeroVentanilla));

        List<TuTurno> pendientes = turnoRepository.findTurnosEnColaProximo();
        if (pendientes.isEmpty()) {
            log.info("[TurneroService] No hay turnos pendientes en cola para Ventanilla {}", numeroVentanilla);
            return null;
        }

        TuTurno turno = pendientes.get(0);
        turno.setVentanilla(ventanilla);
        turno.setUsuarioAsesor(usuarioAsesor);
        turno.setEstado("LLAMADO");
        turno.setFechaLlamado(LocalDateTime.now());

        if (turno.getFechaEmision() != null) {
            long segundosEspera = Duration.between(turno.getFechaEmision(), turno.getFechaLlamado()).getSeconds();
            turno.setTiempoEsperaSegundos(segundosEspera);
        }

        turno = turnoRepository.save(turno);

        // Avanzar tarea Flowable de "1. En Espera de Llamado en Sala"
        if (turno.getProcessInstanceId() != null) {
            Task task = taskService.createTaskQuery()
                    .processInstanceId(turno.getProcessInstanceId())
                    .singleResult();
            if (task != null) {
                taskService.complete(task.getId());
            }
        }

        log.info("[TurneroService] Turno {} llamado para Ventanilla {} por asesor {}",
                turno.getCodigoTurno(), numeroVentanilla, usuarioAsesor);

        return turno;
    }

    /**
     * Re-llama un turno para sonar/destacar de nuevo en la TV
     */
    @Transactional
    public TuTurno rellamarTurno(Long turnoId) {
        TuTurno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con ID: " + turnoId));
        turno.setFechaLlamado(LocalDateTime.now());
        log.info("[TurneroService] Turno {} re-llamado", turno.getCodigoTurno());
        return turnoRepository.save(turno);
    }

    /**
     * Inicia la atención del turno cuando el cliente llega a la ventanilla
     */
    @Transactional
    public TuTurno iniciarAtencion(Long turnoId) {
        TuTurno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado: " + turnoId));
        turno.setEstado("EN_ATENCION");
        turno.setFechaInicioAtencion(LocalDateTime.now());
        return turnoRepository.save(turno);
    }

    /**
     * Finaliza la atención del turno y completa el flujo BPMN
     */
    @Transactional
    public TuTurno finalizarAtencion(Long turnoId, String observaciones) {
        TuTurno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado: " + turnoId));

        turno.setEstado("FINALIZADO");
        turno.setFechaFinAtencion(LocalDateTime.now());
        turno.setObservaciones(observaciones);

        if (turno.getFechaInicioAtencion() != null) {
            long segundosAtencion = Duration.between(turno.getFechaInicioAtencion(), turno.getFechaFinAtencion()).getSeconds();
            turno.setTiempoAtencionSegundos(segundosAtencion);
        }

        turno = turnoRepository.save(turno);

        // Completar tarea Flowable de "2. Atender Cliente en Ventanilla"
        if (turno.getProcessInstanceId() != null) {
            Task task = taskService.createTaskQuery()
                    .processInstanceId(turno.getProcessInstanceId())
                    .singleResult();
            if (task != null) {
                taskService.complete(task.getId());
            }
        }

        log.info("[TurneroService] Turno {} finalizado con éxito", turno.getCodigoTurno());
        return turno;
    }

    /**
     * Marca un turno como cliente Ausente / No Presentado
     */
    @Transactional
    public TuTurno marcarAusente(Long turnoId) {
        TuTurno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado: " + turnoId));
        turno.setEstado("AUSENTE");
        turno.setFechaFinAtencion(LocalDateTime.now());
        log.info("[TurneroService] Turno {} marcado como AUSENTE", turno.getCodigoTurno());
        return turnoRepository.save(turno);
    }

    /**
     * Deriva un turno a otro servicio/área con prioridad alta
     */
    @Transactional
    public TuTurno derivarTurno(Long turnoId, String nuevoCodigoServicio) {
        TuTurno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado: " + turnoId));
        TuServicio nuevoServicio = servicioRepository.findByCodigo(nuevoCodigoServicio.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado: " + nuevoCodigoServicio));

        turno.setServicio(nuevoServicio);
        turno.setEstado("EN_ESPERA");
        turno.setVentanilla(null);
        turno.setUsuarioAsesor(null);

        log.info("[TurneroService] Turno {} derivado a nuevo servicio {}", turno.getCodigoTurno(), nuevoServicio.getNombre());
        return turnoRepository.save(turno);
    }

    /**
     * Retorna la información en vivo formateada para la pantalla TV de la Sala de Espera
     */
    public Map<String, Object> obtenerEstadoDisplayTv() {
        Map<String, Object> response = new HashMap<>();

        Optional<TuTurno> ultimoLlamado = turnoRepository.findFirstByEstadoOrderByFechaLlamadoDesc("LLAMADO");
        List<TuTurno> recientes = turnoRepository.findTop5ByEstadoInOrderByFechaLlamadoDesc(List.of("LLAMADO", "EN_ATENCION", "FINALIZADO"));

        response.put("turnoActual", ultimoLlamado.orElse(null));
        response.put("recientes", recientes);
        return response;
    }
}
