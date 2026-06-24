package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ParametricService;
import com.innovacred.bpm.domain.entity.ParametricColumn;
import com.innovacred.bpm.domain.entity.ParametricTable;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parametric")
@RequiredArgsConstructor
public class ParametricRestController {

    private final ParametricService parametricService;

    // ─── TABLAS ───────────────────────────────────────────────
    @GetMapping("/tables")
    public List<ParametricTable> listTables() {
        return parametricService.listAll();
    }

    @PostMapping("/tables")
    public ResponseEntity<?> saveTable(@RequestBody ParametricTable table) {
        try {
            return ResponseEntity.ok(parametricService.saveTable(table));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", e.getMessage(), "cause", e.getClass().getSimpleName()));
        }
    }

    @PatchMapping("/tables/{id}")
    public ResponseEntity<?> updateTableMeta(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(parametricService.updateTableMeta(id, body));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── COLUMNAS ─────────────────────────────────────────────
    @PostMapping("/tables/{id}/columns")
    public ResponseEntity<?> addColumn(@PathVariable Long id, @RequestBody ParametricColumn col) {
        try {
            return ResponseEntity.ok(parametricService.addColumn(id, col));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/tables/{tableId}/columns/{colId}")
    public ResponseEntity<?> removeColumn(@PathVariable Long tableId, @PathVariable Long colId) {
        try {
            parametricService.removeColumn(tableId, colId);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/columns/{colId}/label")
    public ResponseEntity<?> updateColumnLabel(@PathVariable Long colId, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(parametricService.updateColumnLabel(colId, body.get("label")));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/columns/{colId}")
    public ResponseEntity<?> updateColumn(@PathVariable Long colId, @RequestBody ParametricColumn col) {
        try {
            return ResponseEntity.ok(parametricService.updateColumn(colId, col));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── DATOS ────────────────────────────────────────────────
    @GetMapping("/tables/{id}/data")
    public List<Map<String, Object>> listData(@PathVariable Long id) {
        return parametricService.listData(id);
    }

    @PostMapping("/tables/{id}/data")
    public void insertData(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        parametricService.insertData(id, data);
    }

    @PutMapping("/tables/{id}/data/{rowId}")
    public void updateData(@PathVariable Long id, @PathVariable Long rowId, @RequestBody Map<String, Object> data) {
        parametricService.updateData(id, rowId, data);
    }

    @DeleteMapping("/tables/{id}/data/{rowId}")
    public void deleteData(@PathVariable Long id, @PathVariable Long rowId) {
        parametricService.deleteData(id, rowId);
    }

    @DeleteMapping("/tables/{id}")
    public void deleteTable(@PathVariable Long id) {
        parametricService.deleteTable(id);
    }
}

