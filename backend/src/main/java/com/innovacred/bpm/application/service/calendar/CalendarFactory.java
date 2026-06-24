package com.innovacred.bpm.application.service.calendar;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CalendarFactory {

    private final Map<String, CalendarIntegrationService> servicesCache = new HashMap<>();

    @Autowired
    public CalendarFactory(List<CalendarIntegrationService> services) {
        for (CalendarIntegrationService service : services) {
            servicesCache.put(service.getProviderName().toUpperCase(), service);
        }
    }

    public CalendarIntegrationService getService(String provider) {
        if (provider == null || provider.isEmpty()) {
            return null; // Si no hay proveedor, no integramos
        }
        CalendarIntegrationService service = servicesCache.get(provider.toUpperCase());
        if (service == null) {
            throw new IllegalArgumentException("Proveedor de calendario no soportado: " + provider);
        }
        return service;
    }
}
