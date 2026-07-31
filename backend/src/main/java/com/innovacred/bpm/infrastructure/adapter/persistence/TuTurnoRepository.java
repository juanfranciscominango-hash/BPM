package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.TuTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TuTurnoRepository extends JpaRepository<TuTurno, Long> {

    @Query("SELECT MAX(t.secuencia) FROM TuTurno t WHERE t.servicio.codigo = :codigoServicio AND t.fechaEmision >= :inicioDia")
    Integer findMaxSecuenciaHoy(@Param("codigoServicio") String codigoServicio, @Param("inicioDia") LocalDateTime inicioDia);

    @Query("SELECT t FROM TuTurno t WHERE t.estado IN ('EMITIDO', 'EN_ESPERA') ORDER BY t.servicio.prioridad ASC, t.fechaEmision ASC")
    List<TuTurno> findTurnosEnColaProximo();

    @Query("SELECT t FROM TuTurno t WHERE t.servicio.codigo = :codigoServicio AND t.estado IN ('EMITIDO', 'EN_ESPERA') ORDER BY t.servicio.prioridad ASC, t.fechaEmision ASC")
    List<TuTurno> findTurnosEnColaPorServicio(@Param("codigoServicio") String codigoServicio);

    List<TuTurno> findTop5ByEstadoInOrderByFechaLlamadoDesc(List<String> estados);

    Optional<TuTurno> findFirstByEstadoOrderByFechaLlamadoDesc(String estado);
}
