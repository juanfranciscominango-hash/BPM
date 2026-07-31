package com.innovacred.bpm.infrastructure.adapter.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovacred.bpm.application.service.CryptoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MockClientController {

    private final CryptoService cryptoService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 20 clientes simulados cargados desde JSON
    private Map<String, Map<String, Object>> mockClients = new HashMap<>();
    private Map<String, java.util.List<Map<String, Object>>> mockCuentas = new HashMap<>();

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            java.io.InputStream is = getClass().getResourceAsStream("/mocks/clients.json");
            if (is != null) {
                java.util.List<Map<String, Object>> clientsList = objectMapper.readValue(is, new TypeReference<java.util.List<Map<String, Object>>>() {});
                for (Map<String, Object> client : clientsList) {
                    mockClients.put(String.valueOf(client.get("DocumentNumber")), client);
                }
                log.info("Se cargaron {} clientes simulados desde clients.json", mockClients.size());
            } else {
                log.warn("No se encontró el archivo /mocks/clients.json");
            }
            
            java.io.InputStream isCuentas = getClass().getResourceAsStream("/mocks/cuentas.json");
            if (isCuentas != null) {
                java.util.List<Map<String, Object>> cuentasFile = objectMapper.readValue(isCuentas, new TypeReference<java.util.List<Map<String, Object>>>() {});
                for (Map<String, Object> data : cuentasFile) {
                    mockCuentas.put(String.valueOf(data.get("cedula")), (java.util.List<Map<String, Object>>) data.get("cuentas"));
                }
                log.info("Se cargaron {} mocks de cuentas desde cuentas.json", mockCuentas.size());
            } else {
                log.warn("No se encontró el archivo /mocks/cuentas.json");
            }
        } catch (Exception e) {
            log.error("Error cargando mocks de clientes", e);
        }
    }

    @PostMapping("/Nomina/Clients/GetClients")
    public ResponseEntity<?> getClientsMock(@RequestBody Map<String, String> request) {
        log.info("Recibida peticion MOCK en /Nomina/Clients/GetClients");
        try {
            // Asumimos que la petición viene encriptada si tiene "Data" y "SessionKey"
            String decryptedJson;
            if (request.containsKey("Data") && request.containsKey("SessionKey")) {
                decryptedJson = cryptoService.decryptMockRequest(request);
                log.info("Peticion MOCK desencriptada: {}", decryptedJson);
            } else {
                decryptedJson = objectMapper.writeValueAsString(request); // texto plano
            }

            Map<String, Object> payload = objectMapper.readValue(decryptedJson, new TypeReference<Map<String, Object>>() {});
            String docNumber = String.valueOf(payload.get("DocumentNumber"));

            Map<String, Object> responseData = new HashMap<>(mockClients.getOrDefault(docNumber, new HashMap<>()));
            if (responseData.isEmpty()) {
                log.warn("Cliente {} no encontrado en mocks, enviando genérico", docNumber);
                responseData.put("DocumentNumber", docNumber);
                responseData.put("interviniente_int_identificacion", docNumber);
                responseData.put("interviniente_int_nombres_completos", "Cliente Desconocido " + docNumber);
                responseData.put("mensaje", "Cliente no encontrado en mocks, datos genéricos devueltos");
            } else {
                responseData.putIfAbsent("interviniente_int_identificacion", responseData.getOrDefault("DocumentNumber", docNumber));
            }

            String responseJson = objectMapper.writeValueAsString(responseData);

            if (request.containsKey("Data")) {
                // Devolver encriptado
                Map<String, String> encryptedResponse = cryptoService.encryptMockResponse(responseJson);
                log.info("Respuesta MOCK encriptada exitosamente");
                return ResponseEntity.ok(encryptedResponse);
            } else {
                return ResponseEntity.ok(responseData);
            }
        } catch (Exception e) {
            log.error("Error procesando peticion MOCK", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/Mock/SharePoint/Upload")
    public ResponseEntity<?> uploadSharePointMock(@RequestBody Map<String, Object> request) {
        log.info("Recibida peticion MOCK en /Mock/SharePoint/Upload");
        try {
            // Extraer nombre de archivo o crear uno genérico
            String fileName = request.containsKey("fileName") ? request.get("fileName").toString() : "documento.pdf";
            String docId = "SP-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Simular respuesta de Graph API
            Map<String, String> response = new HashMap<>();
            response.put("webUrl", "https://cooperativa.sharepoint.com/sites/Creditos/Documentos/" + docId + "/" + fileName);
            response.put("id", docId);
            response.put("status", "success");
            response.put("message", "Documento cargado exitosamente en SharePoint simulado");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error procesando upload SharePoint MOCK", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/Mock/Alfresco/Upload")
    public ResponseEntity<?> uploadAlfrescoMock(@RequestBody Map<String, Object> request) {
        log.info("Recibida peticion MOCK en /Mock/Alfresco/Upload");
        try {
            // Extraer nombre de archivo
            String fileName = request.containsKey("fileName") ? request.get("fileName").toString() : "documento.pdf";
            String uuid = java.util.UUID.randomUUID().toString();
            
            // Simular respuesta de Alfresco REST API (CMIS o v1 REST)
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", uuid);
            entry.put("name", fileName);
            entry.put("nodeType", "cm:content");
            
            Map<String, Object> response = new HashMap<>();
            response.put("entry", entry);
            // URL amigable para mostrar al jefe
            response.put("webUrl", "http://alfresco.cooperativa.local/share/page/document-details?nodeRef=workspace://SpacesStore/" + uuid);
            response.put("status", "success");
            response.put("message", "Documento cargado en Alfresco ECM (Simulado)");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error procesando upload Alfresco MOCK", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/Nomina/Clients/Reload")
    public ResponseEntity<?> reloadMocks() {
        init();
        return ResponseEntity.ok(Map.of("mensaje", "Mocks recargados correctamente"));
    }

    @org.springframework.web.bind.annotation.GetMapping("/Mock/Buro/PerfilFinanciero/{cedula}")
    public Map<String, Object> getPerfilFinanciero(@org.springframework.web.bind.annotation.PathVariable String cedula) {
        log.info("Simulando consulta al buró para cédula: {}", cedula);
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> clientInfo = mockClients.get(cedula);
        if (clientInfo != null && clientInfo.containsKey("ingresosMensuales")) {
            response.put("ingresosMensuales", clientInfo.get("ingresosMensuales"));
            response.put("valorMaximoPrestamo", clientInfo.get("valorMaximoPrestamo"));
            response.put("valorMaximoEndeudamiento", clientInfo.get("valorMaximoEndeudamiento"));
            response.put("deudasOtrasEntidades", clientInfo.get("deudasOtrasEntidades"));
            response.put("tarjetasCredito", clientInfo.get("tarjetasCredito"));
        } else {
            // Fallback random
            response.put("ingresosMensuales", 1200 + Math.random() * 2000);
            response.put("valorMaximoPrestamo", 15000 + Math.random() * 10000);
            response.put("valorMaximoEndeudamiento", 500 + Math.random() * 800);
            response.put("deudasOtrasEntidades", List.of(
                Map.of("entidad", "Banco Pichincha", "saldo", 1500.50, "producto", "Préstamo Consumo"),
                Map.of("entidad", "Banco Pacífico", "saldo", 800.00, "producto", "Tarjeta Crédito")
            ));
            response.put("tarjetasCredito", List.of(
                Map.of("entidad", "Diners Club", "saldoActual", 450.00, "cupoTotal", 2000.00)
            ));
        }
        
        return response;
    }


    @org.springframework.web.bind.annotation.GetMapping("/Mock/Cuentas/{cedula}")
    public Map<String, Object> getCuentas(@org.springframework.web.bind.annotation.PathVariable String cedula) {
        log.info("Simulando consulta de cuentas para cédula: {}", cedula);
        
        java.util.List<Map<String, Object>> cuentasList = mockCuentas.get(cedula);
        if (cuentasList == null) {
            // Fallback random
            cuentasList = java.util.List.of(
                Map.of("numero_cuenta", "1111111111", "tipo_cuenta", "Ahorros", "estado_cuenta", "Activa")
            );
        }
        
        return Map.of("cuentas", cuentasList);
    }

    @org.springframework.web.bind.annotation.PostMapping("/Mock/Email/Send")
    public Map<String, Object> mockEmailSend(@org.springframework.web.bind.annotation.RequestBody Map<String, Object> payload) {
        System.out.println("MOCK EMAIL SENT TO: " + payload.get("to"));
        System.out.println("SUBJECT: " + payload.get("subject"));
        System.out.println("BODY: " + payload.get("body"));
        return Map.of("status", "SUCCESS");
    }

    @org.springframework.web.bind.annotation.GetMapping("/Mock/Campanas/Activas")
    public List<Map<String, Object>> getCampanasActivas() {
        return List.of(
            Map.of(
                "nombre", "Campaña Verano 2024",
                "estado", "activa",
                "fechaInicio", "2024-06-01",
                "fechaFin", "2024-08-31",
                "presupuestoAsignado", 10000.0,
                "presupuestoEjecutado", 4500.0,
                "leadsGenerados", 120,
                "conversiones", 15,
                "roi", "150%"
            ),
            Map.of(
                "nombre", "Feria de Crédito Automotriz",
                "estado", "activa",
                "fechaInicio", "2024-07-15",
                "fechaFin", "2024-07-30",
                "presupuestoAsignado", 5000.0,
                "presupuestoEjecutado", 2000.0,
                "leadsGenerados", 85,
                "conversiones", 8,
                "roi", "110%"
            )
        );
    }
}
