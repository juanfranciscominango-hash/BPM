package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.ProcessDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.ProcessDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.Deployment;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProcessSeeder implements CommandLineRunner {

    private final ProcessDefinitionRepository processDefinitionRepository;
    private final RepositoryService repositoryService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Verificando si existen procesos BPMN requeridos que deban registrarse...");

        // Eliminar registro duplicado antiguo con key 'mensajeria_automatica_de_campanas' si existe
        processDefinitionRepository.findByKey("mensajeria_automatica_de_campanas").ifPresent(dup -> {
            log.info("Eliminando registro duplicado antiguo con key 'mensajeria_automatica_de_campanas' (ID: {})", dup.getId());
            processDefinitionRepository.delete(dup);
        });

        seedProcessIfNotExists(
                "mensajeria_automatica",
                "Mensajería Automática de Campañas",
                "MENSAJERIA",
                "/processes/mensajeria_automatica.bpmn20.xml"
        );

        seedProcessIfNotExists(
                "flujo_gestion_turnos",
                "Flujo de Gestión de Turnos Digital",
                "TURNERO",
                "/processes/flujo_gestion_turnos.bpmn20.xml"
        );
    }

    private void seedProcessIfNotExists(String key, String defaultName, String category, String resourcePath) {
        Optional<ProcessDefinition> existingOpt = processDefinitionRepository.findByKey(key);

        if (existingOpt.isEmpty()) {
            log.info("Proceso con clave '{}' no encontrado en la base de datos. Creando y desplegando...", key);
            try (InputStream is = getClass().getResourceAsStream(resourcePath)) {
                if (is == null) {
                    log.error("No se encontró el recurso BPMN en la ruta: {}", resourcePath);
                    return;
                }

                String xmlContent = StreamUtils.copyToString(is, StandardCharsets.UTF_8);

                // Desplegar en Flowable
                Deployment deployment = repositoryService.createDeployment()
                        .name(defaultName)
                        .key(key)
                        .addString(key + ".bpmn20.xml", xmlContent)
                        .deploy();

                org.flowable.engine.repository.ProcessDefinition flowableProcDef = repositoryService.createProcessDefinitionQuery()
                        .deploymentId(deployment.getId())
                        .singleResult();

                String procDefId = flowableProcDef != null ? flowableProcDef.getId() : null;
                int version = flowableProcDef != null ? flowableProcDef.getVersion() : 1;

                ProcessDefinition procDef = ProcessDefinition.builder()
                        .key(key)
                        .name(defaultName)
                        .category(category)
                        .version(version)
                        .bpmnXml(xmlContent)
                        .deploymentId(deployment.getId())
                        .procDefId(procDefId)
                        .status("DEPLOYED")
                        .lastUpdated(LocalDateTime.now())
                        .build();

                processDefinitionRepository.save(procDef);
                log.info("Proceso '{}' ({}) registrado y desplegado correctamente en Flowable con procDefId: {}", defaultName, key, procDefId);
            } catch (Exception e) {
                log.error("Error al registrar el proceso '{}': {}", key, e.getMessage(), e);
            }
        } else {
            log.info("Proceso con clave '{}' ya se encuentra registrado en la base de datos.", key);
        }
    }
}
