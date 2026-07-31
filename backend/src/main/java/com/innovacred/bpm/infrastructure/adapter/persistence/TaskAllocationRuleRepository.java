package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.TaskAllocationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TaskAllocationRuleRepository extends JpaRepository<TaskAllocationRule, Long> {
    Optional<TaskAllocationRule> findByProcessDefinitionKeyAndTaskDefinitionKey(String processDefinitionKey, String taskDefinitionKey);
}
