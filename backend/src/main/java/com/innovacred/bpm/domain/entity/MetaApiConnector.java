package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "META_API_CONNECTOR")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MetaApiConnector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String url;
    private String method; // GET, POST, PUT, DELETE
    
    @Column(columnDefinition = "TEXT")
    private String headers; // JSON String
    
    @Column(columnDefinition = "TEXT")
    private String bodyTemplate; // JSON/Text with placeholders
}
