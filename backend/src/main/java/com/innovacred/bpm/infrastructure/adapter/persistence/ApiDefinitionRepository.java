package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ApiDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ApiDefinitionRepository extends JpaRepository<ApiDefinition, Long> {
    Optional<ApiDefinition> findByName(String name);
}
