package com.innovacred.bpm.infrastructure.adapter.in.web;

import com.innovacred.bpm.application.service.CampanaMensajeriaService;
import com.innovacred.bpm.domain.entity.CampanaMensajeria;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller para el módulo de Mensajería Automática de Campañas.
 * Expone los endpoints necesarios para que el portal Angular pueda
 * consultar el estado y las métricas de las campañas.
 */
@RestController
@RequestMapping("/api/campanas-mensajeria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CampanaMensajeriaController {

    private final CampanaMensajeriaService campanaMensajeriaService;

    /** Listar todas las campañas */
    @GetMapping
    public List<CampanaMensajeria> listarTodas() {
        return campanaMensajeriaService.listarTodas();
    }

    /** Buscar campaña por ID */
    @GetMapping("/{id}")
    public ResponseEntity<CampanaMensajeria> buscarPorId(@PathVariable Long id) {
        return campanaMensajeriaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Buscar campaña por processInstanceId (para uso del portal BPM) */
    @GetMapping("/proceso/{processInstanceId}")
    public ResponseEntity<CampanaMensajeria> buscarPorProceso(@PathVariable String processInstanceId) {
        return campanaMensajeriaService.buscarPorProcessInstanceId(processInstanceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
