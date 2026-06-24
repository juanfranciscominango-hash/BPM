package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.FormulaDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormulaDefinitionRepository extends JpaRepository<FormulaDefinition, Long> {
    Optional<FormulaDefinition> findByKey(String key);
}
