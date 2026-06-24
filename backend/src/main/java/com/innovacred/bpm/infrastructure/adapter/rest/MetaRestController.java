package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.MetaService;
import com.innovacred.bpm.domain.entity.MetaAttribute;
import com.innovacred.bpm.domain.entity.MetaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/meta")
@RequiredArgsConstructor
public class MetaRestController {

    private final MetaService metaService;
    private final JdbcTemplate jdbcTemplate;

    // --- ENTIDADES ---
    @GetMapping("/entities")
    public List<MetaEntity> listEntities() {
        return metaService.listarEntidades();
    }

    @GetMapping("/entities/{id}/data")
    public List<Map<String, Object>> getDynamicData(@PathVariable Long id) {
        MetaEntity entity = metaService.listarEntidades().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst().orElseThrow();

        String tableName = "DY_" + entity.getName().toUpperCase();
        return jdbcTemplate.queryForList("SELECT * FROM " + tableName + " ORDER BY created_at DESC");
    }

    @PostMapping("/entities")
    public MetaEntity createEntity(@RequestBody MetaEntity entity) {
        return metaService.guardarEntidad(entity);
    }

    @DeleteMapping("/entities/{id}")
    public Map<String, String> deleteEntity(@PathVariable Long id) {
        try {
            metaService.eliminarEntidad(id);
            return Map.of("message", "Entidad eliminada correctamente");
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar la entidad: " + e.getMessage(), e);
        }
    }

    /**
     * Lee las columnas físicas de la tabla DY_ asociada a una MetaEntity
     * directamente desde information_schema. Útil cuando no existen MetaAttribute
     * registrados pero la tabla física sí tiene columnas.
     */
    @GetMapping("/entities/{id}/table-columns")
    public List<Map<String, Object>> getPhysicalTableColumns(@PathVariable Long id) {
        MetaEntity entity = metaService.listarEntidades().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Entidad no encontrada: " + id));

        String tableName = "dy_" + entity.getName().toLowerCase();
        String sql = """
                SELECT column_name AS name,
                       udt_name    AS type,
                       ordinal_position
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name   = ?
                  AND column_name NOT IN ('id','process_instance_id','created_at')
                ORDER BY ordinal_position
                """;
        return jdbcTemplate.queryForList(sql, tableName);
    }

    // --- ATRIBUTOS ---
    @GetMapping("/entities/{entityId}/attributes")
    public List<MetaAttribute> listAttributes(@PathVariable Long entityId) {
        return metaService.listarAtributos(entityId);
    }

    @PostMapping("/attributes")
    public MetaAttribute createAttribute(@RequestBody MetaAttribute attribute) {
        return metaService.guardarAtributo(attribute);
    }

    @PutMapping("/attributes/{id}")
    public MetaAttribute updateAttribute(@PathVariable Long id, @RequestBody MetaAttribute attribute) {
        return metaService.actualizarAtributo(id, attribute);
    }

    @DeleteMapping("/attributes/{id}")
    public void deleteAttribute(@PathVariable Long id) {
        metaService.eliminarAtributo(id);
    }
}
