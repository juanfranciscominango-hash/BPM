package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ProcessErrorService;
import com.innovacred.bpm.domain.entity.ProcessErrorLog;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/process-errors")
@RequiredArgsConstructor
public class ProcessErrorRestController {

    private final ProcessErrorService errorService;

    @GetMapping("/instance/{instanceId}")
    public List<ProcessErrorLog> getByInstance(@PathVariable String instanceId) {
        return errorService.getErrorsByInstance(instanceId);
    }

    @GetMapping("/pending")
    public List<ProcessErrorLog> getPending() {
        return errorService.getPendingErrors();
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<ProcessErrorLog> retryError(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "system");
        try {
            return ResponseEntity.ok(errorService.retryError(id, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<ProcessErrorLog> resolveError(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "system");
        String notes = body.getOrDefault("notes", "");
        try {
            return ResponseEntity.ok(errorService.resolveError(id, username, notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/ignore")
    public ResponseEntity<ProcessErrorLog> ignoreError(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "system");
        String notes = body.getOrDefault("notes", "");
        try {
            return ResponseEntity.ok(errorService.ignoreError(id, username, notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
