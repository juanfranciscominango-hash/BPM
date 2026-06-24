package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.domain.entity.Notification;
import com.innovacred.bpm.infrastructure.adapter.persistence.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationRestController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/user/{username}")
    public List<Notification> getByUser(@PathVariable String username, @RequestParam(defaultValue = "false") boolean onlyUnread) {
        if (onlyUnread) {
            return notificationRepository.findByTargetUserAndIsReadFalseOrderByCreatedAtDesc(username);
        }
        return notificationRepository.findByTargetUserOrderByCreatedAtDesc(username);
    }

    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return notificationRepository.save(notification);
    }
}
