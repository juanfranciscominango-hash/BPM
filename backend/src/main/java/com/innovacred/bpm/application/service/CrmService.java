package com.innovacred.bpm.application.service;

import com.innovacred.bpm.application.service.calendar.CalendarFactory;
import com.innovacred.bpm.application.service.calendar.CalendarIntegrationService;
import com.innovacred.bpm.application.service.email.MarketingAutomationService;
import com.innovacred.bpm.domain.entity.*;
import com.innovacred.bpm.domain.dto.CountResult;
import com.innovacred.bpm.infrastructure.adapter.out.persistence.repository.*;
import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmService {

    private final LeadRepository leadRepository;
    private final LeadInteractionRepository interactionRepository;
    private final LeadTaskRepository taskRepository;
    private final AsesorRepository AsesorRepository;
    private final OrigenLeadRepository origenRepository;
    private final UserAccountRepository userAccountRepository;
    private final CampanaRepository campanaRepository;
    private final PerfilFinancieroRepository perfilFinancieroRepository;
    
    private final CalendarFactory calendarFactory;
    private final MarketingAutomationService marketingAutomationService;
    private final ExternalProcessService externalProcessService;

    @Value("${crm.calendar.provider:}")
    private String calendarProvider;

    public List<Lead> getAllLeads() {
        return leadRepository.findAllByOrderByCreatedAtDesc();
    }

    public Lead getLeadById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead no encontrado con id " + id));
    }

    @Transactional
    public Lead createLead(Lead lead) {
        if (lead.getAsesorAsignado() != null && lead.getAsesorAsignado().getId() != null) {
            lead.setAsesorAsignado(AsesorRepository.findById(lead.getAsesorAsignado().getId()).orElse(null));
        }
        if (lead.getOrigen() != null && lead.getOrigen().getId() != null) {
            lead.setOrigen(origenRepository.findById(lead.getOrigen().getId()).orElse(null));
        }
        return leadRepository.save(lead);
    }

    @Transactional
    public Lead updateLead(Long id, Lead updatedData) {
        Lead existing = getLeadById(id);
        existing.setNombresCompletos(updatedData.getNombresCompletos());
        existing.setIdentificacion(updatedData.getIdentificacion());
        existing.setEmpresa(updatedData.getEmpresa());
        existing.setTelefono(updatedData.getTelefono());
        existing.setEmail(updatedData.getEmail());

        // Validar si hubo cambio de estado a TIBIO o CALIENTE
        String oldStatus = existing.getEstado();
        String newStatus = updatedData.getEstado();
        boolean statusChangedToWarm = oldStatus != null && !oldStatus.equals(newStatus) && 
                                      ("TIBIO".equals(newStatus) || "CALIENTE".equals(newStatus));

        existing.setEstado(newStatus);
        existing.setMontoEstimado(updatedData.getMontoEstimado());
        if (updatedData.getAsesorAsignado() != null) {
            existing.setAsesorAsignado(AsesorRepository.findById(updatedData.getAsesorAsignado().getId()).orElse(null));
        }
        if (updatedData.getOrigen() != null) {
            existing.setOrigen(origenRepository.findById(updatedData.getOrigen().getId()).orElse(null));
        }

        Lead savedLead = leadRepository.save(existing);

        if (statusChangedToWarm) {
            marketingAutomationService.triggerStatusChangeEmail(savedLead, newStatus);
        }

        return savedLead;
    }

    public List<LeadInteraction> getInteractions(Long leadId) {
        return interactionRepository.findByLeadIdOrderByFechaDesc(leadId);
    }

    @Transactional
    public LeadInteraction addInteraction(Long leadId, LeadInteraction interaction) {
        Lead lead = getLeadById(leadId);
        interaction.setLead(lead);
        return interactionRepository.save(interaction);
    }

    public List<LeadTask> getTasks(Long leadId) {
        return taskRepository.findByLeadIdOrderByFechaVencimientoAsc(leadId);
    }

    @Transactional
    public LeadTask addTask(Long leadId, LeadTask task) {
        Lead lead = getLeadById(leadId);
        task.setLead(lead);

        // Integración con calendario
        CalendarIntegrationService calendarService = calendarFactory.getService(calendarProvider);
        if (calendarService != null) {
            try {
                String eventId = calendarService.createEvent(task);
                task.setExternalCalendarEventId(eventId);
            } catch (Exception e) {
                log.error("Error al integrar con calendario {}: {}", calendarProvider, e.getMessage());
            }
        }

        return taskRepository.save(task);
    }

    @Transactional
    public LeadTask completeTask(Long taskId) {
        LeadTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        task.setCompletada(true);
        return taskRepository.save(task);
    }

    public List<Asesor> getActiveAsesores() {
        // Sincronizar usuarios de seguridad a la tabla de asesores del CRM
        List<UserAccount> usuarios = userAccountRepository.findByRoleNameAndActiveTrue("ASESOR_CREDITO");
        for (UserAccount u : usuarios) {
            Asesor asesor = AsesorRepository.findByEmail(u.getUsername());
            if (asesor == null) {
                asesor = new Asesor();
                asesor.setNombreCompleto(u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername());
                asesor.setEmail(u.getUsername());
                asesor.setActivo(true);
                AsesorRepository.save(asesor);
            }
        }
        return AsesorRepository.findByActivoTrue();
    }

    public Object debugUsers() {
        return userAccountRepository.findAll();
    }

    public List<OrigenLead> getActiveOrigenes() {
        return origenRepository.findByActivoTrue();
    }

    public List<CountResult> getLeadsCountByStatus() {
        return leadRepository.countLeadsByStatus();
    }

    public List<CountResult> getLeadsCountByOrigin() {
        return leadRepository.countLeadsByOrigin();
    }

    public List<Campana> getCampanas() {
        return campanaRepository.findAll();
    }

    @Transactional
    public PerfilFinanciero syncPerfilFinanciero(Long leadId) {
        Lead lead = getLeadById(leadId);
        String cedula = lead.getIdentificacion();
        if (cedula == null || cedula.isEmpty()) {
            cedula = "0000000000"; // Fallback for old records
        }

        try {
            java.util.Map<String, Object> variables = new java.util.HashMap<>();
            variables.put("interviniente_int_identificacion", cedula);
            
            java.util.Map<String, Object> response = externalProcessService.executeProcess("APIBURO", variables);

            if (response != null) {
                PerfilFinanciero perfil = lead.getPerfilFinanciero();
                if (perfil == null) {
                    perfil = new PerfilFinanciero();
                    perfil.setLead(lead);
                } else {
                    perfil.getDeudasOtrasEntidades().clear();
                    perfil.getTarjetasCredito().clear();
                }

                if (response.get("ingresosMensuales") != null) {
                    perfil.setIngresosMensuales(new java.math.BigDecimal(response.get("ingresosMensuales").toString()));
                }
                if (response.get("valorMaximoPrestamo") != null) {
                    perfil.setValorMaximoPrestamo(new java.math.BigDecimal(response.get("valorMaximoPrestamo").toString()));
                }
                if (response.get("valorMaximoEndeudamiento") != null) {
                    perfil.setValorMaximoEndeudamiento(new java.math.BigDecimal(response.get("valorMaximoEndeudamiento").toString()));
                }
                if (response.get("cuotaEstimadaMensual") != null) {
                    perfil.setCuotaEstimadaMensual(new java.math.BigDecimal(response.get("cuotaEstimadaMensual").toString()));
                }

                if (response.get("deudasOtrasEntidades") instanceof List) {
                    List<java.util.Map<String, Object>> deudas = (List<java.util.Map<String, Object>>) response.get("deudasOtrasEntidades");
                    for (java.util.Map<String, Object> d : deudas) {
                        DeudaExterna deuda = new DeudaExterna();
                        deuda.setEntidad((String) d.get("entidad"));
                        deuda.setSaldo(new java.math.BigDecimal(d.get("saldo").toString()));
                        deuda.setProducto((String) d.get("producto"));
                        perfil.addDeuda(deuda);
                    }
                }

                if (response.get("tarjetasCredito") instanceof List) {
                    List<java.util.Map<String, Object>> tarjetas = (List<java.util.Map<String, Object>>) response.get("tarjetasCredito");
                    for (java.util.Map<String, Object> t : tarjetas) {
                        TarjetaCredito tc = new TarjetaCredito();
                        tc.setEntidad((String) t.get("entidad"));
                        tc.setSaldoActual(new java.math.BigDecimal(t.get("saldoActual").toString()));
                        tc.setCupoTotal(new java.math.BigDecimal(t.get("cupoTotal").toString()));
                        perfil.addTarjeta(tc);
                    }
                }

                lead.setPerfilFinanciero(perfil);
                leadRepository.save(lead);
                return perfil;
            }
        } catch (Exception e) {
            log.error("Error sincronizando perfil financiero", e);
            throw new RuntimeException("No se pudo obtener el perfil financiero del Buró");
        }
        return null;
    }

    @Transactional
    public void enviarEmail(Long leadId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Prospecto no encontrado"));
                
        if (lead.getEmail() == null || lead.getEmail().trim().isEmpty()) {
            throw new RuntimeException("El prospecto no tiene un correo configurado");
        }
        
        java.util.Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("to", lead.getEmail());
        
        java.util.Map<String, Object> response = externalProcessService.executeProcess("APIEMAIL", variables);
        
        if (response != null && "SUCCESS".equals(response.get("status"))) {
            // Guardar interacción de email enviado
            com.innovacred.bpm.domain.entity.LeadInteraction intEmail = new com.innovacred.bpm.domain.entity.LeadInteraction();
            intEmail.setLead(lead);
            intEmail.setTipo("EMAIL");
            intEmail.setResumen("Email enviado exitosamente");
            intEmail.setFecha(java.time.LocalDateTime.now());
            interactionRepository.save(intEmail);
        } else {
            throw new RuntimeException("Falló el envío de correo desde la API");
        }
    }
}
