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

        // Migración para soportar flujo múltiple en "Parámetros generales"
        try {
            log.info("Ejecutando migración para convertir columna 'flujo' en referencia_multiple...");
            // 1. Eliminar constrain FK antiguo si existe
            jdbcTemplate.execute("ALTER TABLE PR_PARANMETROS_GENERALES DROP CONSTRAINT IF EXISTS fk_paranmetros_generales_flujo");
            
            // 2. Modificar el tipo de datos de la columna física
            jdbcTemplate.execute("ALTER TABLE PR_PARANMETROS_GENERALES ALTER COLUMN flujo TYPE VARCHAR(255) USING flujo::varchar");
            
            // 3. Modificar metadatos en PARAMETRIC_COLUMN
            jdbcTemplate.execute("UPDATE PARAMETRIC_COLUMN SET type = 'reference_multiple' " +
                                 "WHERE name = 'flujo' " +
                                 "AND table_id IN (SELECT id FROM PARAMETRIC_TABLE WHERE name IN ('PARANMETROS_GENERALES', 'PARAMETROS_GENERALES'))");
            
            log.info("Migración de 'flujo' a reference_multiple completada con éxito.");
        } catch (Exception e) {
            log.warn("Error o advertencia durante la migración de 'flujo': " + e.getMessage());
        }

        // Sembrado de colores corporativos por defecto en pr_paranmetros_generales
        try {
            Boolean tableExists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pr_paranmetros_generales')",
                Boolean.class
            );
            if (Boolean.TRUE.equals(tableExists)) {
                log.info("Sembrando colores corporativos en pr_paranmetros_generales...");
                
                // Color Primario
                Integer countPrimary = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM pr_paranmetros_generales WHERE LOWER(descripcion) = 'color_primario'",
                    Integer.class
                );
                if (countPrimary == 0) {
                    jdbcTemplate.execute("INSERT INTO pr_paranmetros_generales (descripcion, valor) VALUES ('color_primario', '#e30613')");
                    log.info("Sembrado color_primario por defecto (#e30613).");
                }
                
                // Color Secundario
                Integer countSecondary = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM pr_paranmetros_generales WHERE LOWER(descripcion) = 'color_secundario'",
                    Integer.class
                );
                if (countSecondary == 0) {
                    jdbcTemplate.execute("INSERT INTO pr_paranmetros_generales (descripcion, valor) VALUES ('color_secundario', '#b30000')");
                    log.info("Sembrado color_secundario por defecto (#b30000).");
                }
                
                // Color Acento
                Integer countAccent = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM pr_paranmetros_generales WHERE LOWER(descripcion) = 'color_acento'",
                    Integer.class
                );
                if (countAccent == 0) {
                    jdbcTemplate.execute("INSERT INTO pr_paranmetros_generales (descripcion, valor) VALUES ('color_acento', '#D4AF37')");
                    log.info("Sembrado color_acento por defecto (#D4AF37).");
                }
            }
        } catch (Exception e) {
            log.warn("Error al sembrar colores corporativos en pr_paranmetros_generales: " + e.getMessage());
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
