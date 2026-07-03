package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SEC_AUDIT_LOG")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
    
    @Column(nullable = false)
    private String usuario;
    
    @Column(nullable = false)
    private String accion;
    
    @Column(name = "nombre_entidad")
    private String nombreEntidad;
    
    @Column(name = "id_entidad")
    private String idEntidad;
    
    @Column(name = "direccion_ip")
    private String direccionIp;
    
    @Column(columnDefinition = "TEXT")
    private String detalles;
    
    @Column(nullable = false)
    private String estado;
}
