package com.innovacred.bpm.infrastructure.adapter.in.web;

import com.innovacred.bpm.application.service.CrmService;
import com.innovacred.bpm.domain.dto.CountResult;
import com.innovacred.bpm.domain.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crm")
@RequiredArgsConstructor
public class CrmController {

    private final CrmService crmService;

    @GetMapping("/leads")
    public ResponseEntity<List<Lead>> getAllLeads() {
        return ResponseEntity.ok(crmService.getAllLeads());
    }

    @GetMapping("/leads/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable Long id) {
        return ResponseEntity.ok(crmService.getLeadById(id));
    }

    @PostMapping("/leads")
    public ResponseEntity<Lead> createLead(@RequestBody Lead lead) {
        return ResponseEntity.ok(crmService.createLead(lead));
    }

    @PutMapping("/leads/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable Long id, @RequestBody Lead lead) {
        return ResponseEntity.ok(crmService.updateLead(id, lead));
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        crmService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/leads/{id}/interactions")
    public ResponseEntity<List<LeadInteraction>> getInteractions(@PathVariable Long id) {
        return ResponseEntity.ok(crmService.getInteractions(id));
    }

    @PostMapping("/leads/{id}/interactions")
    public ResponseEntity<LeadInteraction> addInteraction(@PathVariable Long id, @RequestBody LeadInteraction interaction) {
        return ResponseEntity.ok(crmService.addInteraction(id, interaction));
    }

    @GetMapping("/leads/{id}/tasks")
    public ResponseEntity<List<LeadTask>> getTasks(@PathVariable Long id) {
        return ResponseEntity.ok(crmService.getTasks(id));
    }

    @PostMapping("/leads/{id}/tasks")
    public ResponseEntity<LeadTask> addTask(@PathVariable Long id, @RequestBody LeadTask task) {
        return ResponseEntity.ok(crmService.addTask(id, task));
    }

    @PutMapping("/tasks/{taskId}/complete")
    public ResponseEntity<LeadTask> completeTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(crmService.completeTask(taskId));
    }

    @GetMapping("/Asesores")
    public ResponseEntity<List<Asesor>> getAsesores() {
        return ResponseEntity.ok(crmService.getActiveAsesores());
    }

    @GetMapping("/debug-asesores")
    public ResponseEntity<Object> getDebugAsesores() {
        return ResponseEntity.ok(crmService.debugUsers());
    }

    @GetMapping("/origenes")
    public ResponseEntity<List<OrigenLead>> getOrigenes() {
        return ResponseEntity.ok(crmService.getActiveOrigenes());
    }

    @GetMapping("/analytics/leads-by-status")
    public ResponseEntity<List<CountResult>> getLeadsByStatus() {
        return ResponseEntity.ok(crmService.getLeadsCountByStatus());
    }

    @GetMapping("/analytics/leads-by-origin")
    public ResponseEntity<List<CountResult>> getLeadsByOrigin() {
        return ResponseEntity.ok(crmService.getLeadsCountByOrigin());
    }

    @GetMapping("/campanas")
    public ResponseEntity<List<Campana>> getCampanas() {
        return ResponseEntity.ok(crmService.getCampanas());
    }

    @PostMapping("/leads/{id}/sync-perfil")
    public ResponseEntity<PerfilFinanciero> syncPerfilFinanciero(@PathVariable Long id) {
        return ResponseEntity.ok(crmService.syncPerfilFinanciero(id));
    }

    @PostMapping("/prospectos/{id}/email")
    public ResponseEntity<Void> enviarEmail(@PathVariable Long id) {
        crmService.enviarEmail(id);
        return ResponseEntity.ok().build();
    }
}

