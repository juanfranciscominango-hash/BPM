package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ProcessService;
import com.innovacred.bpm.domain.entity.ProcessDefinition;
import com.innovacred.bpm.infrastructure.aspect.Auditable;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/processes")
@RequiredArgsConstructor
public class ProcessRestController {

    private final ProcessService processService;

    @GetMapping
    public List<ProcessDefinition> listAll() {
        return processService.listAll();
    }

    @PostMapping
    @Auditable(accion = "GUARDAR_PROCESO", entidad = "DefinicionProceso")
    public ProcessDefinition save(@RequestBody ProcessDefinition process) {
        return processService.save(process);
    }

    @PostMapping("/{id}/deploy")
    @Auditable(accion = "DESPLEGAR_PROCESO", entidad = "DefinicionProceso")
    public ProcessDefinition deploy(@PathVariable Long id) {
        return processService.deploy(id);
    }

    @PostMapping("/{key}/start")
    @Auditable(accion = "INICIAR_TRAMITE", entidad = "InstanciaProceso")
    public void start(@PathVariable String key, @RequestBody Map<String, Object> variables) {
        processService.startInstance(key, variables);
    }

    @GetMapping("/{id}")
    public ProcessDefinition getById(@PathVariable Long id) {
        return processService.getById(id);
    }

    @GetMapping("/definition/{procDefId}")
    public ProcessDefinition getByProcDefId(@PathVariable String procDefId) {
        return processService.getByProcDefId(procDefId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        processService.delete(id);
    }
}
