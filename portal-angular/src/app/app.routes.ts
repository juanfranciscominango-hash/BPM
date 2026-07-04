import { Routes } from '@angular/router';
import { permissionGuard } from './core/guards/permission.guard';
import { LoginComponent } from './features/login/login.component';
import { MainLayoutComponent } from './features/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DashboardHibridoComponent } from './features/dashboard-hibrido/dashboard-hibrido.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { ReportesComponent } from './features/analytics/reportes/reportes.component';
import { MetricasComponent } from './features/analytics/metricas/metricas.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { ConfiguracionComponent } from './features/configuracion/configuracion.component';
import { PerfilComponent } from './features/configuracion/perfil/perfil.component';
import { SistemaComponent } from './features/configuracion/sistema/sistema.component';
import { AngularComponent } from './features/documentacion/angular/angular.component';
import { EntraIdComponent } from './features/documentacion/entra-id/entra-id.component';
import { ApisComponent } from './features/documentacion/apis/apis.component';
import { RedisComponent } from './features/documentacion/redis/redis.component';
import { WcfComponent } from './features/documentacion/wcf/wcf.component';
import { DocumentacionComponent } from './features/documentacion/documentacion.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { CanLoadGuard } from './core/guards/canload.guard';
import { MsalGuard } from './core/guards/msal.guard';
import { MsalRedirectHandlerComponent } from './features/auth/msal-redirect-handler/msal-redirect-handler.component';
import { EntidadesComponent } from './features/plataforma/entidades/entidades.component';
import { AtributosComponent } from './features/plataforma/atributos/atributos.component';
import { DisenadorComponent } from './features/plataforma/disenador/disenador.component';
import { ProcesosListComponent } from './features/plataforma/procesos/procesos-list.component';
import { PortalCreditoLayoutComponent } from './features/portal-usuario/portal-credito-layout/portal-credito-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
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
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dashboard-hibrido', component: DashboardHibridoComponent },
      {
        path: 'analytics',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', component: AnalyticsComponent },
          { path: 'reportes', component: ReportesComponent },
          { path: 'metricas', component: MetricasComponent }
        ]
      },
      {
        path: 'plataforma',
        canActivateChild: [AuthGuard],
        children: [
          { path: 'entidades', component: EntidadesComponent },
          { path: 'entidades/:id/atributos', component: AtributosComponent },
          { path: 'procesos', component: ProcesosListComponent },
          { path: 'tareas', loadComponent: () => import('./features/plataforma/tareas/bandeja-tareas.component').then(m => m.BandejaTareasComponent) },
          { path: 'columnas', loadComponent: () => import('./features/plataforma/columnas/columnas.component').then(m => m.ColumnasComponent) },
          { path: 'conexion', loadComponent: () => import('./features/plataforma/conexion/conexion.component').then(m => m.ConexionComponent) },
          { path: 'monitoreo', loadComponent: () => import('./features/plataforma/monitoreo/monitoreo.component').then(m => m.MonitoreoComponent) },
          { path: 'datos', loadComponent: () => import('./features/plataforma/datos/explorador-datos.component').then(m => m.ExploradorDatosComponent) },
          { path: 'disenador', component: DisenadorComponent },
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
          { path: 'monitoreo/:id', loadComponent: () => import('./features/plataforma/monitoreo/instancia-monitor.component').then(m => m.InstanciaMonitorComponent), canActivate: [permissionGuard], data: { permission: 'ACCESO_MONITOREO' } }
        ]
      },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
      {
        path: 'configuracion',
        component: ConfiguracionComponent,
        canActivateChild: [AuthGuard],
        children: [
          { path: '', redirectTo: 'perfil', pathMatch: 'full' },
          { path: 'perfil', component: PerfilComponent },
          { path: 'sistema', component: SistemaComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } }
        ]
      },
      {
        path: 'documentacion',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', component: DocumentacionComponent },
          { path: 'angular', component: AngularComponent },
          { path: 'entra-id', component: EntraIdComponent },
          { path: 'apis', component: ApisComponent },
          { path: 'redis', component: RedisComponent },
          { path: 'wcf', component: WcfComponent }
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
      { path: 'wizard', loadComponent: () => import('./features/portal-usuario/wizard-flujo/wizard-flujo.component').then(m => m.WizardFlujoComponent) },
      { path: 'wizard/:id', loadComponent: () => import('./features/portal-usuario/wizard-flujo/wizard-flujo.component').then(m => m.WizardFlujoComponent) },
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
