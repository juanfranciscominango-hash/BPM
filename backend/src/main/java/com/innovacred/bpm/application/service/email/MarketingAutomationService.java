package com.innovacred.bpm.application.service.email;

import com.innovacred.bpm.domain.entity.Lead;
import com.innovacred.bpm.domain.entity.LeadInteraction;
import com.innovacred.bpm.infrastructure.adapter.out.persistence.repository.LeadInteractionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class MarketingAutomationService {

    private final EmailFactory emailFactory;
    private final LeadInteractionRepository interactionRepository;

    @Value("${crm.email.provider:GMAIL}") // Por defecto GMAIL si no se configura
    private String emailProvider;

    public void triggerStatusChangeEmail(Lead lead, String newStatus) {
        log.info("Iniciando rutina de Marketing Automation para Lead ID: {} hacia el estado {}", lead.getId(), newStatus);

        EmailSenderService sender = emailFactory.getService(emailProvider);
        if (sender == null) {
            log.warn("No se encontró configuración válida para crm.email.provider = {}. No se enviará correo.", emailProvider);
            return;
        }

        try {
            // 1. Disparar el envío real/simulado
            sender.sendStatusChangeEmail(lead, newStatus);

            // 2. Registrar en la Línea de Tiempo del Lead (Vista 360)
            LeadInteraction interaction = new LeadInteraction();
            interaction.setLead(lead);
            interaction.setTipo("EMAIL_AUTOMATICO");
            interaction.setResumen("Enviado correo automático vía " + sender.getProviderName() + " por avance a estado " + newStatus);
            interaction.setFecha(LocalDateTime.now());
            interactionRepository.save(interaction);

            log.info("Interacción automática registrada en la base de datos.");

        } catch (Exception e) {
            log.error("Fallo al enviar el correo automático o guardar interacción", e);
        }
    }
}
