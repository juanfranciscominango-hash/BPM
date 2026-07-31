package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.TuVentanilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TuVentanillaRepository extends JpaRepository<TuVentanilla, Long> {
    Optional<TuVentanilla> findByNumeroVentanilla(Integer numeroVentanilla);
    List<TuVentanilla> findByEstado(String estado);
}
