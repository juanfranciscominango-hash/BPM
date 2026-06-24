package com.innovacred.bpm.application.service.calendar;

import com.innovacred.bpm.domain.entity.LeadTask;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service("outlookCalendarService")
public class OutlookCalendarService implements CalendarIntegrationService {

    @Override
    public String createEvent(LeadTask task) {
        log.info("Creando evento en Outlook Calendar para la tarea: {}", task.getDescripcion());
        // Aquí iría la integración real con Microsoft Graph API (OAuth2)
        // Retornamos un ID simulado
        return "outlook-evt-" + UUID.randomUUID().toString();
    }

    @Override
    public void updateEvent(LeadTask task) {
        log.info("Actualizando evento en Outlook Calendar: {}", task.getExternalCalendarEventId());
    }

    @Override
    public void deleteEvent(String eventId) {
        log.info("Eliminando evento de Outlook Calendar: {}", eventId);
    }

    @Override
    public String getProviderName() {
        return "OUTLOOK";
    }
}
