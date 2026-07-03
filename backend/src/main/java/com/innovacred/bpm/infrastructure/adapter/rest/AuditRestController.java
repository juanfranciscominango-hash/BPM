package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.domain.entity.AuditLog;
import com.innovacred.bpm.infrastructure.adapter.persistence.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditRestController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public List<AuditLog> getLogs() {
        return auditLogRepository.findAllByOrderByFechaHoraDesc();
    }
}
