package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetUserOrderByCreatedAtDesc(String targetUser);
    List<Notification> findByTargetUserAndIsReadFalseOrderByCreatedAtDesc(String targetUser);
}
