import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService, UserAccount, Role, Permission } from '../../../core/services/security.service';

@Component({
  selector: 'app-administracion-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-shield-lock-fill me-2"></i>Seguridad y Accesos</h2>
          <p class="text-muted">Administra usuarios, roles y permisos de la plataforma BPM.</p>
        </div>
      </div>

      <div class="row">
        <!-- Pestañas de Gestión -->
        <div class="col-12">
          <ul class="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm">
            <li class="nav-item">
              <button class="nav-link" [class.active]="tabActive === 'users'" (click)="tabActive = 'users'"><i class="bi bi-people me-2"></i>Usuarios</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="tabActive === 'roles'" (click)="tabActive = 'roles'"><i class="bi bi-person-badge me-2"></i>Roles y Permisos</button>
            </li>
          </ul>
        </div>

        <!-- GESTIÓN DE USUARIOS -->
        <div class="col-12" *ngIf="tabActive === 'users'">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 class="mb-0 fw-bold text-dark">Listado de Usuarios</h5>
              <button class="btn btn-primary btn-sm" (click)="nuevoUsuario()">+ Nuevo Usuario</button>
            </div>
            <div class="card-body p-0">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light text-muted small text-uppercase">
                  <tr>
                    <th class="ps-4">Nombre Completo</th>
                    <th>Usuario / Email</th>
                    <th>Roles</th>
                    <th>Estado</th>
                    <th class="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of users">
                    <td class="ps-4 fw-bold">{{ u.fullName }}</td>
                    <td><code>{{ u.username }}</code></td>
                    <td>
                      <span *ngFor="let r of u.roles" class="badge bg-info-subtle text-info border border-info-subtle me-1">{{ r.name }}</span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="u.active ? 'bg-success' : 'bg-danger'">{{ u.active ? 'Activo' : 'Inactivo' }}</span>
                    </td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-primary" (click)="editarUsuario(u)"><i class="bi bi-pencil"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- GESTIÓN DE ROLES -->
        <div class="col-12" *ngIf="tabActive === 'roles'">
          <div class="row">
            <div class="col-md-4">
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <span class="fw-bold">Roles</span>
                  <button class="btn btn-sm btn-outline-primary" (click)="nuevoRole()">+</button>
                </div>
                <div class="list-group list-group-flush">
                  <button *ngFor="let r of roles" 
                          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                          [class.active]="selectedRole?.id === r.id"
                          (click)="seleccionarRole(r)">
                    {{ r.name }}
                    <i class="bi bi-chevron-right small"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-8" *ngIf="selectedRole">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <span class="fw-bold">Permisos para: {{ selectedRole.name }}</span>
                  <button class="btn btn-sm btn-light" (click)="guardarRole()">Guardar</button>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div *ngFor="let p of allPermissions" class="col-md-6">
                      <div class="form-check form-switch p-3 border rounded">
                        <input class="form-check-input" type="checkbox" 
                               [checked]="hasPermission(p)"
                               (change)="togglePermission(p)">
                        <label class="form-check-label ms-2">
                          <div class="fw-bold">{{ p.code }}</div>
                          <div class="small text-muted">{{ p.description }}</div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Usuario -->
      <div class="modal fade show d-block" *ngIf="showUserModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">Gestionar Usuario</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showUserModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label small fw-bold">Nombre Completo</label>
                  <input type="text" class="form-control" [(ngModel)]="currentUser.fullName">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-bold">Email / Username</label>
                  <input type="text" class="form-control" [(ngModel)]="currentUser.username">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-bold">Roles</label>
                  <div class="d-flex flex-wrap gap-2">
                    <div *ngFor="let r of roles" class="form-check border p-2 rounded">
                      <input class="form-check-input ms-0" type="checkbox" 
                             [checked]="userHasRole(r)"
                             (change)="toggleUserRole(r)">
                      <label class="form-check-label ms-1 small">{{ r.name }}</label>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" [(ngModel)]="currentUser.active">
                    <label class="form-check-label">Usuario Activo</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button class="btn btn-primary w-100" (click)="guardarUsuario()">Sincronizar y Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-pills .nav-link { color: #6c757d; font-weight: 500; }
    .nav-pills .nav-link.active { background-color: #0d6efd; color: white; }
    .card { border-radius: 0.75rem; }
    .form-check-input:checked { background-color: #0d6efd; border-color: #0d6efd; }
  `]
})
export class AdministracionSeguridadComponent implements OnInit {
  private securityService = inject(SecurityService);

  tabActive = 'users';
  users: UserAccount[] = [];
  roles: Role[] = [];
  allPermissions: Permission[] = [];
  
  showUserModal = false;
  currentUser: UserAccount = { username: '', fullName: '', active: true, roles: [] };
  selectedRole: Role | null = null;

  ngOnInit() {
    this.cargarTodo();
  }

  cargarTodo() {
    this.securityService.getUsers().subscribe(u => this.users = u);
    this.securityService.getRoles().subscribe(r => this.roles = r);
    this.securityService.getPermissions().subscribe(p => this.allPermissions = p);
  }

  // Métodos Usuario
  nuevoUsuario() {
    this.currentUser = { username: '', fullName: '', active: true, roles: [] };
    this.showUserModal = true;
  }

  editarUsuario(u: UserAccount) {
    this.currentUser = { ...u, roles: [...u.roles] };
    this.showUserModal = true;
  }

  userHasRole(role: Role) {
    return this.currentUser.roles.some(r => r.id === role.id);
  }

  toggleUserRole(role: Role) {
    const idx = this.currentUser.roles.findIndex(r => r.id === role.id);
    if (idx > -1) this.currentUser.roles.splice(idx, 1);
    else this.currentUser.roles.push(role);
  }

  guardarUsuario() {
    this.securityService.saveUser(this.currentUser).subscribe(() => {
      this.showUserModal = false;
      this.cargarTodo();
    });
  }

  // Métodos Roles
  nuevoRole() {
    const name = prompt('Nombre del nuevo Role:');
    if (name) {
      this.securityService.saveRole({ name, permissions: [] }).subscribe(() => this.cargarTodo());
    }
  }

  seleccionarRole(role: Role) {
    this.selectedRole = { ...role, permissions: [...role.permissions] };
  }

  hasPermission(p: Permission) {
    return this.selectedRole?.permissions.some(perm => perm.id === p.id);
  }

  togglePermission(p: Permission) {
    if (!this.selectedRole) return;
    const idx = this.selectedRole.permissions.findIndex(perm => perm.id === p.id);
    if (idx > -1) this.selectedRole.permissions.splice(idx, 1);
    else this.selectedRole.permissions.push(p);
  }

  guardarRole() {
    if (this.selectedRole) {
      this.securityService.saveRole(this.selectedRole).subscribe(() => {
        alert('Permisos actualizados');
        this.cargarTodo();
      });
    }
  }
}
