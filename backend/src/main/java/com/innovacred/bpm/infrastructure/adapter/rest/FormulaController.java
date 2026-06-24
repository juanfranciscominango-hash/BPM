package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.FormulaService;
import com.innovacred.bpm.domain.entity.FormulaDefinition;
import com.innovacred.bpm.domain.entity.FormulaHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/formulas")
@RequiredArgsConstructor
public class FormulaController {

    private final FormulaService formulaService;

    @GetMapping
    public ResponseEntity<List<FormulaDefinition>> getAllFormulas() {
        return ResponseEntity.ok(formulaService.getAllFormulas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormulaDefinition> getFormula(@PathVariable Long id) {
        return ResponseEntity.ok(formulaService.getFormulaById(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<FormulaHistory>> getFormulaHistory(@PathVariable Long id) {
        return ResponseEntity.ok(formulaService.getFormulaHistory(id));
    }

    @PostMapping
    public ResponseEntity<FormulaDefinition> createFormula(@RequestBody FormulaDefinition formula) {
        String author = "Sistema";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            author = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return ResponseEntity.ok(formulaService.saveFormula(formula, author));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormulaDefinition> updateFormula(@PathVariable Long id, @RequestBody FormulaDefinition formula) {
        formula.setId(id);
        String author = "Sistema";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            author = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return ResponseEntity.ok(formulaService.saveFormula(formula, author));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormula(@PathVariable Long id) {
        formulaService.deleteFormula(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Object> evaluateFormula(@RequestBody Map<String, Object> request) {
        String expression = (String) request.get("expression");
        @SuppressWarnings("unchecked")
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");
        Object result = formulaService.evaluateFormula(expression, variables);
        return ResponseEntity.ok(Map.of("result", result));
    }
    
    @PostMapping("/evaluate/{key}")
    public ResponseEntity<Object> evaluateFormulaByKey(@PathVariable String key, @RequestBody Map<String, Object> variables) {
        Object result = formulaService.evaluateFormulaByKey(key, variables);
        return ResponseEntity.ok(Map.of("result", result));
    }
}
