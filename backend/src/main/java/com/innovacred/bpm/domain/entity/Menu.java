package com.innovacred.bpm.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "SEC_MENU")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String icon;
    private String route;
    private String permissionCode; // Si es null, es público
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Menu parent;
    
    @Transient
    private Long parentId;

    public Long getParentId() {
        if (this.parentId != null) return this.parentId;
        return (this.parent != null) ? this.parent.getId() : null;
    }
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<Menu> children;
    
    private int sortOrder;
    private boolean active;
}
