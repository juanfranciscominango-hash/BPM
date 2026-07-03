package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.DocumentDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentDefinitionRepository extends JpaRepository<DocumentDefinition, Long> {
    List<DocumentDefinition> findByProcessKey(String processKey);
    List<DocumentDefinition> findByNameContainingIgnoreCase(String name);
}
