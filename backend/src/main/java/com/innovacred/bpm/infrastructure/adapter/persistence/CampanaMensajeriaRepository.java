package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.CampanaMensajeria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampanaMensajeriaRepository extends JpaRepository<CampanaMensajeria, Long> {

    Optional<CampanaMensajeria> findByProcessInstanceId(String processInstanceId);

    List<CampanaMensajeria> findByEstadoOrderByFechaCreacionDesc(String estado);

    List<CampanaMensajeria> findByResponsableOrderByFechaCreacionDesc(String responsable);
}
