package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.domain.entity.TaskAllocationRule;
import com.innovacred.bpm.infrastructure.adapter.persistence.TaskAllocationRuleRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.ProcessDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.flowable.engine.RepositoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/task-allocation")
@RequiredArgsConstructor
public class TaskAllocationRestController {

    private final TaskAllocationRuleRepository ruleRepository;
    private final RepositoryService repositoryService;
    private final ProcessDefinitionRepository processDefinitionRepository;

    @GetMapping("/rules")
    public List<TaskAllocationRule> getRules() {
        List<TaskAllocationRule> rules = ruleRepository.findAll();
        Map<String, org.flowable.bpmn.model.BpmnModel> modelCache = new HashMap<>();
        for (TaskAllocationRule rule : rules) {
            try {
                String procKey = rule.getProcessDefinitionKey();
                String searchKey = procKey;
                var customProcDef = processDefinitionRepository.findByKey(procKey);
                if (customProcDef.isPresent() && customProcDef.get().getProcDefId() != null) {
                    searchKey = customProcDef.get().getProcDefId().split(":")[0];
                }
                
                org.flowable.bpmn.model.BpmnModel model = modelCache.get(searchKey);
                if (model == null) {
                    org.flowable.engine.repository.ProcessDefinition procDef = repositoryService.createProcessDefinitionQuery()
                            .processDefinitionKey(searchKey)
                            .latestVersion()
                            .singleResult();
                    if (procDef != null) {
                        model = repositoryService.getBpmnModel(procDef.getId());
                        modelCache.put(searchKey, model);
                    }
                }
                if (model != null) {
                    for (org.flowable.bpmn.model.Process process : model.getProcesses()) {
                        org.flowable.bpmn.model.FlowElement element = process.getFlowElement(rule.getTaskDefinitionKey());
                        if (element instanceof org.flowable.bpmn.model.UserTask) {
                            rule.setTaskName(element.getName());
                            break;
                        }
                    }
                    
                    // Fallback to older versions if not found in the latest version
                    if (rule.getTaskName() == null || rule.getTaskName().trim().isEmpty()) {
                        List<org.flowable.engine.repository.ProcessDefinition> allVersions = repositoryService.createProcessDefinitionQuery()
                                .processDefinitionKey(searchKey)
                                .orderByProcessDefinitionVersion().desc()
                                .list();
                        for (org.flowable.engine.repository.ProcessDefinition oldDef : allVersions) {
                            try {
                                org.flowable.bpmn.model.BpmnModel oldModel = repositoryService.getBpmnModel(oldDef.getId());
                                if (oldModel != null) {
                                    for (org.flowable.bpmn.model.Process oldProcess : oldModel.getProcesses()) {
                                        org.flowable.bpmn.model.FlowElement oldElement = oldProcess.getFlowElement(rule.getTaskDefinitionKey());
                                        if (oldElement instanceof org.flowable.bpmn.model.UserTask) {
                                            rule.setTaskName(oldElement.getName());
                                            break;
                                        }
                                    }
                                }
                            } catch (Exception ex) {
                                // Ignore
                            }
                            if (rule.getTaskName() != null) {
                                break;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore errors to not block
            }
        }
        return rules;
    }

    @PostMapping("/rules")
    public TaskAllocationRule saveRule(@RequestBody TaskAllocationRule rule) {
        // En caso de que ya exista una regla para el mismo proceso/tarea, sobrescribirla o actualizarla
        return ruleRepository.findByProcessDefinitionKeyAndTaskDefinitionKey(
                rule.getProcessDefinitionKey(), rule.getTaskDefinitionKey())
            .map(existing -> {
                existing.setAllocationMethod(rule.getAllocationMethod());
                existing.setCandidateGroup(rule.getCandidateGroup());
                existing.setSpecificExpression(rule.getSpecificExpression());
                existing.setActive(rule.isActive());
                return ruleRepository.save(existing);
            })
            .orElseGet(() -> ruleRepository.save(rule));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        ruleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tasks/{processKey}")
    public List<Map<String, String>> getTaskDefinitions(@PathVariable String processKey) {
        String searchKey = processKey;
        var customProcDef = processDefinitionRepository.findByKey(processKey);
        if (customProcDef.isPresent() && customProcDef.get().getProcDefId() != null) {
            searchKey = customProcDef.get().getProcDefId().split(":")[0];
        }

        org.flowable.engine.repository.ProcessDefinition procDef = repositoryService.createProcessDefinitionQuery()
                .processDefinitionKey(searchKey)
                .latestVersion()
                .singleResult();
        if (procDef == null) return List.of();
        
        org.flowable.bpmn.model.BpmnModel model = repositoryService.getBpmnModel(procDef.getId());
        List<Map<String, String>> tasks = new ArrayList<>();
        
        for (org.flowable.bpmn.model.Process process : model.getProcesses()) {
            for (org.flowable.bpmn.model.FlowElement element : process.getFlowElements()) {
                if (element instanceof org.flowable.bpmn.model.UserTask) {
                    org.flowable.bpmn.model.UserTask userTask = (org.flowable.bpmn.model.UserTask) element;
                    Map<String, String> map = new HashMap<>();
                    map.put("key", userTask.getId());
                    map.put("name", userTask.getName());
                    tasks.add(map);
                }
            }
        }
        return tasks;
    }
}
