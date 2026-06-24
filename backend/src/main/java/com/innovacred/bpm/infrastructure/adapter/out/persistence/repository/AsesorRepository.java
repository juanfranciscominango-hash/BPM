package com.innovacred.bpm.infrastructure.adapter.out.persistence.repository;

import com.innovacred.bpm.domain.entity.Asesor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsesorRepository extends JpaRepository<Asesor, Long> {
    List<Asesor> findByActivoTrue();
    Asesor findByEmail(String email);
}

