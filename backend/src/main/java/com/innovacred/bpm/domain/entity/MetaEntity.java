package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "META_ENTITY")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MetaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String label;
    private String description;
}
