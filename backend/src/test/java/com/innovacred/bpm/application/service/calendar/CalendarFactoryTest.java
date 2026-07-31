package com.innovacred.bpm.application.service.calendar;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarFactoryTest {

    @Mock
    private CalendarIntegrationService googleService;

    @Mock
    private CalendarIntegrationService outlookService;

    @Test
    void testGetService_Success() {
        // Given
        when(googleService.getProviderName()).thenReturn("GOOGLE");
        when(outlookService.getProviderName()).thenReturn("OUTLOOK");

        CalendarFactory factory = new CalendarFactory(Arrays.asList(googleService, outlookService));

        // When
        CalendarIntegrationService resolved = factory.getService("google");

        // Then
        assertEquals(googleService, resolved);
    }

    @Test
    void testGetService_UnsupportedProvider() {
        // Given
        when(googleService.getProviderName()).thenReturn("GOOGLE");
        CalendarFactory factory = new CalendarFactory(Arrays.asList(googleService));

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            factory.getService("YAHOO");
        }, "Debería lanzar excepción si el proveedor no existe");
    }
}
