package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.WebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookConfigRepository extends JpaRepository<WebhookConfig, Long> {
    List<WebhookConfig> findByProcessDefinitionKeyAndActiveTrue(String processDefinitionKey);
    List<WebhookConfig> findByActiveTrue();
}
