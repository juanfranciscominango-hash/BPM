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
public class EmailApiSeeder implements CommandLineRunner {

    private final ApiDefinitionRepository apiDefinitionRepository;
    private final ExternalProcessRepository externalProcessRepository;
    private final TramaFieldRepository tramaFieldRepository;

    @Override
    public void run(String... args) throws Exception {
        String emailMockUrl = "http://localhost:9091/api/v1/Mock/Email/Send";
        
        apiDefinitionRepository.findByName("APIEMAIL").ifPresentOrElse(api -> {
            api.setUrl(emailMockUrl);
            api.setMethod("POST");
            api.setBodyTemplate("{}"); // ExternalProcessService usa tramas, no este body
            apiDefinitionRepository.save(api);
        }, () -> {
            ApiDefinition api = ApiDefinition.builder()
                    .name("APIEMAIL")
                    .url(emailMockUrl)
                    .method("POST")
                    .bodyTemplate("{}")
                    .build();
            apiDefinitionRepository.save(api);
        });

        Optional<ExternalProcess> existingProcess = externalProcessRepository.findByCode("APIEMAIL");
        ExternalProcess emailProcess;
        if (existingProcess.isPresent()) {
            emailProcess = existingProcess.get();
        } else {
            emailProcess = ExternalProcess.builder()
                    .code("APIEMAIL")
                    .description("ENVIO_CORREO")
                    .referenceType("CI")
                    .processType("WEB API REST")
                    .tramaTypes("INPUT, OUTPUT")
                    .systemName("NOTIFICACIONES")
                    .build();
            emailProcess = externalProcessRepository.save(emailProcess);

            seedEmailTramas(emailProcess.getId());
        }
    }

    private void seedEmailTramas(Long processId) {
        // Limpiamos si hay
        tramaFieldRepository.deleteByProcessId(processId);

        // INPUT
        TramaField rootIn = TramaField.builder()
            .processId(processId).tramaType("INPUT").name("_Root")
            .defaultAssignment("ASIGNAR SIEMPRE").build();
        rootIn = tramaFieldRepository.save(rootIn);
        
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("INPUT").name("to")
            .parentId(rootIn.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
            
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("INPUT").name("subject")
            .parentId(rootIn.getId()).defaultAssignment("ASIGNAR SIEMPRE")
            .defaultValue("Bienvenido a InnovaCred").build());

        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("INPUT").name("body")
            .parentId(rootIn.getId()).defaultAssignment("ASIGNAR SIEMPRE")
            .defaultValue("Bienvenido a InnovaCred, te contactaremos pronto").build());

        // OUTPUT
        TramaField rootOut = TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("_Root")
            .defaultAssignment("ASIGNAR SIEMPRE").build();
        rootOut = tramaFieldRepository.save(rootOut);
        
        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("OUTPUT").name("status")
            .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
    }
}
