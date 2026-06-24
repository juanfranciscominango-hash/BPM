package com.innovacred.bpm.application.service.email;

import com.innovacred.bpm.domain.entity.Lead;

public interface EmailSenderService {
    String getProviderName();
    void sendStatusChangeEmail(Lead lead, String newStatus);
}
