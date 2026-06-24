package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.application.service.ParametricService;
import com.innovacred.bpm.domain.entity.OrigenLead;
import com.innovacred.bpm.domain.entity.ParametricColumn;
import com.innovacred.bpm.domain.entity.ParametricTable;
import com.innovacred.bpm.infrastructure.adapter.out.persistence.repository.OrigenLeadRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.ParametricTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class CrmSeeder implements CommandLineRunner {

    private final OrigenLeadRepository origenLeadRepository;
    private final ParametricTableRepository parametricTableRepository;
    private final ParametricService parametricService;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Verificando catálogos de CRM...");
        
        try {
            jdbcTemplate.execute("ALTER TABLE crm_lead DROP CONSTRAINT IF EXISTS fkaqm5ggkg13j8576t89os4pw1r");
            log.info("Se ha eliminado el foreign key antiguo de crm_lead a crm_origen_lead");
        } catch(Exception e) {
            log.warn("No se pudo eliminar FK fkaqm5ggkg13j8576t89os4pw1r: " + e.getMessage());
        }
        
        // Registrar Paramétrica si no existe
        boolean existsParametric = parametricTableRepository.findAll().stream()
                .anyMatch(t -> "ORIGEN_LEAD".equalsIgnoreCase(t.getName()));
        
        if (!existsParametric) {
            log.info("Creando tabla paramétrica ORIGEN_LEAD...");
            ParametricTable tableDef = new ParametricTable();
            tableDef.setName("ORIGEN_LEAD");
            tableDef.setLabel("Orígenes de Lead");
            tableDef.setDescription("Catálogo de orígenes para prospectos del CRM");
            
            tableDef.setColumns(List.of(
                ParametricColumn.builder().name("nombre").label("Nombre").type("string").build(),
                ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));
            
            parametricService.saveTable(tableDef);
            log.info("Tabla paramétrica ORIGEN_LEAD registrada exitosamente.");
        }

        // Insertar datos por defecto
        if (origenLeadRepository.count() == 0) {
            log.info("Tabla PR_ORIGEN_LEAD vacía. Insertando valores por defecto...");
            
            List<OrigenLead> origenesBase = List.of(
                createOrigen("Facebook Ads", "Prospectos provenientes de campañas de Meta/Facebook"),
                createOrigen("Google Ads", "Prospectos provenientes de campañas de búsqueda"),
                createOrigen("Sitio Web Orgánico", "Prospectos de formularios de la página web"),
                createOrigen("Referido", "Clientes recomendados por otros clientes"),
                createOrigen("Llamada Entrante", "Clientes que contactaron directamente al Call Center"),
                createOrigen("Evento Presencial", "Captación en ferias o activaciones de marca")
            );
            
            origenLeadRepository.saveAll(origenesBase);
            log.info("Se han insertado {} orígenes de lead por defecto.", origenesBase.size());
        }
    }

    private OrigenLead createOrigen(String nombre, String descripcion) {
        OrigenLead origen = new OrigenLead();
        origen.setNombre(nombre);
        origen.setDescripcion(descripcion);
        origen.setActivo(true);
        return origen;
    }
}
