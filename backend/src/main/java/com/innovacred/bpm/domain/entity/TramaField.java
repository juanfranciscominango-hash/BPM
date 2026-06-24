package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TRAMA_FIELD")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TramaField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "process_id", nullable = false)
    private Long processId;
    
    @Column(name = "trama_type", nullable = false)
    private String tramaType; // INPUT, OUTPUT
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "parent_id")
    private Long parentId;
    
    private String defaultAssignment; // ASIGNAR SIEMPRE, etc.
    private String defaultValue;
    
    @Column(name = "select_query", columnDefinition = "TEXT")
    private String selectQuery;
    
    private String maxOccurrenceAction; // NO NECESITA, etc.
    private Integer maxOccurrenceNumber;
    
    private String minOccurrenceAction; // NO NECESITA, etc.
    private Integer minOccurrenceNumber;
    
    private Boolean encodeSpecialChars;
    private Boolean includeCdata;
    private Boolean transformBase64;
    private Boolean omitIfNull;
}
