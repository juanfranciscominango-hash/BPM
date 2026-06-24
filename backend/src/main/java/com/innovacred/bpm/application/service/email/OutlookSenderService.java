package com.innovacred.bpm.application.service.email;

import com.innovacred.bpm.domain.entity.Lead;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OutlookSenderService implements EmailSenderService {

    @Override
    public String getProviderName() {
        return "OUTLOOK";
    }

    @Override
    public void sendStatusChangeEmail(Lead lead, String newStatus) {
        log.info("[OUTLOOK GRAPH API] Enviando correo a {} ({}) - Su solicitud ha avanzado al estado: {}", 
                 lead.getNombresCompletos(), lead.getEmail(), newStatus);
        // Aquí iría la lógica real usando Microsoft Graph API o smtp-mail.outlook.com
    }
}
