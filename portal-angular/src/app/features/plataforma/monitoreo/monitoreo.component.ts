import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstanceService, ProcessInstance } from '../../../core/services/instance.service';
import { VisorProcesoComponent } from './visor-proceso.component';

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [CommonModule, VisorProcesoComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="mb-4">
        <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-activity me-2"></i>Monitoreo de Instancias</h2>
        <p class="text-muted">Seguimiento en tiempo real de los procesos en ejecución y finalizados.</p>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase mb-1 opacity-75">Instancias Activas</h6>
                  <h2 class="mb-0 fw-bold">{{ activeInstances.length }}</h2>
                </div>
                <i class="bi bi-play-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-uppercase mb-1 opacity-75">Instancias Finalizadas</h6>
                  <h2 class="mb-0 fw-bold">{{ historyInstances.length }}</h2>
                </div>
                <i class="bi bi-check-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom py-3">
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <button class="nav-link" [class.active]="view === 'active'" (click)="view = 'active'">Activas</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="view === 'history'" (click)="view = 'history'">Historial</button>
            </li>
          </ul>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-4">ID Instancia</th>
                  <th>Proceso</th>
                  <th>Inicio</th>
                  <th *ngIf="view === 'history'">Fin</th>
                  <th>Estado</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let inst of (view === 'active' ? activeInstances : historyInstances)">
                  <td class="ps-4">
                    <span class="text-monospace small">{{ inst.id }}</span>
                  </td>
                  <td>
                    <div class="fw-bold">{{ inst.processDefinitionName }}</div>
                    <small class="text-muted">{{ inst.processDefinitionKey }} (v.{{ inst.processDefinitionId.split(':')[1] }})</small>
                  </td>
                  <td>{{ inst.startTime | date:'medium' }}</td>
                  <td *ngIf="view === 'history'">{{ inst.endTime | date:'medium' }}</td>
                  <td>
                    <span class="badge" [ngClass]="inst.status === 'ACTIVE' ? 'bg-primary' : 'bg-success'">
                      {{ inst.status }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary" (click)="verMapa(inst)" title="Ver Mapa de Proceso">
                      <i class="bi bi-map-fill me-1"></i>Ver Mapa
                    </button>
                  </td>
                </tr>
                <tr *ngIf="(view === 'active' ? activeInstances : historyInstances).length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    No hay instancias para mostrar en esta vista.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE VISUALIZACIÓN -->
    <div class="modal fade" [class.show]="selectedInstance" [style.display]="selectedInstance ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">
              <i class="bi bi-geo-alt-fill me-2"></i>
              Estado de Instancia: {{ selectedInstance?.processDefinitionName }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="selectedInstance = null"></button>
          </div>
          <div class="modal-body p-0">
            <div class="p-3 bg-light border-bottom">
              <div class="row small">
                <div class="col-md-4"><strong>ID Instancia:</strong> {{ selectedInstance?.id }}</div>
                <div class="col-md-4"><strong>Definición:</strong> {{ selectedInstance?.processDefinitionId }}</div>
                <div class="col-md-4"><strong>Estado:</strong> {{ selectedInstance?.status }}</div>
              </div>
            </div>
            <div *ngIf="selectedInstance">
              <app-visor-proceso 
                [processDefinitionId]="selectedInstance.processDefinitionId"
                [instanceId]="selectedInstance.id">
              </app-visor-proceso>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary px-4" (click)="selectedInstance = null">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="selectedInstance" class="modal-backdrop fade show"></div>
  `,
  styles: [`
    .nav-tabs .nav-link {
      cursor: pointer;
      color: #6c757d;
      border: none;
      border-bottom: 2px solid transparent;
    }
    .nav-tabs .nav-link.active {
      color: #0d6efd;
      background: none;
      border-bottom-color: #0d6efd;
    }
    .table th {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .text-monospace { font-family: monospace; }
    .modal-xl { max-width: 90%; }
    .modal.show { background: rgba(0,0,0,0.6); }
  `]
})
export class MonitoreoComponent implements OnInit {
  private instanceService = inject(InstanceService);
  
  activeInstances: ProcessInstance[] = [];
  historyInstances: ProcessInstance[] = [];
  view: 'active' | 'history' = 'active';
  selectedInstance: ProcessInstance | null = null;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.instanceService.getActiveInstances().subscribe(data => this.activeInstances = data);
    this.instanceService.getHistoryInstances().subscribe(data => this.historyInstances = data);
  }

  verMapa(inst: ProcessInstance) {
    this.selectedInstance = inst;
  }
}
