package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "SEC_ROLE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name; // Ej: ADMINISTRADOR, ANALISTA
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "SEC_ROLE_PERMISSION",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions;
}
