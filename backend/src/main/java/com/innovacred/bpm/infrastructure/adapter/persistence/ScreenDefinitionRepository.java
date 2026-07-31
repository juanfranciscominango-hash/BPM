package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ScreenDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScreenDefinitionRepository extends JpaRepository<ScreenDefinition, Long> {
    @Query("SELECT s FROM ScreenDefinition s WHERE LOWER(REPLACE(s.processKey, '_de_', '_')) = LOWER(REPLACE(:processKey, '_de_', '_')) OR LOWER(:processKey) LIKE CONCAT(LOWER(s.processKey), '%') OR LOWER(s.processKey) LIKE CONCAT(LOWER(:processKey), '%')")
    List<ScreenDefinition> findByProcessKey(@Param("processKey") String processKey);
    
    @Query("SELECT s FROM ScreenDefinition s WHERE (LOWER(REPLACE(s.processKey, '_de_', '_')) = LOWER(REPLACE(:processKey, '_de_', '_')) OR LOWER(:processKey) LIKE CONCAT(LOWER(s.processKey), '%') OR LOWER(s.processKey) LIKE CONCAT(LOWER(:processKey), '%')) AND s.taskKey = :taskKey")
    Optional<ScreenDefinition> findByProcessKeyAndTaskKey(@Param("processKey") String processKey, @Param("taskKey") String taskKey);
}
