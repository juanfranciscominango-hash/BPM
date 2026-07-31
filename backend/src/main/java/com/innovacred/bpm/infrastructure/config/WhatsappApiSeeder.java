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
public class WhatsappApiSeeder implements CommandLineRunner {

    private final ApiDefinitionRepository apiDefinitionRepository;
    private final ExternalProcessRepository externalProcessRepository;
    private final TramaFieldRepository tramaFieldRepository;

    @Override
    public void run(String... args) throws Exception {
        String whatsappUrl = "https://graph.facebook.com/v25.0/1281856211670041/messages";
        String token = "EAATQfZAvKZAQcBSCctsSmgV8WbL4S1TRIxKlbbKqUocZAkfOHhZAMKwMT3b4w3xXyEIIp1ZCHqCsKbpEBN5nhfdY0RMtbZBaoTcM0NDGfo2jcs3pszRBVsmMo90cW7G3FmXZCzLByZCZCVQtspNawQRYeeqeRTjeDY7AfZCuoGi49lNyisIDeRgPJdOMO9Y261qz0FWruzWz5ZAWHIWRNqxF5MjQ8ewPKZA4D9XIytEILTcv8PYEGrMBXHZCthpVQhg6lESNUA3lU6nQVsHVSuvsFavSoXwZDZD";
        String headersJson = "{\"Authorization\":\"Bearer " + token + "\"}";
        String bodyTemplate = "{\"messaging_product\":\"whatsapp\",\"recipient_type\":\"individual\",\"to\":\"593998246098\",\"type\":\"text\",\"text\":{\"preview_url\":false,\"body\":\"${mensaje}\"}}";

        apiDefinitionRepository.findByName("APIWHATSAPP").ifPresentOrElse(api -> {
            api.setUrl(whatsappUrl);
            api.setMethod("POST");
            api.setHeadersJson(headersJson);
            api.setBodyTemplate(bodyTemplate);
            apiDefinitionRepository.save(api);
        }, () -> {
            ApiDefinition api = ApiDefinition.builder()
                    .name("APIWHATSAPP")
                    .url(whatsappUrl)
                    .method("POST")
                    .headersJson(headersJson)
                    .bodyTemplate(bodyTemplate)
                    .build();
            apiDefinitionRepository.save(api);
        });

        Optional<ExternalProcess> existingProcess = externalProcessRepository.findByCode("APIWHATSAPP");
        ExternalProcess waProcess;
        if (existingProcess.isPresent()) {
            waProcess = existingProcess.get();
        } else {
            waProcess = ExternalProcess.builder()
                    .code("APIWHATSAPP")
                    .description("ENVIO_WHATSAPP")
                    .referenceType("CI")
                    .processType("WEB API REST")
                    .tramaTypes("INPUT, OUTPUT")
                    .systemName("NOTIFICACIONES")
                    .build();
            waProcess = externalProcessRepository.save(waProcess);

            seedWhatsappTramas(waProcess.getId());
        }
    }

    private void seedWhatsappTramas(Long processId) {
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
