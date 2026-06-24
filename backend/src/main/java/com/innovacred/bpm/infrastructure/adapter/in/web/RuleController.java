package com.innovacred.bpm.infrastructure.adapter.in.web;

import com.innovacred.bpm.application.service.ScoringRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/crm/rules")
@RequiredArgsConstructor
public class RuleController {

    private final ScoringRuleService scoringRuleService;

    @PostMapping("/evaluate-scoring")
    public ResponseEntity<Map<String, Object>> evaluateScoring(@RequestBody Map<String, Object> variables) {
        return ResponseEntity.ok(scoringRuleService.evaluateScoring(variables));
    }
}
