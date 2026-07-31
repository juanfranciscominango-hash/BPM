package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.TurneroService;
import com.innovacred.bpm.domain.entity.TuServicio;
import com.innovacred.bpm.domain.entity.TuTurno;
import com.innovacred.bpm.domain.entity.TuVentanilla;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuServicioRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuTurnoRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuVentanillaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/turnero")
@RequiredArgsConstructor
@Slf4j
public class TurneroRestController {

    private final TurneroService turneroService;
    private final TuServicioRepository servicioRepository;
    private final TuVentanillaRepository ventanillaRepository;
    private final TuTurnoRepository turnoRepository;

    @GetMapping("/servicios")
    public ResponseEntity<List<TuServicio>> getServiciosActivos() {
        return ResponseEntity.ok(servicioRepository.findByActivoTrueOrderByPrioridadAsc());
    }

    @GetMapping("/ventanillas")
    public ResponseEntity<List<TuVentanilla>> getVentanillas() {
        return ResponseEntity.ok(ventanillaRepository.findAll());
    }

    @PostMapping("/emitir")
    public ResponseEntity<TuTurno> emitirTurno(@RequestBody Map<String, String> payload) {
        String codigoServicio = payload.get("codigoServicio");
        String identificacionCliente = payload.get("identificacionCliente");
        String nombreCliente = payload.get("nombreCliente");

        TuTurno turno = turneroService.emitirTurno(codigoServicio, identificacionCliente, nombreCliente);
        return ResponseEntity.ok(turno);
    }

    @PostMapping("/llamar-siguiente")
    public ResponseEntity<TuTurno> llamarSiguiente(@RequestBody Map<String, Object> payload) {
        Integer numeroVentanilla = Integer.parseInt(payload.get("numeroVentanilla").toString());
        String usuarioAsesor = payload.getOrDefault("usuarioAsesor", "Asesor").toString();

        TuTurno turno = turneroService.llamarSiguienteTurno(numeroVentanilla, usuarioAsesor);
        return ResponseEntity.ok(turno);
    }

    @PostMapping("/rellamar/{turnoId}")
    public ResponseEntity<TuTurno> rellamar(@PathVariable Long turnoId) {
        return ResponseEntity.ok(turneroService.rellamarTurno(turnoId));
    }

    @PostMapping("/iniciar-atencion/{turnoId}")
    public ResponseEntity<TuTurno> iniciarAtencion(@PathVariable Long turnoId) {
        return ResponseEntity.ok(turneroService.iniciarAtencion(turnoId));
    }

    @PostMapping("/finalizar/{turnoId}")
    public ResponseEntity<TuTurno> finalizar(@PathVariable Long turnoId, @RequestBody(required = false) Map<String, String> payload) {
        String observaciones = payload != null ? payload.getOrDefault("observaciones", "Atención finalizada") : "Atención finalizada";
        return ResponseEntity.ok(turneroService.finalizarAtencion(turnoId, observaciones));
    }

    @PostMapping("/ausente/{turnoId}")
    public ResponseEntity<TuTurno> marcarAusente(@PathVariable Long turnoId) {
        return ResponseEntity.ok(turneroService.marcarAusente(turnoId));
    }

    @PostMapping("/derivar/{turnoId}")
    public ResponseEntity<TuTurno> derivar(@PathVariable Long turnoId, @RequestBody Map<String, String> payload) {
        String nuevoServicio = payload.get("nuevoCodigoServicio");
        return ResponseEntity.ok(turneroService.derivarTurno(turnoId, nuevoServicio));
    }

    @GetMapping("/display-tv")
    public ResponseEntity<Map<String, Object>> getDisplayTvData() {
        return ResponseEntity.ok(turneroService.obtenerEstadoDisplayTv());
    }

    @GetMapping("/cola")
    public ResponseEntity<List<TuTurno>> getColaPendiente() {
        return ResponseEntity.ok(turnoRepository.findTurnosEnColaProximo());
    }
}
