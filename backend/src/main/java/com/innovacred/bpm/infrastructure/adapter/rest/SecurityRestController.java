package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.SecurityService;
import com.innovacred.bpm.domain.entity.Permission;
import com.innovacred.bpm.domain.entity.Role;
import com.innovacred.bpm.domain.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/security")
@RequiredArgsConstructor
public class SecurityRestController {

    private final SecurityService securityService;

    @GetMapping("/users")
    public List<UserAccount> getUsers() { return securityService.listUsers(); }

    @PostMapping("/users")
    public UserAccount saveUser(@RequestBody UserAccount user) { return securityService.saveUser(user); }

    @GetMapping("/roles")
    public List<Role> getRoles() { return securityService.listRoles(); }

    @PostMapping("/roles")
    public Role saveRole(@RequestBody Role role) { return securityService.saveRole(role); }

    @GetMapping("/permissions")
    public List<Permission> getPermissions() { return securityService.listPermissions(); }
}
