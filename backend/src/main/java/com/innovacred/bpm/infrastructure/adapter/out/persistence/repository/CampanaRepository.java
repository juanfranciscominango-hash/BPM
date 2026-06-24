package com.innovacred.bpm.infrastructure.adapter.out.persistence.repository;

import com.innovacred.bpm.domain.entity.Campana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampanaRepository extends JpaRepository<Campana, Long> {
}
