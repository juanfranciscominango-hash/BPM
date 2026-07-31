import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ProcessService, ProcessDefinition } from '../../../core/services/process.service';
import { SecurityService, Role } from '../../../core/services/security.service';
import Swal from 'sweetalert2';

interface TaskAllocationRule {
  id?: number;
  processDefinitionKey: string;
  taskDefinitionKey: string;
  allocationMethod: string; // EVERYONE, LEAST_LOADED, ROUND_ROBIN, SPECIFIC
  candidateGroup?: string;
  specificExpression?: string;
  active: boolean;
  taskName?: string;
}

interface TaskDefinition {
  key: string;
  name: string;
}

@Component({
  selector: 'app-asignacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container-fluid p-4" style="max-width: 100%; overflow: hidden;">
      <!-- Encabezado de página -->
      <div class="d-flex justify-content-between align-items-center mb-4 pe-5">
        <div>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
              <li class="breadcrumb-item"><a routerLink="/dashboard">Plataforma</a></li>
              <li class="breadcrumb-item active">Asignación de Tareas</li>
            </ol>
          </nav>
          <h2 class="h3 mb-0 text-primary fw-bold">
            <i class="bi bi-people-fill me-2"></i>Asignación de Trabajo (Work Allocation)
          </h2>
          <p class="text-muted mb-0">Configura reglas inteligentes de asignación y enrutamiento automático de tareas.</p>
        </div>
        <button *ngIf="viewMode === 'list'" class="btn btn-primary shadow-sm" (click)="abrirNuevo()" style="margin-right: 15rem;">
          <i class="bi bi-plus-lg me-1"></i>Nueva Regla
        </button>
      </div>

      <!-- VISTA LISTADO -->
      <div class="card border-0 shadow-sm" *ngIf="viewMode === 'list'">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-4">Proceso</th>
                  <th>Tarea</th>
                  <th>Método de Asignación</th>
                  <th>Rol Destinatario / Expresión</th>
                  <th>Estado</th>
                  <th class="text-center" style="width: 120px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rule of rules">
                  <td class="ps-4">
                    <span class="fw-semibold text-dark">{{ getProcessName(rule.processDefinitionKey) }}</span>
                    <br>
                    <small class="text-muted">{{ rule.processDefinitionKey }}</small>
                  </td>
                  <td>
                    <span class="fw-semibold text-primary">{{ rule.taskName || rule.taskDefinitionKey }}</span>
                    <br *ngIf="rule.taskName">
                    <small *ngIf="rule.taskName" class="text-muted">{{ rule.taskDefinitionKey }}</small>
                  </td>
                  <td>
                    <span class="badge rounded-pill" [ngClass]="getMethodClass(rule.allocationMethod)">
                      {{ getMethodLabel(rule.allocationMethod) }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="rule.allocationMethod !== 'SPECIFIC'" class="badge bg-light text-dark border">
                      {{ rule.candidateGroup || 'Sin Rol' }}
                    </span>
                    <code *ngIf="rule.allocationMethod === 'SPECIFIC'" class="text-danger fw-bold">
                      \${{ rule.specificExpression }}
                    </code>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="rule.active ? 'bg-success' : 'bg-secondary'">
                      {{ rule.active ? 'ACTIVO' : 'INACTIVO' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-link text-primary p-0 me-3" (click)="editarRegla(rule)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-danger p-0" (click)="eliminarRegla(rule.id)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="rules.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-info-circle fs-3 d-block mb-2"></i>
                    No hay reglas de asignación configuradas. Las tareas se asignarán de forma grupal por defecto.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- VISTA FORMULARIO -->
      <div class="card border-0 shadow-sm" *ngIf="viewMode === 'form'" style="max-width: 800px;">
        <div class="card-header bg-primary text-white py-3">
          <h5 class="card-title mb-0 fw-bold">
            {{ isEditing ? 'Editar Regla de Asignación' : 'Nueva Regla de Asignación' }}
          </h5>
        </div>
        <div class="card-body p-4">
          <form #ruleForm="ngForm" (ngSubmit)="guardarRegla()">
            
            <!-- Selector de Proceso -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Proceso BPMN</label>
              <select class="form-select" [(ngModel)]="currentRule.processDefinitionKey" name="processKey" (change)="onProcessChange()" required [disabled]="isEditing">
                <option value="">-- Seleccionar Proceso --</option>
                <option *ngFor="let proc of processes" [value]="proc.key">{{ proc.name }}</option>
              </select>
            </div>

            <!-- Selector de Tarea -->
            <div class="mb-3" *ngIf="currentRule.processDefinitionKey">
              <label class="form-label fw-semibold">Tarea de Usuario (User Task)</label>
              <select class="form-select" [(ngModel)]="currentRule.taskDefinitionKey" name="taskKey" required [disabled]="isEditing">
                <option value="">-- Seleccionar Tarea --</option>
                <option *ngFor="let task of tasks" [value]="task.key">{{ task.name }} ({{ task.key }})</option>
              </select>
            </div>

            <!-- Selector de Metodología de Asignación -->
            <div class="mb-3" *ngIf="currentRule.taskDefinitionKey">
              <label class="form-label fw-semibold">Método de Asignación (Regla de Reparto)</label>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="card p-3 border h-100 cursor-pointer" [class.border-primary]="currentRule.allocationMethod === 'EVERYONE'" (click)="setMethod('EVERYONE')">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="method" id="mEveryone" value="EVERYONE" [(ngModel)]="currentRule.allocationMethod">
                      <label class="form-check-label fw-bold" for="mEveryone">Todos (Cola Grupal)</label>
                    </div>
                    <small class="text-muted d-block mt-2">Cualquier analista del rol asignado puede tomar y realizar la tarea.</small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card p-3 border h-100 cursor-pointer" [class.border-primary]="currentRule.allocationMethod === 'LEAST_LOADED'" (click)="setMethod('LEAST_LOADED')">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="method" id="mLeastLoaded" value="LEAST_LOADED" [(ngModel)]="currentRule.allocationMethod">
                      <label class="form-check-label fw-bold" for="mLeastLoaded">Por Carga (Balanceo)</label>
                    </div>
                    <small class="text-muted d-block mt-2">Asigna automáticamente la tarea al usuario del rol con menos casos activos.</small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card p-3 border h-100 cursor-pointer" [class.border-primary]="currentRule.allocationMethod === 'ROUND_ROBIN'" (click)="setMethod('ROUND_ROBIN')">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="method" id="mRoundRobin" value="ROUND_ROBIN" [(ngModel)]="currentRule.allocationMethod">
                      <label class="form-check-label fw-bold" for="mRoundRobin">Por Rotación (Secuencial)</label>
                    </div>
                    <small class="text-muted d-block mt-2">Distribuye las tareas de forma rotativa secuencial entre los analistas del rol.</small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card p-3 border h-100 cursor-pointer" [class.border-primary]="currentRule.allocationMethod === 'SPECIFIC'" (click)="setMethod('SPECIFIC')">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="method" id="mSpecific" value="SPECIFIC" [(ngModel)]="currentRule.allocationMethod">
                      <label class="form-check-label fw-bold" for="mSpecific">Destinatario Específico</label>
                    </div>
                    <small class="text-muted d-block mt-2">Asigna la tarea a un usuario en base a una variable del caso (ej: creador del caso).</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rol Destinatario (Solo para EVERYONE, LEAST_LOADED, ROUND_ROBIN) -->
            <div class="mb-3" *ngIf="currentRule.taskDefinitionKey && currentRule.allocationMethod !== 'SPECIFIC'">
              <label class="form-label fw-semibold">Rol Destinatario (Candidatos)</label>
              <select class="form-select" [(ngModel)]="currentRule.candidateGroup" name="candidateGroup" required>
                <option value="">-- Seleccionar Rol --</option>
                <option *ngFor="let role of roles" [value]="role.name">{{ role.name }}</option>
              </select>
            </div>

            <!-- Expresión (Solo para SPECIFIC) -->
            <div class="mb-3" *ngIf="currentRule.taskDefinitionKey && currentRule.allocationMethod === 'SPECIFIC'">
              <label class="form-label fw-semibold">Variable / Expresión de Asignación</label>
              <input type="text" class="form-control" [(ngModel)]="currentRule.specificExpression" name="specificExpression" placeholder="Ej: creador_caso, asesor_asignado" required>
              <small class="text-muted">Ingresa el nombre de la variable de Flowable que almacena el nombre de usuario de destino.</small>
            </div>

            <!-- Estado Activo -->
            <div class="mb-4 form-check form-switch" *ngIf="currentRule.taskDefinitionKey">
              <input class="form-check-input" type="checkbox" id="ruleActive" [(ngModel)]="currentRule.active" name="active">
              <label class="form-check-label fw-semibold" for="ruleActive">Regla Activa</label>
            </div>

            <!-- Botones de Acción -->
            <div class="d-flex justify-content-end gap-2 border-top pt-3">
              <button type="button" class="btn btn-outline-secondary" (click)="cancelar()">Cancelar</button>
              <button type="submit" class="btn btn-primary px-4" [disabled]="!ruleForm.form.valid">
                <i class="bi bi-save me-1"></i>Guardar Regla
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    .cursor-pointer:hover {
      background-color: #f8f9fa;
      border-color: #0d6efd !important;
    }
  `]
})
export class AsignacionComponent implements OnInit {
  private http = inject(HttpClient);
  private processService = inject(ProcessService);
  private securityService = inject(SecurityService);

  viewMode: 'list' | 'form' = 'list';
  isEditing = false;
  
  rules: TaskAllocationRule[] = [];
  processes: ProcessDefinition[] = [];
  tasks: TaskDefinition[] = [];
  roles: Role[] = [];

  currentRule: TaskAllocationRule = this.getEmptyRule();

  ngOnInit() {
    this.cargarReglas();
    this.cargarProcesos();
    this.cargarRoles();
  }

  cargarReglas() {
    this.http.get<TaskAllocationRule[]>('/api/v1/task-allocation/rules')
      .subscribe(data => this.rules = data);
  }

  cargarProcesos() {
    this.processService.getProcesses().subscribe(data => this.processes = data);
  }

  cargarRoles() {
    this.securityService.getRoles().subscribe(data => this.roles = data);
  }

  getProcessName(key: string): string {
    const p = this.processes.find(pr => pr.key === key);
    return p ? p.name : key;
  }

  onProcessChange() {
    this.tasks = [];
    this.currentRule.taskDefinitionKey = '';
    
    if (this.currentRule.processDefinitionKey) {
      this.http.get<TaskDefinition[]>(`/api/v1/task-allocation/tasks/${this.currentRule.processDefinitionKey}`)
        .subscribe({
          next: (data) => this.tasks = data,
          error: () => Swal.fire('Error', 'No se pudieron extraer las tareas del proceso.', 'error')
        });
    }
  }

  setMethod(method: string) {
    this.currentRule.allocationMethod = method;
    if (method === 'SPECIFIC') {
      this.currentRule.candidateGroup = undefined;
    } else {
      this.currentRule.specificExpression = undefined;
    }
  }

  abrirNuevo() {
    this.viewMode = 'form';
    this.isEditing = false;
    this.currentRule = this.getEmptyRule();
    this.tasks = [];
  }

  editarRegla(rule: TaskAllocationRule) {
    this.viewMode = 'form';
    this.isEditing = true;
    this.currentRule = { ...rule };
    
    // Cargar tareas para el proceso editado
    this.http.get<TaskDefinition[]>(`/api/v1/task-allocation/tasks/${rule.processDefinitionKey}`)
      .subscribe(data => this.tasks = data);
  }

  eliminarRegla(id?: number) {
    if (!id) return;
    Swal.fire({
      title: '¿Eliminar Regla?',
      text: '¿Estás seguro de que deseas eliminar esta regla de asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`/api/v1/task-allocation/rules/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Regla de asignación eliminada correctamente.', 'success');
            this.cargarReglas();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la regla.', 'error')
        });
      }
    });
  }

  guardarRegla() {
    this.http.post<TaskAllocationRule>('/api/v1/task-allocation/rules', this.currentRule).subscribe({
      next: () => {
        Swal.fire('Guardado', 'Regla de asignación guardada exitosamente.', 'success');
        this.viewMode = 'list';
        this.cargarReglas();
      },
      error: () => Swal.fire('Error', 'No se pudo guardar la regla de asignación.', 'error')
    });
  }

  cancelar() {
    this.viewMode = 'list';
  }

  getMethodLabel(method: string): string {
    switch (method) {
      case 'EVERYONE': return 'Todos (Cola)';
      case 'LEAST_LOADED': return 'Por Carga (Balanceo)';
      case 'ROUND_ROBIN': return 'Por Rotación (Secuencial)';
      case 'SPECIFIC': return 'Destinatario Específico';
      default: return method;
    }
  }

  getMethodClass(method: string): string {
    switch (method) {
      case 'EVERYONE': return 'bg-secondary';
      case 'LEAST_LOADED': return 'bg-primary';
      case 'ROUND_ROBIN': return 'bg-info text-dark';
      case 'SPECIFIC': return 'bg-warning text-dark';
      default: return 'bg-light text-dark';
    }
  }

  private getEmptyRule(): TaskAllocationRule {
    return {
      processDefinitionKey: '',
      taskDefinitionKey: '',
      allocationMethod: 'EVERYONE',
      active: true
    };
  }
}
