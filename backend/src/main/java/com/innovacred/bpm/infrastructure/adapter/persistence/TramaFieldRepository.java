package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.TramaField;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

public interface TramaFieldRepository extends JpaRepository<TramaField, Long> {
    List<TramaField> findByProcessId(Long processId);
    List<TramaField> findByProcessIdAndTramaType(Long processId, String tramaType);
    
    @Modifying
    @Transactional
    void deleteByProcessId(Long processId);
}
