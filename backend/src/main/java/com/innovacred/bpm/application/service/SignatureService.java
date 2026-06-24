package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.StoredDocument;
import com.innovacred.bpm.domain.entity.Notification;
import com.innovacred.bpm.domain.entity.UserAccount;
import com.innovacred.bpm.infrastructure.adapter.persistence.NotificationRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.StoredDocumentRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class SignatureService {

    private final StoredDocumentRepository documentRepository;
    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userRepository;

    @Transactional
    public StoredDocument signDocument(Long documentId, String username, String pin) {
        StoredDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        UserAccount user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (doc.isSigned()) {
            throw new RuntimeException("El documento ya está firmado");
        }

        // 1. Generar Hash de Integridad (Enriquecido con datos de certificado PKI si existen)
        String certInfo = (user.getCertificateSerialNumber() != null) ? user.getCertificateSerialNumber() : "ELECTRONIC_ONLY";
        String rawData = doc.getFileName() + "|" + doc.getStoragePath() + "|" + username + "|" + pin + "|" + certInfo;
        String hash = generateHash(rawData);

        // 2. Actualizar documento
        doc.setSigned(true);
        doc.setSignatureHash(hash);
        doc.setSignedBy(username);
        doc.setSignedAt(LocalDateTime.now());

        StoredDocument saved = documentRepository.save(doc);

        // 3. Notificar éxito
        notificationRepository.save(Notification.builder()
                .title("Documento Firmado")
                .message("Has firmado exitosamente: " + doc.getFileName() + (user.getCertificateSerialNumber() != null ? " (Firma Digital PKI)" : " (Firma Electrónica)"))
                .type("success")
                .targetUser(username)
                .build());

        return saved;
    }

    private String generateHash(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al generar hash de firma", e);
        }
    }
}
