package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.Permission;
import com.innovacred.bpm.domain.entity.Role;
import com.innovacred.bpm.domain.entity.UserAccount;
import com.innovacred.bpm.infrastructure.adapter.persistence.PermissionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.RoleRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.flowable.idm.api.IdmIdentityService;
import org.flowable.idm.api.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SecurityService {

    private final UserAccountRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final IdmIdentityService identityService;

    @Transactional
    public UserAccount saveUser(UserAccount user) {
        UserAccount saved = userRepository.save(user);
        syncWithFlowable(saved);
        return saved;
    }

    public List<Role> listRoles() { return roleRepository.findAll(); }
    public List<Permission> listPermissions() { return permissionRepository.findAll(); }
    public List<UserAccount> listUsers() { return userRepository.findAll(); }

    @Transactional
    public Role saveRole(Role role) { return roleRepository.save(role); }

    /**
     * Sincroniza el usuario local con el Identity Manager de Flowable
     */
    private void syncWithFlowable(UserAccount localUser) {
        User flowUser = identityService.createUserQuery().userId(localUser.getUsername()).singleResult();
        if (flowUser == null) {
            flowUser = identityService.newUser(localUser.getUsername());
        }
        flowUser.setFirstName(localUser.getFullName());
        flowUser.setPassword(localUser.getPassword());
        identityService.saveUser(flowUser);

        // Mapear Roles a Grupos de Flowable
        localUser.getRoles().forEach(role -> {
            if (identityService.createGroupQuery().groupId(role.getName()).singleResult() == null) {
                identityService.saveGroup(identityService.newGroup(role.getName()));
            }
            if (identityService.createGroupQuery().groupMember(localUser.getUsername()).groupId(role.getName()).singleResult() == null) {
                identityService.createMembership(localUser.getUsername(), role.getName());
            }
        });
    }
}
