package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ProcessDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProcessDefinitionRepository extends JpaRepository<ProcessDefinition, Long> {
    Optional<ProcessDefinition> findByKey(String key);
    Optional<ProcessDefinition> findByProcDefId(String procDefId);
}
