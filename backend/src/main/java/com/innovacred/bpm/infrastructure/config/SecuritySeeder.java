package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.Permission;
import com.innovacred.bpm.domain.entity.Role;
import com.innovacred.bpm.domain.entity.UserAccount;
import com.innovacred.bpm.domain.entity.Menu;
import com.innovacred.bpm.infrastructure.adapter.persistence.PermissionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.RoleRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.MenuRepository;
import com.innovacred.bpm.application.service.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SecuritySeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserAccountRepository userRepository;
    private final MenuRepository menuRepository;
    private final SecurityService securityService;

    @Override
    public void run(String... args) throws Exception {
        // 1. Crear Permisos (si no existen)
        if (permissionRepository.count() == 0) {
            initializePermissions();
        }

        // 2. Asegurar Roles y Usuario Admin
        initializeSecurity();

        // 3. Crear Menú Dinámico (si no existe)
        initializeMenu();
        
        // Asegurar que el nuevo ejecutor de pantallas exista (para actualizaciones)
        ensureEjecutorPantallas();
        ensureDisenadorMenu();
        
        System.out.println("✅ Seguridad y Menú validados.");
    }

    private void ensureDisenadorMenu() {
        boolean exists = menuRepository.findAll().stream().anyMatch(m -> "/plataforma/disenador-menu".equals(m.getRoute()));
        if (!exists) {
            Menu plataforma = menuRepository.findAll().stream().filter(m -> "Plataforma".equals(m.getTitle())).findFirst().orElse(null);
            if (plataforma != null) {
                createMenuItem("Diseñador de Menú", "bi bi-list-nested", "/plataforma/disenador-menu", "ACCESO_SEGURIDAD", 13, plataforma);
                System.out.println("✅ Menú Diseñador de Menú insertado dinámicamente.");
            }
        }
    }

    private void ensureEjecutorPantallas() {
        boolean exists = menuRepository.findAll().stream().anyMatch(m -> "/plataforma/ejecutor-pantallas".equals(m.getRoute()));
        if (!exists) {
            Menu plataforma = menuRepository.findAll().stream().filter(m -> "Plataforma".equals(m.getTitle())).findFirst().orElse(null);
            if (plataforma != null) {
                createMenuItem("Ejecutor Pantallas", "bi bi-play-circle", "/plataforma/ejecutor-pantallas", "ACCESO_PANTALLAS", 10, plataforma);
                System.out.println("✅ Menú Ejecutor Pantallas insertado dinámicamente.");
            }
        }
    }

    private void initializePermissions() {
        createPerm("ACCESO_REGLAS", "Gestión de Reglas de Negocio (DMN)");
        createPerm("ACCESO_PARAMETRICAS", "Mantenimiento de Tablas Paramétricas");
        createPerm("ACCESO_APIS", "Configuración de Conectores de API");
        createPerm("ACCESO_PANTALLAS", "Diseño de Pantallas Dinámicas");
        createPerm("ACCESO_PLANTILLAS", "Gestión de Plantillas Documentales");
        createPerm("ACCESO_SEGURIDAD", "Administración de Usuarios y Roles");
        createPerm("ACCESO_MONITOREO", "Monitoreo de Instancias y Auditoría");
    }

    private void initializeSecurity() {
        Permission pReglas = permissionRepository.findByCode("ACCESO_REGLAS").get();
        Permission pParam = permissionRepository.findByCode("ACCESO_PARAMETRICAS").get();
        Permission pApis = permissionRepository.findByCode("ACCESO_APIS").get();
        Permission pPant = permissionRepository.findByCode("ACCESO_PANTALLAS").get();
        Permission pDoc = permissionRepository.findByCode("ACCESO_PLANTILLAS").get();
        Permission pSeg = permissionRepository.findByCode("ACCESO_SEGURIDAD").get();
        Permission pMon = permissionRepository.findByCode("ACCESO_MONITOREO").get();

        Role adminRole = ensureRole("ADMINISTRADOR", new HashSet<>(List.of(pReglas, pParam, pApis, pPant, pDoc, pSeg, pMon)));
        ensureRole("ASESOR_CREDITO", new HashSet<>()); // Solo acceso básico a bandejas
        ensureRole("ANALISTA_RIESGO", new HashSet<>(List.of(pReglas, pParam)));
        ensureRole("COMITE_CREDITO", new HashSet<>(List.of(pMon)));
        ensureRole("OPERACIONES", new HashSet<>(List.of(pDoc)));
        ensureRole("GERENTE_SUCURSAL", new HashSet<>(List.of(pMon, pParam)));

        if (!userRepository.findAll().stream().anyMatch(u -> "admin@chibuleo.com".equals(u.getUsername()))) {
            UserAccount adminUser = UserAccount.builder()
                    .username("admin@chibuleo.com")
                    .password("admin123")
                    .fullName("Administrador del Sistema")
                    .active(true)
                    .roles(new HashSet<>(List.of(adminRole)))
                    .build();
            securityService.saveUser(adminUser);
        }
    }

    private Role ensureRole(String name, Set<Permission> perms) {
        return roleRepository.findAll().stream()
                .filter(r -> name.equals(r.getName()))
                .findFirst()
                .orElseGet(() -> roleRepository.save(Role.builder().name(name).permissions(perms).build()));
    }

    private void initializeMenu() {
        if (menuRepository.count() > 0) return;

        createMenuItem("Dashboard", "bi bi-grid", "/dashboard", null, 0, null);
        
        Menu plataforma = createMenuItem("Plataforma", "bi bi-stack", null, null, 1, null);
        createMenuItem("Entidades", "bi bi-database", "/plataforma/entidades", null, 0, plataforma);
        createMenuItem("Gestión de Procesos", "bi bi-gear", "/plataforma/procesos", null, 1, plataforma);
        createMenuItem("Bandeja de Tareas", "bi bi-inbox", "/plataforma/tareas", null, 2, plataforma);
        createMenuItem("Monitoreo de Instancias", "bi bi-activity", "/plataforma/monitoreo", "ACCESO_MONITOREO", 3, plataforma);
        createMenuItem("Explorador de Datos", "bi bi-search", "/plataforma/datos", null, 4, plataforma);
        createMenuItem("Diseñador de Flujos", "bi bi-diagram-2", "/plataforma/disenador", null, 5, plataforma);
        
        // Módulos avanzados (con permisos)
        createMenuItem("Gestión de Reglas", "bi bi-diagram-3", "/plataforma/reglas", "ACCESO_REGLAS", 6, plataforma);
        createMenuItem("Tablas Paramétricas", "bi bi-table", "/plataforma/parametricas", "ACCESO_PARAMETRICAS", 7, plataforma);
        createMenuItem("Conectores de API", "bi bi-plug", "/plataforma/api-manager", "ACCESO_APIS", 8, plataforma);
        createMenuItem("Diseñador Pantallas", "bi bi-window", "/plataforma/disenador-pantallas", "ACCESO_PANTALLAS", 9, plataforma);
        createMenuItem("Ejecutor Pantallas", "bi bi-play-circle", "/plataforma/ejecutor-pantallas", "ACCESO_PANTALLAS", 10, plataforma);
        createMenuItem("Plantillas Documentos", "bi bi-file-earmark", "/plataforma/plantillas-documentos", "ACCESO_PLANTILLAS", 11, plataforma);
        createMenuItem("Seguridad y Roles", "bi bi-shield-lock", "/plataforma/seguridad", "ACCESO_SEGURIDAD", 12, plataforma);
    }

    private Menu createMenuItem(String title, String icon, String route, String perm, int order, Menu parent) {
        return menuRepository.save(Menu.builder()
                .title(title).icon(icon).route(route).permissionCode(perm)
                .sortOrder(order).parent(parent).active(true).build());
    }

    private Permission createPerm(String code, String desc) {
        return permissionRepository.save(Permission.builder().code(code).description(desc).build());
    }
}
