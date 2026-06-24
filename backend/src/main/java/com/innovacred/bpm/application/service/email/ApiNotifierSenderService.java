package com.innovacred.bpm.application.service.email;

import com.innovacred.bpm.domain.entity.Lead;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ApiNotifierSenderService implements EmailSenderService {

    @Override
    public String getProviderName() {
        return "API_NOTIFICADOR";
    }

    @Override
    public void sendStatusChangeEmail(Lead lead, String newStatus) {
        log.info("[API EXTERNA DE NOTIFICACIONES] Disparando webhook para correo a {} ({}) - Estado: {}", 
                 lead.getNombresCompletos(), lead.getEmail(), newStatus);
        // Aquí iría la llamada HTTP a SendGrid, Mailchimp, o un API local de notificaciones
    }
}
