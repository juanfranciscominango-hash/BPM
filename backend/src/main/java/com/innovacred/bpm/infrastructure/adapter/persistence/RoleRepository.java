package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
