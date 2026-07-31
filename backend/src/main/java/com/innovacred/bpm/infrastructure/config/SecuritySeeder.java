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

        // 3. Crear Menú Dinámico Organizado por Afinidad
        initializeMenu();
        
        System.out.println("✅ Seguridad y Menú validados.");
    }

    private void initializeMenu() {
        boolean hasOldPlataforma = menuRepository.findAll().stream()
                .anyMatch(m -> "Plataforma".equalsIgnoreCase(m.getTitle()));

        if (menuRepository.count() == 0 || hasOldPlataforma) {
            if (hasOldPlataforma) {
                menuRepository.deleteAll();
            }

            // 1. Accesos Directos
            createMenuItem("Dashboard", "bi bi-grid", "/dashboard", null, 0, null);
            createMenuItem("Portal Asesor", "bi bi-person-workspace", "/portal/bandeja", null, 1, null);

            // 2. Operación Diaria
            Menu operacion = createMenuItem("Operación Diaria", "bi bi-kanban", null, null, 2, null);
            createMenuItem("Bandeja de Tareas", "bi bi-inbox", "/plataforma/tareas", null, 1, operacion);
            createMenuItem("Monitoreo de Instancias", "bi bi-activity", "/plataforma/monitoreo", "ACCESO_MONITOREO", 2, operacion);
            createMenuItem("Explorador de Datos", "bi bi-search", "/plataforma/datos", null, 3, operacion);
            createMenuItem("Configuración SLAs", "bi bi-clock-history", "/plataforma/sla-config", "ACCESO_MONITOREO", 4, operacion);

            // 3. Diseño & Desarrollo
            Menu diseno = createMenuItem("Diseño & Desarrollo", "bi bi-palette", null, null, 3, null);
            createMenuItem("Diseñador de Flujos", "bi bi-diagram-2", "/plataforma/disenador", null, 1, diseno);
            createMenuItem("Diseñador Pantallas", "bi bi-window", "/plataforma/disenador-pantallas", "ACCESO_PANTALLAS", 2, diseno);
            createMenuItem("Ejecutor Pantallas", "bi bi-play-circle", "/plataforma/ejecutor-pantallas", "ACCESO_PANTALLAS", 3, diseno);
            createMenuItem("Plantillas Documentos", "bi bi-file-earmark", "/plataforma/plantillas-documentos", "ACCESO_PLANTILLAS", 4, diseno);
            createMenuItem("Diseñador de Menú", "bi bi-list-nested", "/plataforma/disenador-menu", "ACCESO_SEGURIDAD", 5, diseno);

            // 4. Motor de Reglas & Lógica
            Menu reglas = createMenuItem("Motor de Reglas & Lógica", "bi bi-diagram-3", null, null, 4, null);
            createMenuItem("Gestión de Reglas", "bi bi-diagram-3", "/plataforma/reglas", "ACCESO_REGLAS", 1, reglas);
            createMenuItem("Reglas de Tarea", "bi bi-code-square", "/plataforma/reglas-tarea", "ACCESO_REGLAS", 2, reglas);
            createMenuItem("Módulo de Fórmulas", "bi bi-calculator", "/plataforma/formulas", "ACCESO_REGLAS", 3, reglas);
            createMenuItem("Esquema de Variables", "bi bi-diagram-2", "/plataforma/variable-schema", "ACCESO_REGLAS", 4, reglas);
            createMenuItem("Tablas Paramétricas", "bi bi-table", "/plataforma/parametricas", "ACCESO_PARAMETRICAS", 5, reglas);

            // 5. Integración & Datos
            Menu integracion = createMenuItem("Integración & Datos", "bi bi-cpu", null, null, 5, null);
            createMenuItem("Conectores de API", "bi bi-plug", "/plataforma/api-manager", "ACCESO_APIS", 1, integracion);
            createMenuItem("Config. Webhooks", "bi bi-diagram-3", "/plataforma/webhooks", "ACCESO_REGLAS", 2, integracion);
            createMenuItem("Entidades", "bi bi-database", "/plataforma/entidades", null, 3, integracion);
            createMenuItem("Conexión de Base de Datos", "bi bi-database-fill-gear", "/plataforma/conexion", "ACCESO_SEGURIDAD", 4, integracion);
            createMenuItem("Configuración de Columnas", "bi bi-grid-3x3-gap", "/plataforma/columnas", null, 5, integracion);

            // 6. Gestión de Turnos
            Menu turnero = createMenuItem("Gestión de Turnos", "bi bi-ticket-detailed-fill", null, null, 6, null);
            createMenuItem("Consola de Ventanilla", "bi bi-headset", "/turnero/atencion", null, 1, turnero);
            createMenuItem("Kiosco Autoservicio", "bi bi-printer-fill", "/turnero/kiosco", null, 2, turnero);
            createMenuItem("Display TV de Sala", "bi bi-tv-fill", "/turnero/display", null, 3, turnero);
            createMenuItem("Asignación de Tareas", "bi bi-people-fill", "/plataforma/asignacion", "ACCESO_MONITOREO", 4, turnero);

            // 7. Gobierno & Administración
            Menu gobierno = createMenuItem("Gobierno & Administración", "bi bi-shield-check", null, null, 7, null);
            createMenuItem("Gestión de Procesos", "bi bi-gear", "/plataforma/procesos", null, 1, gobierno);
            createMenuItem("Seguridad y Roles", "bi bi-shield-lock", "/plataforma/seguridad", "ACCESO_SEGURIDAD", 2, gobierno);
            createMenuItem("Auditoría de Sistema", "bi bi-shield-check", "/plataforma/auditoria", "ACCESO_MONITOREO", 3, gobierno);
            createMenuItem("Errores de Proceso", "bi bi-bug", "/plataforma/errores-proceso", "ACCESO_MONITOREO", 4, gobierno);

            System.out.println("✅ Menú principal reorganizado por afinidad exitosamente.");
        }
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
