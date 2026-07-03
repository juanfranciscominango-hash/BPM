package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "SEC_USER")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username; // Email o nick
    
    private String password;
    private String fullName;
    private boolean active;
    private String agencia;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "SEC_USER_ROLE",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    // PKI Support
    private String certificateSerialNumber;
    private String certificateIssuer;
}
