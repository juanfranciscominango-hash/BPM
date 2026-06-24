package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.RuleDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RuleDefinitionRepository extends JpaRepository<RuleDefinition, Long> {
    Optional<RuleDefinition> findByKey(String key);
}
