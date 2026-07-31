package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.ProcessErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessErrorLogRepository extends JpaRepository<ProcessErrorLog, Long> {
    List<ProcessErrorLog> findByProcessInstanceIdOrderByCreatedAtDesc(String processInstanceId);
    List<ProcessErrorLog> findByStatusOrderByCreatedAtDesc(String status);
}
