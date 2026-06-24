package com.innovacred.bpm.application.service.calendar;

import com.innovacred.bpm.domain.entity.LeadTask;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service("googleCalendarService")
public class GoogleCalendarService implements CalendarIntegrationService {

    @Override
    public String createEvent(LeadTask task) {
        log.info("Creando evento en Google Calendar para la tarea: {}", task.getDescripcion());
        // Aquí iría la integración real con Google Calendar API (OAuth2)
        // Retornamos un ID simulado
        return "google-evt-" + UUID.randomUUID().toString();
    }

    @Override
    public void updateEvent(LeadTask task) {
        log.info("Actualizando evento en Google Calendar: {}", task.getExternalCalendarEventId());
    }

    @Override
    public void deleteEvent(String eventId) {
        log.info("Eliminando evento de Google Calendar: {}", eventId);
    }

    @Override
    public String getProviderName() {
        return "GOOGLE";
    }
}
