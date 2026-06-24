package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "crm_lead_interaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeadInteraction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false, length = 50)
    private String tipo; // LLAMADA, EMAIL, WHATSAPP, REUNION

    @Column(columnDefinition = "TEXT")
    private String resumen;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fecha;
}

