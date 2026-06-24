package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ScreenDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ScreenDefinitionRepository extends JpaRepository<ScreenDefinition, Long> {
    List<ScreenDefinition> findByProcessKey(String processKey);
    Optional<ScreenDefinition> findByProcessKeyAndTaskKey(String processKey, String taskKey);
}
