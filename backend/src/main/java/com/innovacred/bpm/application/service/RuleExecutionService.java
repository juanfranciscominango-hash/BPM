package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.MetaAttribute;
import com.innovacred.bpm.domain.entity.MetaEntity;
import com.innovacred.bpm.domain.entity.ProcessDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleExecutionService {

    private final RuleService ruleService;
    private final MetaService metaService;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Ejecuta una regla DMN utilizando los datos actuales de una instancia de proceso
     * almacenados en su tabla dinámica.
     */
    public Map<String, Object> executeRuleWithProcessContext(String ruleKey, ProcessDefinition procDef, String instanceId) {
        Map<String, Object> contextVariables = new HashMap<>();

        if (procDef.getMetaEntityId() != null) {
            MetaEntity entity = metaService.listarEntidades().stream()
                    .filter(e -> e.getId().equals(procDef.getMetaEntityId()))
                    .findFirst().orElse(null);

            if (entity != null) {
                List<MetaAttribute> attributes = metaService.listarAtributos(entity.getId());
                String tableName = "DY_" + entity.getName().toUpperCase();
                
                try {
                    String sql = "SELECT * FROM " + tableName + " WHERE process_instance_id = ? ORDER BY created_at DESC LIMIT 1";
                    Map<String, Object> data = jdbcTemplate.queryForMap(sql, instanceId);
                    
                    // Mapear columnas de la tabla a variables para el motor DMN
                    for (MetaAttribute attr : attributes) {
                        String colName = attr.getName().toLowerCase();
                        if (data.containsKey(colName)) {
                            contextVariables.put(attr.getName(), data.get(colName));
                        }
                    }
                    log.info("Contexto cargado para la regla {}: {}", ruleKey, contextVariables);
                } catch (Exception e) {
                    log.warn("No se pudo cargar el contexto dinámico para la instancia {}: {}", instanceId, e.getMessage());
                }
            }
        }

        return ruleService.execute(ruleKey, contextVariables);
    }
}
