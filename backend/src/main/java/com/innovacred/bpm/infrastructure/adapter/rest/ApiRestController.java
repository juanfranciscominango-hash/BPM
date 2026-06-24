package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ExternalApiService;
import com.innovacred.bpm.domain.entity.ApiDefinition;
import com.innovacred.bpm.domain.entity.ExternalProcess;
import com.innovacred.bpm.domain.entity.TramaField;
import com.innovacred.bpm.infrastructure.adapter.persistence.ApiDefinitionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.ExternalProcessRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TramaFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api-manager")
@RequiredArgsConstructor
public class ApiRestController {

    private final ApiDefinitionRepository repository;
    private final ExternalApiService externalApiService;
    private final ExternalProcessRepository processRepository;
    private final TramaFieldRepository tramaFieldRepository;
    private final com.innovacred.bpm.application.service.ExternalProcessService externalProcessService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @GetMapping("/definitions")
    public List<ApiDefinition> list() {
        return repository.findAll();
    }

    @PostMapping("/definitions")
    public ApiDefinition save(@RequestBody ApiDefinition definition) {
        return repository.save(definition);
    }

    @PostMapping("/test/{apiName}")
    public ResponseEntity<String> test(@PathVariable String apiName, @RequestBody Map<String, Object> variables) {
        try {
            Map<String, Object> result = externalProcessService.executeProcess(apiName, variables);
            String jsonResult = objectMapper.writeValueAsString(result);
            return ResponseEntity.ok(jsonResult);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // CRUD Procesos Externos
    @GetMapping("/processes")
    public List<ExternalProcess> listProcesses() {
        return processRepository.findAll();
    }

    @PostMapping("/processes")
    @Transactional
    public ExternalProcess saveProcess(@RequestBody ExternalProcess process) {
        boolean isNew = process.getId() == null;
        ExternalProcess saved = processRepository.save(process);
        
        if (isNew) {
            // Sembrar campos por defecto para que la vista de Tramas inicie con datos de ejemplo
            seedDefaultTramas(saved.getId());
        }
        return saved;
    }

    @DeleteMapping("/processes/{id}")
    @Transactional
    public void deleteProcess(@PathVariable Long id) {
        tramaFieldRepository.deleteByProcessId(id);
        processRepository.deleteById(id);
    }

    // CRUD Tramas
    @GetMapping("/processes/{processId}/tramas")
    public List<TramaField> getTramas(@PathVariable Long processId, @RequestParam(required = false) String type) {
        if (type != null) {
            return tramaFieldRepository.findByProcessIdAndTramaType(processId, type);
        }
        return tramaFieldRepository.findByProcessId(processId);
    }

    @PostMapping("/tramas/fields")
    public TramaField saveTramaField(@RequestBody TramaField field) {
        return tramaFieldRepository.save(field);
    }

    @DeleteMapping("/tramas/fields/{id}")
    @Transactional
    public void deleteTramaField(@PathVariable Long id) {
        // Al eliminar, también eliminamos recursivamente los hijos de primer nivel para mantener la consistencia
        List<TramaField> all = tramaFieldRepository.findAll();
        deleteChildren(id, all);
        tramaFieldRepository.deleteById(id);
    }

    private void deleteChildren(Long parentId, List<TramaField> all) {
        for (TramaField f : all) {
            if (parentId.equals(f.getParentId())) {
                deleteChildren(f.getId(), all);
                tramaFieldRepository.deleteById(f.getId());
            }
        }
    }

    private void seedDefaultTramas(Long processId) {
        // Crear tramas por defecto para INPUT y OUTPUT
        for (String type : new String[]{"INPUT", "OUTPUT"}) {
            // Nodo Raíz
            TramaField root = TramaField.builder()
                .processId(processId)
                .tramaType(type)
                .name("_Root")
                .parentId(null)
                .defaultAssignment("ASIGNAR SIEMPRE")
                .build();
            root = tramaFieldRepository.save(root);

            // Subnodo Auditoría
            TramaField audit = TramaField.builder()
                .processId(processId)
                .tramaType(type)
                .name("Auditoria")
                .parentId(root.getId())
                .defaultAssignment("ASIGNAR SIEMPRE")
                .build();
            audit = tramaFieldRepository.save(audit);

            // Hijos de Auditoría
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType(type).name("Usuario").parentId(audit.getId())
                .defaultAssignment("ASIGNAR SIEMPRE").defaultValue("SYSTEM")
                .encodeSpecialChars(true).includeCdata(false).transformBase64(false).omitIfNull(false)
                .build());
            
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType(type).name("Fecha").parentId(audit.getId())
                .defaultAssignment("ASIGNAR SIEMPRE").defaultValue("2026-05-20")
                .encodeSpecialChars(true).includeCdata(false).transformBase64(false).omitIfNull(false)
                .build());

            // Nodo de negocio según tipo
            if ("INPUT".equals(type)) {
                TramaField datosId = TramaField.builder()
                    .processId(processId)
                    .tramaType(type)
                    .name("datosIdentificacion")
                    .parentId(root.getId())
                    .defaultAssignment("ASIGNAR SIEMPRE")
                    .build();
                datosId = tramaFieldRepository.save(datosId);

                tramaFieldRepository.save(TramaField.builder()
                    .processId(processId).tramaType(type).name("accionIdentificacion").parentId(datosId.getId())
                    .defaultAssignment("ASIGNAR SIEMPRE").defaultValue("M")
                    .encodeSpecialChars(true).includeCdata(false).transformBase64(false).omitIfNull(false)
                    .build());
                
                tramaFieldRepository.save(TramaField.builder()
                    .processId(processId).tramaType(type).name("tipoIdentificacion").parentId(datosId.getId())
                    .defaultAssignment("ASIGNAR SIEMPRE").defaultValue("C")
                    .encodeSpecialChars(true).includeCdata(false).transformBase64(false).omitIfNull(false)
                    .build());
            } else {
                TramaField responseNode = TramaField.builder()
                    .processId(processId)
                    .tramaType(type)
                    .name("respuestaProceso")
                    .parentId(root.getId())
                    .defaultAssignment("ASIGNAR SIEMPRE")
                    .build();
                responseNode = tramaFieldRepository.save(responseNode);

                tramaFieldRepository.save(TramaField.builder()
                    .processId(processId).tramaType(type).name("codigoRetorno").parentId(responseNode.getId())
                    .defaultAssignment("ASIGNAR SIEMPRE").defaultValue("000")
                    .encodeSpecialChars(true).includeCdata(false).transformBase64(false).omitIfNull(false)
                    .build());
                
                tramaFieldRepository.save(TramaField.builder()
                    .processId(processId).tramaType(type).name("mensajeRetorno").parentId(responseNode.getId())
                    .defaultAssignment("ASIGNAR SIEMPRE").defaultValue("TRANSACCION EXITOSA")
                    .encodeSpecialChars(true).includeCdata(false).transformBase64(false).omitIfNull(false)
                    .build());
            }
        }
    }
}
