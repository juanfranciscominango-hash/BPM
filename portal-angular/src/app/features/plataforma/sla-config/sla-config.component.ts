import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlaService, TaskSlaConfig } from '../../../core/services/sla.service';
import { ProcessService } from '../../../core/services/process.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sla-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="h4 mb-0 text-primary fw-bold"><i class="bi bi-clock-history me-2"></i>Configuración de SLAs</h2>
          <p class="text-muted mb-0 small">Define tiempos máximos por actividad y acciones al vencer.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-warning rounded-3 px-3" (click)="forceCheck()">
            <i class="bi bi-lightning-charge me-1"></i>Verificar SLAs Ahora
          </button>
          <button class="btn btn-sm btn-primary rounded-3 px-3" (click)="nuevoSla()">
            <i class="bi bi-plus-lg me-1"></i>Nuevo SLA
          </button>
        </div>
      </div>

      <!-- Formulario nuevo/editar -->
      <div *ngIf="showForm" class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <h5 class="fw-bold text-dark mb-3">
            <i class="bi bi-pencil-square me-2 text-primary"></i>
            {{ editing ? 'Editar SLA' : 'Nuevo SLA' }}
          </h5>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Proceso</label>
              <select class="form-select form-select-sm rounded-3" [(ngModel)]="form.processDefinitionKey" (change)="onProcessChange()">
                <option value="">Seleccionar proceso...</option>
                <option *ngFor="let p of processes" [value]="p.key">{{ p.name || p.key }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Actividad (Tarea)</label>
              <select class="form-select form-select-sm rounded-3" [(ngModel)]="form.taskDefinitionKey" (change)="onTaskChange()">
                <option value="">Seleccionar actividad...</option>
                <option *ngFor="let t of availableTasks" [value]="t.key">{{ t.name || t.key }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Nombre descriptivo</label>
              <input type="text" class="form-control form-control-sm rounded-3" [(ngModel)]="form.taskName" placeholder="Ej: Validar datos del cliente">
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Tiempo máximo</label>
              <input type="number" class="form-control form-control-sm rounded-3" [(ngModel)]="form.maxDuration" min="1">
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Unidad</label>
              <select class="form-select form-select-sm rounded-3" [(ngModel)]="form.timeUnit">
                <option value="MINUTES">Minutos</option>
                <option value="HOURS">Horas</option>
                <option value="DAYS">Días</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Alerta al %</label>
              <input type="number" class="form-control form-control-sm rounded-3" [(ngModel)]="form.warningThresholdPct" min="1" max="99">
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Acción al vencer</label>
              <select class="form-select form-select-sm rounded-3" [(ngModel)]="form.expiryAction">
                <option value="NOTIFY_SUPERVISOR">Notificar al supervisor</option>
                <option value="REASSIGN">Reasignar automáticamente</option>
                <option value="ESCALATE">Escalar (notificar a ambos)</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Usuario/Rol destino</label>
              <input type="text" class="form-control form-control-sm rounded-3" [(ngModel)]="form.escalationTarget" placeholder="Ej: administrador">
            </div>
          </div>
          <div class="mt-4 d-flex gap-2">
            <button class="btn btn-primary btn-sm rounded-3 px-4" (click)="guardarSla()" [disabled]="!form.processDefinitionKey || !form.taskDefinitionKey || !form.maxDuration">
              <i class="bi bi-check-lg me-1"></i>Guardar
            </button>
            <button class="btn btn-light btn-sm border rounded-3 px-4" (click)="showForm = false">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Tabla de SLAs existentes -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-4">Proceso</th>
                  <th>Actividad</th>
                  <th class="text-center">Tiempo Máximo</th>
                  <th class="text-center">Alerta</th>
                  <th>Acción al Vencer</th>
                  <th>Destino</th>
                  <th class="text-center">Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="loading">
                  <td colspan="8" class="text-center py-5">
                    <div class="spinner-border spinner-border-sm text-primary"></div>
                    <span class="ms-2 text-muted">Cargando configuraciones...</span>
                  </td>
                </tr>
                <tr *ngIf="!loading && configs.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-clock fs-2 d-block mb-2"></i>
                    No hay SLAs configurados. Haga clic en "Nuevo SLA" para crear uno.
                  </td>
                </tr>
                <tr *ngFor="let sla of configs">
                  <td class="ps-4">
                    <span class="fw-semibold text-dark">{{ sla.processDefinitionKey }}</span>
                  </td>
                  <td>
                    <span class="fw-semibold">{{ sla.taskName || sla.taskDefinitionKey }}</span>
                    <div class="text-muted small" *ngIf="sla.taskName">{{ sla.taskDefinitionKey }}</div>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-light text-dark border px-3 py-2 fw-bold">
                      {{ sla.maxDuration }} {{ sla.timeUnit === 'MINUTES' ? 'min' : sla.timeUnit === 'HOURS' ? 'hrs' : 'días' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge rounded-pill px-2 py-1" style="background-color: rgba(255,193,7,0.15); color: #b8860b;">
                      {{ sla.warningThresholdPct }}%
                    </span>
                  </td>
                  <td>
                    <span *ngIf="sla.expiryAction === 'NOTIFY_SUPERVISOR'" class="badge bg-info text-dark px-2 py-1">
                      <i class="bi bi-bell me-1"></i>Notificar
                    </span>
                    <span *ngIf="sla.expiryAction === 'REASSIGN'" class="badge bg-warning text-dark px-2 py-1">
                      <i class="bi bi-person-lines-fill me-1"></i>Reasignar
                    </span>
                    <span *ngIf="sla.expiryAction === 'ESCALATE'" class="badge bg-danger text-white px-2 py-1">
                      <i class="bi bi-arrow-up-circle me-1"></i>Escalar
                    </span>
                  </td>
                  <td>
                    <span class="text-dark small fw-semibold">{{ sla.escalationTarget || '—' }}</span>
                  </td>
                  <td class="text-center">
                    <span *ngIf="sla.active" class="badge bg-success text-white px-2 py-1">Activo</span>
                    <span *ngIf="!sla.active" class="badge bg-secondary text-white px-2 py-1">Inactivo</span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary rounded-circle me-1" (click)="editarSla(sla)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-circle" (click)="eliminarSla(sla)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SlaConfigComponent implements OnInit {
  private slaService = inject(SlaService);
  private processService = inject(ProcessService);
  private http = inject(HttpClient);

  configs: TaskSlaConfig[] = [];
  processes: any[] = [];
  availableTasks: any[] = [];
  loading = false;
  showForm = false;
  editing = false;

  form: TaskSlaConfig = this.emptyForm();

  ngOnInit() {
    this.cargarConfigs();
    this.cargarProcesos();
  }

  cargarConfigs() {
    this.loading = true;
    this.slaService.getConfigs().subscribe({
      next: (data) => { this.configs = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  cargarProcesos() {
    this.processService.getProcesses().subscribe({
      next: (data) => this.processes = data || [],
      error: (err) => { console.error("Error al cargar procesos:", err); }
    });
  }

  onProcessChange() {
    if (!this.form.processDefinitionKey) {
      this.availableTasks = [];
      return;
    }
    // Load tasks for the selected process via task-allocation endpoint
    this.http.get<any[]>(`${environment.back_url}/api/v1/task-allocation/tasks/${this.form.processDefinitionKey}`)
      .subscribe({
        next: (tasks) => this.availableTasks = tasks || [],
        error: () => this.availableTasks = []
      });
  }

  onTaskChange() {
    const selected = this.availableTasks.find(t => t.key === this.form.taskDefinitionKey);
    if (selected) {
      this.form.taskName = selected.name || selected.key;
    }
  }

  nuevoSla() {
    this.form = this.emptyForm();
    this.editing = false;
    this.showForm = true;
  }

  editarSla(sla: TaskSlaConfig) {
    this.form = { ...sla };
    this.editing = true;
    this.showForm = true;
    this.onProcessChange();
  }

  guardarSla() {
    this.slaService.saveConfig(this.form).subscribe({
      next: () => {
        this.showForm = false;
        this.cargarConfigs();
      },
      error: (err) => {
        console.error('Error al guardar SLA', err);
        alert('Error al guardar la configuración del SLA.');
      }
    });
  }

  eliminarSla(sla: TaskSlaConfig) {
    if (!confirm(`¿Eliminar el SLA de "${sla.taskName || sla.taskDefinitionKey}"?`)) return;
    this.slaService.deleteConfig(sla.id!).subscribe({
      next: () => this.cargarConfigs(),
      error: (err) => {
        console.error('Error al eliminar', err);
        alert('Error al eliminar el SLA.');
      }
    });
  }

  forceCheck() {
    this.slaService.forceCheck().subscribe({
      next: () => alert('Verificación de SLAs ejecutada correctamente.'),
      error: () => alert('Error al ejecutar la verificación.')
    });
  }

  private emptyForm(): TaskSlaConfig {
    return {
      processDefinitionKey: '',
      taskDefinitionKey: '',
      taskName: '',
      maxDuration: 4,
      timeUnit: 'HOURS',
      warningThresholdPct: 80,
      expiryAction: 'NOTIFY_SUPERVISOR',
      escalationTarget: '',
      active: true
    };
  }
}
