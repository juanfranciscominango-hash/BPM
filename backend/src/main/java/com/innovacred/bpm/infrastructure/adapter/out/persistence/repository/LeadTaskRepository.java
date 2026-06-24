package com.innovacred.bpm.infrastructure.adapter.out.persistence.repository;

import com.innovacred.bpm.domain.entity.LeadTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadTaskRepository extends JpaRepository<LeadTask, Long> {
    List<LeadTask> findByLeadIdOrderByFechaVencimientoAsc(Long leadId);
}
