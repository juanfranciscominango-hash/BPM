package com.innovacred.bpm.application.service.email;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class EmailFactory {

    private final Map<String, EmailSenderService> services;

    public EmailFactory(List<EmailSenderService> serviceList) {
        // Mapea el nombre del proveedor (ej. "GMAIL") a su implementación
        this.services = serviceList.stream()
                .collect(Collectors.toMap(EmailSenderService::getProviderName, Function.identity()));
    }

    public EmailSenderService getService(String provider) {
        if (provider == null || provider.trim().isEmpty()) {
            return null;
        }
        return services.get(provider.toUpperCase());
    }
}
