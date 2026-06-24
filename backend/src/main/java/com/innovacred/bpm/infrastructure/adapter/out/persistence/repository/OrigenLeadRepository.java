package com.innovacred.bpm.infrastructure.adapter.out.persistence.repository;

import com.innovacred.bpm.domain.entity.OrigenLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrigenLeadRepository extends JpaRepository<OrigenLead, Long> {
    List<OrigenLead> findByActivoTrue();
}
