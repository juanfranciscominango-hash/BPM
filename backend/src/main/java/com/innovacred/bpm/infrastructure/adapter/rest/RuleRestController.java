package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.RuleService;
import com.innovacred.bpm.domain.entity.RuleDefinition;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rules")
@RequiredArgsConstructor
public class RuleRestController {

    private final RuleService ruleService;

    @GetMapping
    public List<RuleDefinition> listAll() {
        return ruleService.listAll();
    }

    @PostMapping
    public RuleDefinition save(@RequestBody RuleDefinition rule) {
        return ruleService.save(rule);
    }

    @PostMapping("/{id}/deploy")
    public RuleDefinition deploy(@PathVariable Long id) {
        return ruleService.deploy(id);
    }

    @PostMapping("/{key}/execute")
    public Map<String, Object> execute(@PathVariable String key, @RequestBody Map<String, Object> variables) {
        return ruleService.execute(key, variables);
    }

    @GetMapping("/{id}")
    public RuleDefinition getById(@PathVariable Long id) {
        return ruleService.getById(id);
    }
}
