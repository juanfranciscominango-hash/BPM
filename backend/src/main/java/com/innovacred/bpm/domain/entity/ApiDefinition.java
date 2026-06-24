package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "API_DEFINITION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String url;
    private String method; // GET, POST, PUT, DELETE
    
    @Column(columnDefinition = "TEXT")
    private String headersJson; // JSON con cabeceras por defecto
    
    @Column(columnDefinition = "TEXT")
    private String bodyTemplate; // Template para el body en POST/PUT
    
    private String responseMapping; // JSON mapping para guardar variables
}
