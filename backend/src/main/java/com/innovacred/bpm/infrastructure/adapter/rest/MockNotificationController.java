package com.innovacred.bpm.infrastructure.adapter.rest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Controller de simulación y mocks para el envío de notificaciones
 * multicanal (WhatsApp, SMS).
 */
@RestController
@RequestMapping("/Mock")
@Slf4j
public class MockNotificationController {

    @PostMapping("/Whatsapp/Send")
    public ResponseEntity<?> sendWhatsappMock(@RequestBody Map<String, Object> body) {
        log.info("[MOCK WHATSAPP API] Recibida solicitud de envío por Meta Cloud API / WhatsApp. Datos: {}", body);
        return ResponseEntity.ok(Map.of(
            "status", "DELIVERED",
            "provider", "META_CLOUD_API",
            "waId", "WA-" + UUID.randomUUID().toString().substring(0, 8),
            "timestamp", System.currentTimeMillis()
        ));
    }

    @PostMapping("/Sms/Send")
    public ResponseEntity<?> sendSmsMock(@RequestBody Map<String, Object> body) {
        log.info("[MOCK SMS API] Recibida solicitud de envío por pasarela SMS. Datos: {}", body);
        return ResponseEntity.ok(Map.of(
            "status", "SENT",
            "provider", "SMS_PASARELA",
            "smsId", "SMS-" + UUID.randomUUID().toString().substring(0, 8),
            "timestamp", System.currentTimeMillis()
        ));
    }
}
