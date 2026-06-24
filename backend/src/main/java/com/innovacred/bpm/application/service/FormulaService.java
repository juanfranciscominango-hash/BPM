package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.FormulaDefinition;
import com.innovacred.bpm.domain.entity.FormulaHistory;
import com.innovacred.bpm.infrastructure.adapter.persistence.FormulaDefinitionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.FormulaHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.expression.MapAccessor;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FormulaService {

    private final FormulaDefinitionRepository formulaRepository;
    private final FormulaHistoryRepository historyRepository;
    
    private final ExpressionParser parser = new SpelExpressionParser();

    @Transactional
    public FormulaDefinition saveFormula(FormulaDefinition formula, String author) {
        if (formula.getId() != null) {
            FormulaDefinition existing = formulaRepository.findById(formula.getId())
                .orElseThrow(() -> new RuntimeException("Formula no encontrada"));
            
            FormulaHistory history = FormulaHistory.builder()
                .formulaDefinition(existing)
                .key(existing.getKey())
                .name(existing.getName())
                .description(existing.getDescription())
                .version(existing.getVersion())
                .author(existing.getAuthor())
                .expression(existing.getExpression())
                .canvasJson(existing.getCanvasJson())
                .archivedAt(LocalDateTime.now())
                .build();
            historyRepository.save(history);
            
            formula.setVersion(existing.getVersion() + 1);
            formula.setAuthor(author);
        } else {
            formula.setVersion(1);
            formula.setAuthor(author);
        }
        
        return formulaRepository.save(formula);
    }
    
    public List<FormulaDefinition> getAllFormulas() {
        return formulaRepository.findAll();
    }
    
    public FormulaDefinition getFormulaByKey(String key) {
        return formulaRepository.findByKey(key)
            .orElseThrow(() -> new RuntimeException("Formula no encontrada con llave: " + key));
    }
    
    public FormulaDefinition getFormulaById(Long id) {
        return formulaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Formula no encontrada con ID: " + id));
    }
    
    public Object evaluateFormula(String expression, Map<String, Object> variables) {
        try {
            StandardEvaluationContext context = new StandardEvaluationContext(variables);
            context.addPropertyAccessor(new MapAccessor());
            return parser.parseExpression(expression).getValue(context);
        } catch (Exception e) {
            throw new RuntimeException("Error evaluando la fórmula: " + e.getMessage(), e);
        }
    }
    
    public Object evaluateFormulaByKey(String key, Map<String, Object> variables) {
        FormulaDefinition formula = getFormulaByKey(key);
        return evaluateFormula(formula.getExpression(), variables);
    }
    
    public void deleteFormula(Long id) {
        formulaRepository.deleteById(id);
    }
    
    public List<FormulaHistory> getFormulaHistory(Long formulaId) {
        return historyRepository.findByFormulaDefinitionIdOrderByVersionDesc(formulaId);
    }
}
