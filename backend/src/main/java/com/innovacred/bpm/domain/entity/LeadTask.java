package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "crm_lead_task")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeadTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fechaVencimiento;

    @Column(nullable = false)
    private Boolean completada = false;

    @Column(length = 255)
    private String externalCalendarEventId; // ID del evento en Google Calendar / Outlook

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

