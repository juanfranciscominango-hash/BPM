package com.innovacred.bpm.infrastructure.adapter.out.persistence.repository;

import com.innovacred.bpm.domain.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.innovacred.bpm.domain.dto.CountResult;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findAllByOrderByCreatedAtDesc();

    @Query("SELECT l.estado as name, COUNT(l) as value FROM Lead l GROUP BY l.estado")
    List<CountResult> countLeadsByStatus();

    @Query("SELECT l.origen.nombre as name, COUNT(l) as value FROM Lead l GROUP BY l.origen.nombre")
    List<CountResult> countLeadsByOrigin();
}
