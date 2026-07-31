package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.TaskSlaConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskSlaConfigRepository extends JpaRepository<TaskSlaConfig, Long> {

    List<TaskSlaConfig> findByProcessDefinitionKeyAndActiveTrue(String processDefinitionKey);

    Optional<TaskSlaConfig> findByProcessDefinitionKeyAndTaskDefinitionKey(
            String processDefinitionKey, String taskDefinitionKey);

    List<TaskSlaConfig> findByActiveTrue();
}
