package com.innovacred.bpm.application.service.email;

import com.innovacred.bpm.domain.entity.Lead;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GmailSenderService implements EmailSenderService {

    @Override
    public String getProviderName() {
        return "GMAIL";
    }

    @Override
    public void sendStatusChangeEmail(Lead lead, String newStatus) {
        log.info("[GMAIL SMTP] Enviando correo a {} ({}) - Su solicitud ha avanzado al estado: {}", 
                 lead.getNombresCompletos(), lead.getEmail(), newStatus);
        // Aquí iría la lógica real usando JavaMailSender configurado con smtp.gmail.com
    }
}
