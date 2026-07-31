package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.TaskActionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskActionRuleRepository extends JpaRepository<TaskActionRule, Long> {

    List<TaskActionRule> findByProcessDefinitionKeyAndTaskDefinitionKeyAndEventTriggerAndActiveTrueOrderBySortOrderAsc(
            String processDefinitionKey, String taskDefinitionKey, String eventTrigger);

    List<TaskActionRule> findByProcessDefinitionKey(String processDefinitionKey);
    
    List<TaskActionRule> findByProcessDefinitionKeyAndTaskDefinitionKey(String processDefinitionKey, String taskDefinitionKey);
}
