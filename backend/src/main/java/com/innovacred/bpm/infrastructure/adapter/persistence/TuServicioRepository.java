package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.TuServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TuServicioRepository extends JpaRepository<TuServicio, Long> {
    Optional<TuServicio> findByCodigo(String codigo);
    List<TuServicio> findByActivoTrueOrderByPrioridadAsc();
}
