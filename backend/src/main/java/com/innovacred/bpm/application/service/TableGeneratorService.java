package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.MetaAttribute;
import com.innovacred.bpm.domain.entity.MetaEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
@Slf4j
public class TableGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    public void generateTable(MetaEntity entity, List<MetaAttribute> attributes) {
        String tableName = "DY_" + entity.getName().toUpperCase();
        
        StringBuilder sql = new StringBuilder();
        sql.append("CREATE TABLE IF NOT EXISTS ").append(tableName).append(" (");
        sql.append("id SERIAL PRIMARY KEY, ");
        sql.append("process_instance_id VARCHAR(100), ");
        
        for (MetaAttribute attr : attributes) {
            sql.append(attr.getName().toLowerCase()).append(" ");
            sql.append(mapType(attr.getType())).append(", ");
        }
        
        sql.append("created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        sql.append(")");

        log.info("Generating table: {}", sql);
        jdbcTemplate.execute(sql.toString());
    }

    public void insertData(MetaEntity entity, List<MetaAttribute> attributes, Map<String, Object> data, String instanceId) {
        String tableName = "DY_" + entity.getName().toUpperCase();
        
        StringJoiner columns = new StringJoiner(", ");
        StringJoiner values = new StringJoiner(", ");
        
        columns.add("process_instance_id");
        values.add("?");
        
        Object[] args = new Object[attributes.size() + 1];
        args[0] = instanceId;
        
        int i = 1;
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        for (MetaAttribute attr : attributes) {
            columns.add(attr.getName().toLowerCase());
            values.add("?");
            Object val = data.get(attr.getName());
            if (val instanceof java.util.List || val instanceof java.util.Map) {
                try {
                    val = mapper.writeValueAsString(val);
                } catch (Exception e) {
                    val = val.toString();
                }
            }
            
            // Handle empty strings for numbers
            if (val != null && val.toString().trim().isEmpty() && "NUMBER".equalsIgnoreCase(attr.getType())) {
                val = null;
            } else if (val != null && "NUMBER".equalsIgnoreCase(attr.getType())) {
                try {
                    val = new java.math.BigDecimal(val.toString());
                } catch (Exception e) {
                    val = null;
                }
            }

            args[i++] = val;
        }
        
        String sql = String.format("INSERT INTO %s (%s) VALUES (%s)", tableName, columns.toString(), values.toString());
        log.info("Inserting data into {}: {}", tableName, data);
        jdbcTemplate.update(sql, args);
    }

    private String mapType(String type) {
        return switch (type.toLowerCase()) {
            case "number" -> "NUMERIC";
            case "date" -> "DATE";
            case "boolean" -> "BOOLEAN";
            default -> "TEXT";
        };
    }
}
