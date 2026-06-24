package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.ApiDefinition;
import com.innovacred.bpm.domain.entity.ExternalProcess;
import com.innovacred.bpm.domain.entity.TramaField;
import com.innovacred.bpm.infrastructure.adapter.persistence.ApiDefinitionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.ExternalProcessRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TramaFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BuroApiSeeder implements CommandLineRunner {

    private final ApiDefinitionRepository apiDefinitionRepository;
    private final ExternalProcessRepository externalProcessRepository;
    private final TramaFieldRepository tramaFieldRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Conector REST Simple
        String buroMockUrl = "http://localhost:9091/api/v1/Mock/Buro/PerfilFinanciero/${interviniente_int_identificacion}";
        
        apiDefinitionRepository.findByName("APIBURO").ifPresentOrElse(api -> {
            api.setUrl(buroMockUrl);
            api.setMethod("GET");
            api.setBodyTemplate("{}");
            apiDefinitionRepository.save(api);
        }, () -> {
            ApiDefinition api = ApiDefinition.builder()
                    .name("APIBURO")
                    .url(buroMockUrl)
                    .method("GET")
                    .bodyTemplate("{}")
                    .build();
            apiDefinitionRepository.save(api);
        });

        // 2. Seed Proceso Sistema Externo
        Optional<ExternalProcess> existingProcess = externalProcessRepository.findByCode("APIBURO");
        ExternalProcess buroProcess;
        if (existingProcess.isPresent()) {
            buroProcess = existingProcess.get();
        } else {
            buroProcess = ExternalProcess.builder()
                    .code("APIBURO")
                    .description("CONSULTA_BURO")
                    .referenceType("CI")
                    .processType("WEB API REST")
                    .tramaTypes("INPUT, OUTPUT")
                    .systemName("BURÓ DE CRÉDITO")
                    .build();
            buroProcess = externalProcessRepository.save(buroProcess);

            // 3. Seed Tramas (INPUT y OUTPUT) para APIBURO
            seedDefaultTramas(buroProcess.getId());
        }
    }

    private void seedDefaultTramas(Long processId) {
        // INPUT
        TramaField rootIn = TramaField.builder()
            .processId(processId).tramaType("INPUT").name("_Root")
            .defaultAssignment("ASIGNAR SIEMPRE").build();
        rootIn = tramaFieldRepository.save(rootIn);
        
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("INPUT").name("interviniente_int_identificacion")
            .parentId(rootIn.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());

        // OUTPUT
        TramaField rootOut = TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("_Root")
            .defaultAssignment("ASIGNAR SIEMPRE").build();
        rootOut = tramaFieldRepository.save(rootOut);
        
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("ingresosMensuales")
            .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
            
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("valorMaximoPrestamo")
            .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
            
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("valorMaximoEndeudamiento")
            .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
            
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("cuotaEstimadaMensual")
            .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
            
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("deudasOtrasEntidades")
            .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
            
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("tarjetasCredito")
            .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
    }
}
