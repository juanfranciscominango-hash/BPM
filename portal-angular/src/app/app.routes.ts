import { Routes } from '@angular/router';
import { permissionGuard } from './core/guards/permission.guard';
import { MainLayoutComponent } from './features/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { CanLoadGuard } from './core/guards/canload.guard';
import { MsalGuard } from './core/guards/msal.guard';
import { MsalRedirectHandlerComponent } from './features/auth/msal-redirect-handler/msal-redirect-handler.component';
import { PortalCreditoLayoutComponent } from './features/portal-usuario/portal-credito-layout/portal-credito-layout.component';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'turnero/kiosco', loadComponent: () => import('./features/turnero/kiosco/kiosco.component').then(m => m.TurneroKioscoComponent) },
  { path: 'turnero/display', loadComponent: () => import('./features/turnero/display-tv/display-tv.component').then(m => m.TurneroDisplayTvComponent) },
  { 
    path: 'auth/callback', 
    component: MsalRedirectHandlerComponent 
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'turnero/atencion', loadComponent: () => import('./features/turnero/consola-ventanilla/consola-ventanilla.component').then(m => m.TurneroConsolaVentanillaComponent) },
      { path: 'dashboard-hibrido', loadComponent: () => import('./features/dashboard-hibrido/dashboard-hibrido.component').then(m => m.DashboardHibridoComponent) },
      {
        path: 'analytics',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) },
          { path: 'reportes', loadComponent: () => import('./features/analytics/reportes/reportes.component').then(m => m.ReportesComponent) },
          { path: 'metricas', loadComponent: () => import('./features/analytics/metricas/metricas.component').then(m => m.MetricasComponent) }
        ]
      },
      {
        path: 'plataforma',
        canActivateChild: [AuthGuard],
        children: [
          { path: 'entidades', loadComponent: () => import('./features/plataforma/entidades/entidades.component').then(m => m.EntidadesComponent) },
          { path: 'entidades/:id/atributos', loadComponent: () => import('./features/plataforma/atributos/atributos.component').then(m => m.AtributosComponent) },
          { path: 'procesos', loadComponent: () => import('./features/plataforma/procesos/procesos-list.component').then(m => m.ProcesosListComponent) },
          { path: 'tareas', loadComponent: () => import('./features/plataforma/tareas/bandeja-tareas.component').then(m => m.BandejaTareasComponent) },
          { path: 'columnas', loadComponent: () => import('./features/plataforma/columnas/columnas.component').then(m => m.ColumnasComponent) },
          { path: 'conexion', loadComponent: () => import('./features/plataforma/conexion/conexion.component').then(m => m.ConexionComponent) },
          { path: 'monitoreo', loadComponent: () => import('./features/plataforma/monitoreo/monitoreo.component').then(m => m.MonitoreoComponent) },
          { path: 'datos', loadComponent: () => import('./features/plataforma/datos/explorador-datos.component').then(m => m.ExploradorDatosComponent) },
          { path: 'disenador', loadComponent: () => import('./features/plataforma/disenador/disenador.component').then(m => m.DisenadorComponent) },
          { path: 'reglas', loadComponent: () => import('./features/plataforma/reglas/reglas-list.component').then(m => m.ReglasListComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_REGLAS' } },
          { path: 'disenador-reglas/:id', loadComponent: () => import('./features/plataforma/reglas/disenador-reglas.component').then(m => m.DisenadorReglasComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_REGLAS' } },
          { path: 'parametricas', loadComponent: () => import('./features/plataforma/parametricas/parametricas-list.component').then(m => m.ParametricasListComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_PARAMETRICAS' } },
          { path: 'parametricas/:id/datos', loadComponent: () => import('./features/plataforma/parametricas/parametricas-data.component').then(m => m.ParametricasDataComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_PARAMETRICAS' } },
          { path: 'api-manager', loadComponent: () => import('./features/plataforma/api-manager/api-manager.component').then(m => m.ApiManagerComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_APIS' } },
          { path: 'disenador-pantallas', loadComponent: () => import('./features/plataforma/disenador-pantallas/disenador-pantallas.component').then(m => m.DisenadorPantallasComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_PANTALLAS' } },
          { path: 'ejecutor-pantallas', loadComponent: () => import('./features/plataforma/ejecutor-pantallas/ejecutor-pantallas.component').then(m => m.EjecutorPantallasComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_PANTALLAS' } },
          { path: 'formulas', loadComponent: () => import('./features/plataforma/formulas/formulas.component').then(m => m.FormulasComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_REGLAS' } },
          { path: 'disenador-menu', loadComponent: () => import('./features/plataforma/disenador-menu/disenador-menu.component').then(m => m.DisenadorMenuComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_SEGURIDAD' } },
          { path: 'plantillas-documentos', loadComponent: () => import('./features/plataforma/plantillas-documentos/plantillas-documentos.component').then(m => m.PlantillasDocumentosComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_PLANTILLAS' } },
          { path: 'seguridad', loadComponent: () => import('./features/plataforma/seguridad/administracion-seguridad.component').then(m => m.AdministracionSeguridadComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_SEGURIDAD' } },
          { path: 'auditoria', loadComponent: () => import('./features/plataforma/auditoria/auditoria.component').then(m => m.AuditoriaComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_MONITOREO' } },
          { path: 'monitoreo/:id', loadComponent: () => import('./features/plataforma/monitoreo/instancia-monitor.component').then(m => m.InstanciaMonitorComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_MONITOREO' } },
          { path: 'asignacion', loadComponent: () => import('./features/plataforma/asignacion/asignacion.component').then(m => m.AsignacionComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_MONITOREO' } },
          { path: 'sla-config', loadComponent: () => import('./features/plataforma/sla-config/sla-config.component').then(m => m.SlaConfigComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_MONITOREO' } },
          { path: 'variable-schema', loadComponent: () => import('./features/plataforma/variable-schema/variable-schema.component').then(m => m.VariableSchemaComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_REGLAS' } },
          { path: 'reglas-tarea', loadComponent: () => import('./features/plataforma/task-action-rules/task-action-rules.component').then(m => m.TaskActionRulesComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_REGLAS' } },
          {
            path: 'errores-proceso',
            loadComponent: () => import('./features/plataforma/process-errors/process-errors.component').then(m => m.ProcessErrorsComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_MONITOREO' }
          },
          {
            path: 'webhooks',
            loadComponent: () => import('./features/plataforma/webhooks-config/webhooks-config.component').then(m => m.WebhooksConfigComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_REGLAS' }
          },
          {
            path: 'consultas',
            loadComponent: () => import('./features/plataforma/consultas/visor-consultas/visor-consultas').then(m => m.VisorConsultasComponent)
          },
          {
            path: 'disenador-consultas',
            loadComponent: () => import('./features/plataforma/consultas/disenador-consultas/disenador-consultas').then(m => m.DisenadorConsultasComponent)
          }
        ]
      },
      { path: 'usuarios', loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent), canActivate: [RoleGuard], data: { roles: ['admin'] } },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivateChild: [AuthGuard],
        children: [
          { path: '', redirectTo: 'perfil', pathMatch: 'full' },
          { path: 'perfil', loadComponent: () => import('./features/configuracion/perfil/perfil.component').then(m => m.PerfilComponent) }
        ]
      }
    ]
  },
  {
    path: 'portal',
    component: PortalCreditoLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard, permissionGuard],
    data: { permission: 'ACCESO_PORTAL' },
    children: [
      { path: '', redirectTo: 'bandeja', pathMatch: 'full' },
      { path: 'wizard', loadComponent: () => import('./features/portal-usuario/wizard-flujo/wizard-flujo.component').then(m => m.WizardFlujoComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'wizard/:id', loadComponent: () => import('./features/portal-usuario/wizard-flujo/wizard-flujo.component').then(m => m.WizardFlujoComponent), canDeactivate: [pendingChangesGuard] },
      { path: 'bandeja', loadComponent: () => import('./features/portal-usuario/portal-bandeja/portal-bandeja.component').then(m => m.PortalBandejaComponent) },
      { path: 'simulacion', loadComponent: () => import('./features/simulacion/simulacion.component').then(m => m.SimulacionComponent) },
      { path: 'historial', loadComponent: () => import('./features/portal-usuario/portal-historial/portal-historial.component').then(m => m.PortalHistorialComponent) },
      { path: 'resumen/:id', loadComponent: () => import('./features/portal-usuario/resumen-credito/resumen-credito.component').then(m => m.ResumenCreditoComponent) },
      { path: 'crm', loadComponent: () => import('./features/crm/components/prospectos-list.component').then(m => m.ProspectosListComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_CRM' } },
      { path: 'crm/campanas', loadComponent: () => import('./features/crm/components/campanas-list.component').then(m => m.CampanasListComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_CRM' } },
      { path: 'crm/nuevo', loadComponent: () => import('./features/crm/components/prospecto-form.component').then(m => m.ProspectoFormComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_CRM' } },
      { path: 'crm/prospecto/:id', loadComponent: () => import('./features/crm/components/prospecto-detail.component').then(m => m.ProspectoDetailComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_CRM' } }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
