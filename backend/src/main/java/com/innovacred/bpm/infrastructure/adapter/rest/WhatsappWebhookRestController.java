package com.innovacred.bpm.infrastructure.adapter.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovacred.bpm.application.service.ExternalApiService;
import com.innovacred.bpm.infrastructure.adapter.persistence.CampanaMensajeriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * REST Controller público para recibir Webhooks de Meta WhatsApp Cloud API.
 * Escucha las interacciones del cliente (clics en botones "Solicitar Crédito" o "Ver Detalles")
 * y le responde automáticamente por WhatsApp.
 */
@RestController
@RequestMapping("/public/whatsapp")
@RequiredArgsConstructor
@Slf4j
public class WhatsappWebhookRestController {

    private final CampanaMensajeriaRepository campanaMensajeriaRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String META_URL = "https://graph.facebook.com/v25.0/1281856211670041/messages";
    private static final String META_TOKEN = "EAATQfZAvKZAQcBSGY94OhPt5a6P45WUs0yccQmxivB6z7d60x0upYQ6zcA0ENnb9gVbFmnRBjYyTWdWJYi5BUTrm8Wdvh5OCcoZAKeQ2Q67LfWcweskyxFMbmZCbOyuJk6iuUqliACEay1ZBNwbU8wb3T4CwQSj0dUYAXRIp6pMsatl9pb8NKZCjhD0Kb33gWNgNPM3VonwMNcSFVAg9ciL85Sdqx7ePl02w15rWzqGmCpUaWSAls01DkO3kdGxMmPJnHAIHr93mPwc0YfEX3XIwZDZD";

    /**
     * Endpoint GET de verificación exigido por el panel de desarrolladores de Meta
     */
    @GetMapping("/webhook")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(value = "hub.mode", required = false) String mode,
            @RequestParam(value = "hub.verify_token", required = false) String token,
            @RequestParam(value = "hub.challenge", required = false) String challenge) {
        log.info("[WHATSAPP WEBHOOK] Solicitud de verificación recibida. Mode: {}, VerifyToken: {}", mode, token);
        return ResponseEntity.ok(challenge != null ? challenge : "OK");
    }

    /**
     * Endpoint POST receptor de eventos de respuesta de los clientes
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(@RequestBody String rawPayload) {
        log.info("[WHATSAPP WEBHOOK] Evento entrante recibido desde Meta Graph API");
        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            JsonNode entryArray = root.path("entry");
            if (entryArray.isArray() && !entryArray.isEmpty()) {
                for (JsonNode entry : entryArray) {
                    JsonNode changes = entry.path("changes");
                    if (changes.isArray()) {
                        for (JsonNode change : changes) {
                            JsonNode value = change.path("value");
                            JsonNode messages = value.path("messages");
                            if (messages.isArray() && !messages.isEmpty()) {
                                for (JsonNode msg : messages) {
                                    procesarMensajeEntrante(msg);
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("[WHATSAPP WEBHOOK] Error procesando payload de Webhook: {}", e.getMessage());
        }
        return ResponseEntity.ok("EVENT_RECEIVED");
    }

    private void procesarMensajeEntrante(JsonNode msg) {
        String fromNumber = msg.path("from").asText();
        String msgType = msg.path("type").asText();
        String buttonTitle = "";
        String buttonId = "";
        String textBody = "";

        if ("interactive".equalsIgnoreCase(msgType)) {
            JsonNode interactiveNode = msg.path("interactive");
            JsonNode buttonReply = interactiveNode.path("button_reply");
            buttonId = buttonReply.path("id").asText();
            buttonTitle = buttonReply.path("title").asText();
        } else if ("text".equalsIgnoreCase(msgType)) {
            textBody = msg.path("text").path("body").asText();
        }

        log.info("[WHATSAPP WEBHOOK] Mensaje detectado de {}: Type={}, ButtonId={}, ButtonTitle={}, Text={}",
                fromNumber, msgType, buttonId, buttonTitle, textBody);

        String accionNormalizada = (buttonTitle + " " + buttonId + " " + textBody).toLowerCase();

        // 1. Si el cliente presionó "Solicitar Crédito"
        if (accionNormalizada.contains("solicitar") || accionNormalizada.contains("btn_1") || accionNormalizada.contains("1")) {
            log.info("[WHATSAPP WEBHOOK] Cliente {} seleccionó: SOLICITAR CRÉDITO", fromNumber);
            String autoReply = "¡Hola Andrés! 🎯 Hemos recibido tu solicitud para el crédito pre-aprobado por $15,000.00.\n\n" +
                    "Un asesor comercial de la Cooperativa Maquita Cusunchi se comunicará contigo a la brevedad para coordinar la firma de tus documentos y el desembolso en tu cuenta.\n\n" +
                    "📞 Atención al cliente: 1800-MAQUITA";
            enviarRespuestaWhatsApp(fromNumber, autoReply);
            actualizarMetricasRespuesta();
        }
        // 2. Si el cliente presionó "Ver Detalles"
        else if (accionNormalizada.contains("detalle") || accionNormalizada.contains("info") || accionNormalizada.contains("btn_2") || accionNormalizada.contains("2")) {
            log.info("[WHATSAPP WEBHOOK] Cliente {} seleccionó: VER DETALLES", fromNumber);
            String autoReply = "ℹ️ *Detalles de tu Crédito Pre-aprobado (InnovaCred):*\n\n" +
                    "• *Monto Aprobado:* $15,000.00\n" +
                    "• *Plazo Máximo:* Hasta 60 meses\n" +
                    "• *Tasa de Interés:* 12.5% anual preferencial\n" +
                    "• *Garantía:* Sin garante requerido\n\n" +
                    "Si deseas solicitar tu desembolso en este momento, responde con la palabra *SOLICITAR* o presiona el botón ✅ *Solicitar Crédito*.";
            enviarRespuestaWhatsApp(fromNumber, autoReply);
            actualizarMetricasRespuesta();
        } else {
            log.info("[WHATSAPP WEBHOOK] Mensaje general recibido de {}: {}", fromNumber, textBody);
        }
    }

    private final ExternalApiService externalApiService;

    private void enviarRespuestaWhatsApp(String toPhone, String textMsg) {
        try {
            log.info("[WHATSAPP WEBHOOK] Despachando respuesta automática a {} vía ExternalApiService...", toPhone);
            externalApiService.executeApi("APIWHATSAPP", Map.of("to", toPhone, "mensaje", textMsg));
            log.info("[WHATSAPP WEBHOOK] Respuesta automática despachada exitosamente a {}.", toPhone);
        } catch (Exception ex) {
            log.error("[WHATSAPP WEBHOOK] Error enviando respuesta automática por WhatsApp: {}", ex.getMessage());
        }
    }

    private void actualizarMetricasRespuesta() {
        try {
            campanaMensajeriaRepository.findAll().stream()
                    .filter(c -> "WHATSAPP".equalsIgnoreCase(c.getCanal()) || "MULTICANAL".equalsIgnoreCase(c.getCanal()))
                    .reduce((first, second) -> second) // Última campaña
                    .ifPresent(campana -> {
                        int abiertosActuales = campana.getAbiertos() != null ? campana.getAbiertos() : 0;
                        campana.setAbiertos(abiertosActuales + 1);
                        campanaMensajeriaRepository.save(campana);
                        log.info("[WHATSAPP WEBHOOK] Métrica 'abiertos' incrementada para la campaña ID: {}", campana.getId());
                    });
        } catch (Exception ex) {
            log.warn("[WHATSAPP WEBHOOK] No se pudo incrementar métrica de campaña: {}", ex.getMessage());
        }
    }
}
