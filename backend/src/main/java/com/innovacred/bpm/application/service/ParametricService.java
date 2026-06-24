package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ParametricColumn;
import com.innovacred.bpm.domain.entity.ParametricTable;
import com.innovacred.bpm.infrastructure.adapter.persistence.ParametricColumnRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.ParametricTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParametricService {

    private final ParametricTableRepository tableRepository;
    private final ParametricColumnRepository columnRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public ParametricTable saveTable(ParametricTable table) {
        // Asegurar que cada columna tenga la referencia a la tabla
        if (table.getColumns() == null) {
            table.setColumns(new java.util.ArrayList<>());
        }
        table.getColumns().forEach(c -> {
            c.setTable(table);
            if (c.getPrimaryKey() == null) {
                c.setPrimaryKey(false);
            }
        });
        ParametricTable saved = tableRepository.save(table);
        createPhysicalTable(saved);
        return saved;
    }

    private void createPhysicalTable(ParametricTable table) {
        String tableName = "PR_" + table.getName().toUpperCase();
        StringBuilder sql = new StringBuilder();
        sql.append("CREATE TABLE IF NOT EXISTS ").append(tableName).append(" (");
        sql.append("id SERIAL PRIMARY KEY");

        if (table.getColumns() != null) {
            for (ParametricColumn col : table.getColumns()) {
                sql.append(", ");
                sql.append(col.getName().toLowerCase()).append(" ");
                if ("reference".equalsIgnoreCase(col.getType())) {
                    sql.append("BIGINT");
                } else if ("reference_multiple".equalsIgnoreCase(col.getType())) {
                    sql.append("TEXT");
                } else {
                    sql.append(mapType(col.getType()));
                }
            }
        }

        sql.append(", created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        sql.append(")");

        log.info("Creating parametric table: {}", tableName);
        jdbcTemplate.execute(sql.toString());

        // Agregar FKs para columnas de tipo referencia
        if (table.getColumns() != null) {
            for (ParametricColumn col : table.getColumns()) {
                if ("reference".equalsIgnoreCase(col.getType()) && col.getReferencedTableId() != null) {
                    tableRepository.findById(col.getReferencedTableId()).ifPresent(refTable -> {
                        String refTableName = "PR_" + refTable.getName().toUpperCase();
                        String constraintName = "fk_" + table.getName().toLowerCase() + "_" + col.getName().toLowerCase();
                        String fkSql = String.format(
                            "ALTER TABLE %s ADD CONSTRAINT %s FOREIGN KEY (%s) REFERENCES %s(id)",
                            tableName, constraintName, col.getName().toLowerCase(), refTableName
                        );
                        try {
                            jdbcTemplate.execute(fkSql);
                            log.info("FK created: {}", constraintName);
                        } catch (Exception e) {
                            log.warn("Could not create FK {}: {}", constraintName, e.getMessage());
                        }
                    });
                }
            }
        }
    }

    public List<Map<String, Object>> listData(Long tableId) {
        ParametricTable table = tableRepository.findById(tableId).orElseThrow();
        String tableName = "PR_" + table.getName().toUpperCase();
        return jdbcTemplate.queryForList("SELECT * FROM " + tableName + " ORDER BY id ASC");
    }

    public void insertData(Long tableId, Map<String, Object> data) {
        ParametricTable table = tableRepository.findById(tableId).orElseThrow();
        String tableName = "PR_" + table.getName().toUpperCase();
        
        StringJoiner columns = new StringJoiner(", ");
        StringJoiner values = new StringJoiner(", ");
        
        for (ParametricColumn col : table.getColumns()) {
            if (data.containsKey(col.getName())) {
                columns.add(col.getName().toLowerCase());
                values.add("?");
            }
        }
        
        String sql = String.format("INSERT INTO %s (%s) VALUES (%s)", tableName, columns.toString(), values.toString());
        Object[] args = table.getColumns().stream()
                .filter(c -> data.containsKey(c.getName()))
                .map(c -> parseValue(c, data.get(c.getName())))
                .toArray();

        jdbcTemplate.update(sql, args);
    }

    public List<ParametricTable> listAll() {
        return tableRepository.findAll();
    }

    // ──────────── EDICIÓN ────────────

    @Transactional
    public ParametricTable updateTableMeta(Long id, Map<String, String> body) {
        ParametricTable table = tableRepository.findById(id).orElseThrow();
        if (body.containsKey("label"))       table.setLabel(body.get("label"));
        if (body.containsKey("description")) table.setDescription(body.get("description"));
        return tableRepository.save(table);
    }

    @Transactional
    public ParametricColumn addColumn(Long tableId, ParametricColumn col) {
        ParametricTable table = tableRepository.findById(tableId).orElseThrow();
        String tableName = "PR_" + table.getName().toUpperCase();

        String sqlType = "reference".equalsIgnoreCase(col.getType()) ? "BIGINT" : ("reference_multiple".equalsIgnoreCase(col.getType()) ? "TEXT" : mapType(col.getType()));
        String ddl = String.format("ALTER TABLE %s ADD COLUMN IF NOT EXISTS %s %s",
                tableName, col.getName().toLowerCase(), sqlType);
        jdbcTemplate.execute(ddl);
        log.info("Column added: {} to {}", col.getName(), tableName);

        // FK si es referencia
        if ("reference".equalsIgnoreCase(col.getType()) && col.getReferencedTableId() != null) {
            tableRepository.findById(col.getReferencedTableId()).ifPresent(refTable -> {
                String refName = "PR_" + refTable.getName().toUpperCase();
                String constraintName = "fk_" + table.getName().toLowerCase() + "_" + col.getName().toLowerCase();
                try {
                    jdbcTemplate.execute(String.format(
                        "ALTER TABLE %s ADD CONSTRAINT %s FOREIGN KEY (%s) REFERENCES %s(id)",
                        tableName, constraintName, col.getName().toLowerCase(), refName));
                } catch (Exception e) {
                    log.warn("FK already exists or error: {}", e.getMessage());
                }
            });
        }

        if (col.getPrimaryKey() == null) {
            col.setPrimaryKey(false);
        }

        col.setTable(table);
        return columnRepository.save(col);
    }

    @Transactional
    public void removeColumn(Long tableId, Long colId) {
        ParametricTable table = tableRepository.findById(tableId).orElseThrow();
        ParametricColumn col = columnRepository.findById(colId).orElseThrow();
        String tableName = "PR_" + table.getName().toUpperCase();

        try {
            jdbcTemplate.execute(String.format("ALTER TABLE %s DROP COLUMN IF EXISTS %s CASCADE",
                    tableName, col.getName().toLowerCase()));
        } catch (Exception e) {
            log.warn("Error dropping column {}: {}", col.getName(), e.getMessage());
        }
        columnRepository.delete(col);
    }

    @Transactional
    public ParametricColumn updateColumnLabel(Long colId, String newLabel) {
        ParametricColumn col = columnRepository.findById(colId).orElseThrow();
        col.setLabel(newLabel);
        return columnRepository.save(col);
    }

    @Transactional
    public ParametricColumn updateColumn(Long colId, ParametricColumn updatedCol) {
        ParametricColumn original = columnRepository.findById(colId).orElseThrow();
        ParametricTable table = original.getTable();
        String tableName = "PR_" + table.getName().toUpperCase();

        // 1. Guardar etiqueta
        original.setLabel(updatedCol.getLabel());

        // 2. Si cambia el nombre técnico de la columna
        if (updatedCol.getName() != null && !original.getName().equalsIgnoreCase(updatedCol.getName())) {
            String oldColName = original.getName().toLowerCase();
            String newColName = updatedCol.getName().toLowerCase();
            try {
                jdbcTemplate.execute(String.format("ALTER TABLE %s RENAME COLUMN %s TO %s", 
                        tableName, oldColName, newColName));
                log.info("Renamed column in DB from {} to {}", oldColName, newColName);
            } catch (Exception e) {
                log.error("Error renaming column in DB: {}", e.getMessage());
            }
            original.setName(newColName);
        }

        // 3. Si cambia el tipo o la referencia
        boolean typeChanged = updatedCol.getType() != null && !original.getType().equalsIgnoreCase(updatedCol.getType());
        boolean refTableChanged = !java.util.Objects.equals(original.getReferencedTableId(), updatedCol.getReferencedTableId());

        if (typeChanged || refTableChanged) {
            String colName = original.getName().toLowerCase();

            // Si era reference, quitar constraint de FK
            if ("reference".equalsIgnoreCase(original.getType())) {
                String oldConstraintName = "fk_" + table.getName().toLowerCase() + "_" + colName;
                try {
                    jdbcTemplate.execute(String.format("ALTER TABLE %s DROP CONSTRAINT IF EXISTS %s", 
                            tableName, oldConstraintName));
                } catch (Exception e) {
                    log.warn("Error dropping constraint: {}", e.getMessage());
                }
            }

            // Cambiar tipo físico
            if (typeChanged) {
                String newSqlType = "reference".equalsIgnoreCase(updatedCol.getType()) ? "BIGINT" : ("reference_multiple".equalsIgnoreCase(updatedCol.getType()) ? "TEXT" : mapType(updatedCol.getType()));
                try {
                    jdbcTemplate.execute(String.format("ALTER TABLE %s ALTER COLUMN %s TYPE %s USING %s::%s", 
                            tableName, colName, newSqlType, colName, newSqlType));
                    log.info("Altered column {} type to {}", colName, newSqlType);
                } catch (Exception e) {
                    try {
                        jdbcTemplate.execute(String.format("ALTER TABLE %s ALTER COLUMN %s TYPE %s", 
                                tableName, colName, newSqlType));
                    } catch (Exception ex) {
                        log.error("Failed to alter column type: {}", ex.getMessage());
                    }
                }
                original.setType(updatedCol.getType());
            }

            // Si el nuevo tipo es reference, agregar FK
            if ("reference".equalsIgnoreCase(original.getType()) || "reference_multiple".equalsIgnoreCase(original.getType())) {
                original.setReferencedTableId(updatedCol.getReferencedTableId());
                if (updatedCol.getReferencedTableId() != null) {
                    tableRepository.findById(updatedCol.getReferencedTableId()).ifPresent(refTable -> {
                        String refName = "PR_" + refTable.getName().toUpperCase();
                        String constraintName = "fk_" + table.getName().toLowerCase() + "_" + colName;
                        original.setReferencedTableLabel(refTable.getLabel());
                        
                        if ("reference".equalsIgnoreCase(original.getType())) {
                            try {
                                jdbcTemplate.execute(String.format(
                                    "ALTER TABLE %s ADD CONSTRAINT %s FOREIGN KEY (%s) REFERENCES %s(id)",
                                    tableName, constraintName, colName, refName));
                            } catch (Exception e) {
                                log.warn("Error creating FK constraint: {}", e.getMessage());
                            }
                        }
                    });
                } else {
                    original.setReferencedTableLabel(null);
                }
            } else {
                original.setReferencedTableId(null);
                original.setReferencedTableLabel(null);
            }
        }

        return columnRepository.save(original);
    }

    public void updateData(Long tableId, Long rowId, Map<String, Object> data) {
        ParametricTable table = tableRepository.findById(tableId).orElseThrow();
        String tableName = "PR_" + table.getName().toUpperCase();
        
        StringJoiner sets = new StringJoiner(", ");
        java.util.List<Object> argsList = new java.util.ArrayList<>();
        
        for (ParametricColumn col : table.getColumns()) {
            if (data.containsKey(col.getName())) {
                sets.add(col.getName().toLowerCase() + " = ?");
                
                Object val = data.get(col.getName());
                argsList.add(parseValue(col, val));
            }
        }
        
        if (argsList.isEmpty()) {
            return;
        }
        
        argsList.add(rowId);
        String sql = String.format("UPDATE %s SET %s WHERE id = ?", tableName, sets.toString());
        jdbcTemplate.update(sql, argsList.toArray());
    }

    public void deleteData(Long tableId, Long rowId) {
        ParametricTable table = tableRepository.findById(tableId).orElseThrow();
        String tableName = "PR_" + table.getName().toUpperCase();
        String sql = String.format("DELETE FROM %s WHERE id = ?", tableName);
        jdbcTemplate.update(sql, rowId);
    }

    @Transactional
    public void deleteTable(Long tableId) {
        ParametricTable table = tableRepository.findById(tableId).orElseThrow();
        String tableName = "PR_" + table.getName().toUpperCase();
        
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS " + tableName);
            log.info("Dropped physical table: {}", tableName);
        } catch (Exception e) {
            log.error("Failed to drop physical table {}: {}", tableName, e.getMessage());
        }
        
        tableRepository.delete(table);
    }

    private Object parseValue(ParametricColumn col, Object val) {
        if (val == null || "".equals(val.toString().trim())) {
            return null;
        }
        String type = col.getType().toLowerCase();

        if ("reference_multiple".equals(type)) {
            if (val instanceof java.util.Collection) {
                java.util.Collection<?> colVal = (java.util.Collection<?>) val;
                if (colVal.isEmpty()) return null;
                StringJoiner sj = new StringJoiner(",");
                colVal.forEach(item -> sj.add(item.toString()));
                return sj.toString();
            } else if (val.getClass().isArray()) {
                Object[] arr = (Object[]) val;
                if (arr.length == 0) return null;
                StringJoiner sj = new StringJoiner(",");
                for (Object item : arr) {
                    sj.add(item.toString());
                }
                return sj.toString();
            } else {
                return val.toString();
            }
        }

        switch (type) {
            case "boolean":
                if (val instanceof Boolean) {
                    return val;
                }
                String s = val.toString().trim().toLowerCase();
                return "true".equals(s) || "1".equals(s) || "si".equals(s) || "yes".equals(s) || "activo".equals(s) || "verdadero".equals(s);
            case "number":
                try {
                    return new java.math.BigDecimal(val.toString());
                } catch (Exception e) {
                    return null;
                }
            case "integer":
                try {
                    return Integer.parseInt(val.toString());
                } catch (Exception e) {
                    return null;
                }
            case "date":
                return val.toString();
            case "datetime":
                return val.toString().replace("T", " ");
            case "time":
                return val.toString();
            default:
                return val;
        }
    }

    private String mapType(String type) {
        return switch (type.toLowerCase()) {
            case "number"    -> "NUMERIC";
            case "integer"   -> "INTEGER";
            case "boolean"   -> "BOOLEAN";
            case "date"      -> "DATE";
            case "datetime"  -> "TIMESTAMP";
            case "time"      -> "TIME";
            case "text"      -> "TEXT";
            case "reference" -> "BIGINT";
            case "reference_multiple" -> "TEXT";
            default          -> "VARCHAR(255)";
        };
    }
}
