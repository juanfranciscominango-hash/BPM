package com.innovacred.bpm.infrastructure.adapter.persistence;

import com.innovacred.bpm.domain.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUsername(String username);

    @Query("SELECT u FROM UserAccount u JOIN u.roles r WHERE r.name = :roleName AND u.active = true")
    List<UserAccount> findByRoleNameAndActiveTrue(@Param("roleName") String roleName);
}
