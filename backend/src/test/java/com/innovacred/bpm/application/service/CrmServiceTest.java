package com.innovacred.bpm.application.service;

import com.innovacred.bpm.application.service.calendar.CalendarFactory;
import com.innovacred.bpm.application.service.email.MarketingAutomationService;
import com.innovacred.bpm.domain.entity.Lead;
import com.innovacred.bpm.infrastructure.adapter.out.persistence.repository.*;
import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CrmServiceTest {

    @Mock
    private LeadRepository leadRepository;

    @Mock
    private LeadInteractionRepository interactionRepository;

    @Mock
    private LeadTaskRepository taskRepository;

    @Mock
    private AsesorRepository asesorRepository;

    @Mock
    private OrigenLeadRepository origenRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private CampanaRepository campanaRepository;

    @Mock
    private PerfilFinancieroRepository perfilFinancieroRepository;

    @Mock
    private CalendarFactory calendarFactory;

    @Mock
    private MarketingAutomationService marketingAutomationService;

    @Mock
    private ExternalProcessService externalProcessService;

    @InjectMocks
    private CrmService crmService;

    @Test
    void testDeleteLead_Inexistente() {
        // Given
        when(leadRepository.existsById(anyLong())).thenReturn(false);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            crmService.deleteLead(999L);
        }, "Debería lanzar excepción si el lead no existe");

        verify(leadRepository, never()).deleteById(anyLong());
    }
}
