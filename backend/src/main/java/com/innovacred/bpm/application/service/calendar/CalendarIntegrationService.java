package com.innovacred.bpm.application.service.calendar;

import com.innovacred.bpm.domain.entity.LeadTask;

public interface CalendarIntegrationService {
    String createEvent(LeadTask task);
    void updateEvent(LeadTask task);
    void deleteEvent(String eventId);
    String getProviderName();
}
