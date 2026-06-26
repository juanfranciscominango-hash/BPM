package com.innovacred.bpm.infrastructure.adapter.out.persistence.repository;

import com.innovacred.bpm.domain.entity.LeadInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadInteractionRepository extends JpaRepository<LeadInteraction, Long> {
    List<LeadInteraction> findByLeadIdOrderByFechaDesc(Long leadId);
    @Modifying
    @Query("DELETE FROM LeadInteraction i WHERE i.lead.id = :leadId")
    void deleteByLeadId(@Param("leadId") Long leadId);
}
