package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.SecurityService;
import com.innovacred.bpm.domain.entity.Permission;
import com.innovacred.bpm.domain.entity.Role;
import com.innovacred.bpm.domain.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.innovacred.bpm.infrastructure.aspect.Auditable;
import java.util.List;

@RestController
@RequestMapping("/security")
@RequiredArgsConstructor
public class SecurityRestController {

    private final SecurityService securityService;

    @GetMapping("/users")
    public List<UserAccount> getUsers() { return securityService.listUsers(); }

    @PostMapping("/users")
    @Auditable(accion = "GUARDAR_USUARIO", entidad = "Usuario")
    public UserAccount saveUser(@RequestBody UserAccount user) { return securityService.saveUser(user); }

    public record UserTransferRequest(Long userId, String newAgencia, String backupUsername) {}

    @PostMapping("/users/transfer")
    @Auditable(accion = "TRANSFERIR_USUARIOS_AGENCIA", entidad = "Usuario")
    public void transferUser(@RequestBody UserTransferRequest request) {
        securityService.transferUser(request.userId(), request.newAgencia(), request.backupUsername());
    }

    @GetMapping("/roles")
    public List<Role> getRoles() { return securityService.listRoles(); }

    @PostMapping("/roles")
    @Auditable(accion = "GUARDAR_ROL", entidad = "Rol")
    public Role saveRole(@RequestBody Role role) { return securityService.saveRole(role); }

    @GetMapping("/permissions")
    public List<Permission> getPermissions() { return securityService.listPermissions(); }
}
