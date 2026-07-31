package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ProcessVariableSchema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProcessVariableSchemaRepository extends JpaRepository<ProcessVariableSchema, Long> {

    List<ProcessVariableSchema> findByProcessDefinitionKeyAndActiveTrueOrderBySortOrderAsc(String processDefinitionKey);

    Optional<ProcessVariableSchema> findByProcessDefinitionKeyAndVariableName(
            String processDefinitionKey, String variableName);

    List<ProcessVariableSchema> findByProcessDefinitionKey(String processDefinitionKey);
}
