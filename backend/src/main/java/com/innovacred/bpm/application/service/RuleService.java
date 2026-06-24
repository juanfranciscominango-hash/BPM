package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.RuleDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.RuleDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.dmn.api.DmnDecision;
import org.flowable.dmn.api.DmnDeployment;
import org.flowable.dmn.api.DmnRepositoryService;
import org.flowable.dmn.api.DmnDecisionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleService {

    private final DmnRepositoryService dmnRepositoryService;
    private final DmnDecisionService dmnRuleService;
    private final RuleDefinitionRepository ruleDefinitionRepository;

    @Transactional
    public RuleDefinition deploy(Long id) {
        RuleDefinition ruleDef = ruleDefinitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regla no encontrada"));

        log.info("Desplegando regla DMN: {} ({})", ruleDef.getName(), ruleDef.getKey());

        DmnDeployment deployment = dmnRepositoryService.createDeployment()
                .name(ruleDef.getName())
                .addString(ruleDef.getKey() + ".dmn", ruleDef.getDmnXml())
                .deploy();

        DmnDecision decision = dmnRepositoryService.createDecisionQuery()
                .deploymentId(deployment.getId())
                .singleResult();

        ruleDef.setDeploymentId(deployment.getId());
        ruleDef.setStatus("DEPLOYED");
        ruleDef.setVersion(decision.getVersion());

        return ruleDefinitionRepository.save(ruleDef);
    }

    public Map<String, Object> execute(String ruleKey, Map<String, Object> inputVariables) {
        log.info("Ejecutando regla: {} con variables: {}", ruleKey, inputVariables);
        return dmnRuleService.createExecuteDecisionBuilder()
                .decisionKey(ruleKey)
                .variables(inputVariables)
                .executeWithSingleResult();
    }

    public List<RuleDefinition> listAll() {
        return ruleDefinitionRepository.findAll();
    }

    @Transactional
    public RuleDefinition save(RuleDefinition rule) {
        if (rule.getStatus() == null) rule.setStatus("DRAFT");
        return ruleDefinitionRepository.save(rule);
    }

    public RuleDefinition getById(Long id) {
        return ruleDefinitionRepository.findById(id).orElseThrow();
    }
}
