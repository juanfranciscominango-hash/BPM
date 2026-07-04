package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.DynamicColumnDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DynamicColumnDefinitionRepository extends JpaRepository<DynamicColumnDefinition, Long> {
}
