package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ExternalProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExternalProcessRepository extends JpaRepository<ExternalProcess, Long> {
    Optional<ExternalProcess> findByCode(String code);
}
