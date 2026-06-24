package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.FormulaHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormulaHistoryRepository extends JpaRepository<FormulaHistory, Long> {
    List<FormulaHistory> findByFormulaDefinitionIdOrderByVersionDesc(Long formulaDefinitionId);
}
