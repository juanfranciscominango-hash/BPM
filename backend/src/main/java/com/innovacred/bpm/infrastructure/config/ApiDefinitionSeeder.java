package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.ApiDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.ApiDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApiDefinitionSeeder implements CommandLineRunner {

    private final ApiDefinitionRepository apiDefinitionRepository;

    @Override
    public void run(String... args) throws Exception {
        String headers = """
                {
                    "__encrypt": "true",
                    "aplicacioncliente": "Nomina",
                    "aplicacionservidor": "Denarius",
                    "nombreservicio": "ServiciosClientes",
                    "nombreClase": "ConsultarClientePorIdentificacion",
                    "nombreMetodo": "meConsultasClientes"
                }
                """;
        
        String body = """
                {
                    "DocumentType": "${DocumentType}",
                    "DocumentNumber": "${interviniente_int_identificacion}"
                }
                """;

        String mockUrl = "http://localhost:9091/api/v1/Nomina/Clients/GetClients";

        apiDefinitionRepository.findByName("APICLI").ifPresentOrElse(api -> {
            api.setUrl(mockUrl);
            api.setHeadersJson(headers);
            api.setBodyTemplate(body);
            apiDefinitionRepository.save(api);
            System.out.println("✅ Conector APICLI (Consulta_Cliente) actualizado con URL mock: " + mockUrl);
        }, () -> {
            ApiDefinition api = ApiDefinition.builder()
                    .name("APICLI")
                    .url(mockUrl)
                    .method("POST")
                    .headersJson(headers)
                    .bodyTemplate(body)
                    .build();
            apiDefinitionRepository.save(api);
            System.out.println("✅ Conector APICLI (Consulta_Cliente) sembrado con URL mock.");
        });

        // Sembrar API de SharePoint
        String sharepointMockUrl = "http://localhost:9091/api/v1/Mock/SharePoint/Upload";
        String sharepointBody = """
                {
                    "fileName": "${fileName}",
                    "fileContentBase64": "${fileContentBase64}",
                    "taskId": "${taskId}"
                }
                """;
        
        apiDefinitionRepository.findByName("API_SHAREPOINT_UPLOAD").ifPresentOrElse(api -> {
            api.setUrl(sharepointMockUrl);
            api.setHeadersJson("{}");
            api.setBodyTemplate(sharepointBody);
            apiDefinitionRepository.save(api);
            System.out.println("✅ Conector API_SHAREPOINT_UPLOAD actualizado con URL mock.");
        }, () -> {
            ApiDefinition api = ApiDefinition.builder()
                    .name("API_SHAREPOINT_UPLOAD")
                    .url(sharepointMockUrl)
                    .method("POST")
                    .headersJson("{}")
                    .bodyTemplate(sharepointBody)
                    .build();
            apiDefinitionRepository.save(api);
            System.out.println("✅ Conector API_SHAREPOINT_UPLOAD sembrado con URL mock.");
        });

        // Sembrar API de Alfresco
        String alfrescoMockUrl = "http://localhost:9091/api/v1/Mock/Alfresco/Upload";
        String alfrescoBody = """
                {
                    "fileName": "${fileName}",
                    "fileContentBase64": "${fileContentBase64}",
                    "taskId": "${taskId}",
                    "repository": "alfresco"
                }
                """;
        
        apiDefinitionRepository.findByName("API_ALFRESCO_UPLOAD").ifPresentOrElse(api -> {
            api.setUrl(alfrescoMockUrl);
            api.setHeadersJson("{}");
            api.setBodyTemplate(alfrescoBody);
            apiDefinitionRepository.save(api);
            System.out.println("✅ Conector API_ALFRESCO_UPLOAD actualizado con URL mock.");
        }, () -> {
            ApiDefinition api = ApiDefinition.builder()
                    .name("API_ALFRESCO_UPLOAD")
                    .url(alfrescoMockUrl)
                    .method("POST")
                    .headersJson("{}")
                    .bodyTemplate(alfrescoBody)
                    .build();
            apiDefinitionRepository.save(api);
            System.out.println("✅ Conector API_ALFRESCO_UPLOAD sembrado con URL mock.");
        });
    }
}
