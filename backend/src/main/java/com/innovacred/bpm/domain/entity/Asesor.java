package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "crm_Asesor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asesor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombreCompleto;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false)
    private Boolean activo = true;
}

