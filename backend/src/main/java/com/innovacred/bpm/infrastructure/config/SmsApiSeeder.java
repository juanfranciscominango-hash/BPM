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
public class SmsApiSeeder implements CommandLineRunner {

    private final ApiDefinitionRepository apiDefinitionRepository;
    private final ExternalProcessRepository externalProcessRepository;
    private final TramaFieldRepository tramaFieldRepository;

    @Override
    public void run(String... args) throws Exception {
        String smsMockUrl = "http://localhost:9091/api/v1/Mock/Sms/Send";

        apiDefinitionRepository.findByName("APISMS").ifPresentOrElse(api -> {
            api.setUrl(smsMockUrl);
            api.setMethod("POST");
            api.setBodyTemplate("{\"mensaje\":\"${mensaje}\"}");
            apiDefinitionRepository.save(api);
        }, () -> {
            ApiDefinition api = ApiDefinition.builder()
                    .name("APISMS")
                    .url(smsMockUrl)
                    .method("POST")
                    .bodyTemplate("{\"mensaje\":\"${mensaje}\"}")
                    .build();
            apiDefinitionRepository.save(api);
        });

        Optional<ExternalProcess> existingProcess = externalProcessRepository.findByCode("APISMS");
        ExternalProcess smsProcess;
        if (existingProcess.isPresent()) {
            smsProcess = existingProcess.get();
        } else {
            smsProcess = ExternalProcess.builder()
                    .code("APISMS")
                    .description("ENVIO_SMS")
                    .referenceType("CI")
                    .processType("WEB API REST")
                    .tramaTypes("INPUT, OUTPUT")
                    .systemName("NOTIFICACIONES")
                    .build();
            smsProcess = externalProcessRepository.save(smsProcess);

            seedSmsTramas(smsProcess.getId());
        }
    }

    private void seedSmsTramas(Long processId) {
        tramaFieldRepository.deleteByProcessId(processId);

        // INPUT
        TramaField rootIn = TramaField.builder()
            .processId(processId).tramaType("INPUT").name("_Root")
            .defaultAssignment("ASIGNAR SIEMPRE").build();
        rootIn = tramaFieldRepository.save(rootIn);

        tramaFieldRepository.save(TramaField.builder()
            .processId(processId).tramaType("INPUT").name("mensaje")
            .parentId(rootIn.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());

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
