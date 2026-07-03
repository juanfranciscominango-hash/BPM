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
import org.flowable.task.api.Task;
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
    private final org.flowable.engine.TaskService taskService;

    @Transactional
    public UserAccount saveUser(UserAccount user) {
        if (user.getId() != null) {
            UserAccount existing = userRepository.findById(user.getId()).orElse(null);
            if (existing != null && (user.getPassword() == null || user.getPassword().trim().isEmpty())) {
                user.setPassword(existing.getPassword());
            }
        }
        UserAccount saved = userRepository.save(user);
        syncWithFlowable(saved);
        return saved;
    }

    public List<Role> listRoles() { return roleRepository.findAll(); }
    public List<Permission> listPermissions() { return permissionRepository.findAll(); }
    public List<UserAccount> listUsers() { return userRepository.findAll(); }

    @Transactional
    public void transferUser(Long userId, String newAgencia, String backupUsername) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        // Reassign active tasks in Flowable to the backup user
        if (backupUsername != null && !backupUsername.trim().isEmpty()) {
            List<Task> activeTasks = taskService.createTaskQuery().taskAssignee(user.getUsername()).list();
            for (Task task : activeTasks) {
                taskService.setAssignee(task.getId(), backupUsername);
            }
        }
        
        user.setAgencia(newAgencia);
        userRepository.save(user);
    }

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
