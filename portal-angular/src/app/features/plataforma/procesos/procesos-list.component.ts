import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcessService, ProcessDefinition } from '../../../core/services/process.service';
import { MetaService, MetaEntity } from '../../../core/services/meta.service';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-procesos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DynamicFormComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-start align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-stack me-2"></i>Gestión de Procesos</h2>
          <p class="text-muted mb-0">Listado de procesos diseñados y su estado en el motor Flowable.</p>
        </div>
        <button class="btn btn-primary shadow-sm ms-4" routerLink="/plataforma/disenador">
          <i class="bi bi-plus-lg me-1"></i>Nuevo Proceso
        </button>
      </div>

      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Nombre del Proceso</th>
                <th>Clave (Key)</th>
                <th>Entidad Asociada</th>
                <th>Estado</th>
                <th class="text-nowrap">Última Actualización</th>
                <th class="text-end pe-4 text-nowrap" style="min-width: 130px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of processes">
                <td class="ps-4">
                  <div class="fw-bold">{{ formatName(p.name) }}</div>
                  <small class="text-muted" *ngIf="p.procDefId">ID: {{ p.procDefId }}</small>
                </td>
                <td><code>{{ p.key }}</code></td>
                <td>
                  <button class="btn btn-sm btn-outline-secondary" (click)="abrirConfiguracion(p)">
                    <i class="bi bi-link-45deg me-1"></i>
                    {{ p.metaEntityId ? 'Entidad ID: ' + p.metaEntityId : 'Vincular Entidad' }}
                  </button>
                </td>
                <td>
                  <span class="badge" [ngClass]="p.status === 'DEPLOYED' ? 'bg-success' : 'bg-warning text-dark'">
                    {{ p.status }}
                  </span>
                </td>
                <td class="text-nowrap">{{ p.lastUpdated | date:'short' }}</td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-success me-2 shadow-sm" (click)="confirmarInicio(p)" *ngIf="p.status === 'DEPLOYED'">
                    <i class="bi bi-play-fill me-1"></i>Iniciar
                  </button>
                  <button class="btn btn-sm btn-outline-primary shadow-sm me-2" [routerLink]="['/plataforma/disenador']" [queryParams]="{id: p.id}" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger shadow-sm" (click)="eliminarProceso(p)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIGURACIÓN ENTIDAD -->
    <div class="modal fade" [class.show]="processToConfig" [style.display]="processToConfig ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Configurar Entidad para: {{ formatName(processToConfig?.name) }}</h5>
            <button type="button" class="btn-close" (click)="processToConfig = null"></button>
          </div>
          <div class="modal-body p-4">
            <label class="form-label fw-bold">Seleccionar Entidad para el Formulario Inicial</label>
            <select class="form-select shadow-sm" [(ngModel)]="selectedEntityId">
              <option [ngValue]="null">Ninguna (Inicio sin datos)</option>
              <option *ngFor="let ent of entities" [ngValue]="ent.id">{{ ent.label }} ({{ ent.name }})</option>
            </select>
            <div class="form-text mt-2">Esta entidad generará automáticamente el formulario de inicio de instancia.</div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary px-4" (click)="processToConfig = null">Cancelar</button>
            <button type="button" class="btn btn-primary px-4" (click)="vincularEntidad()">Vincular</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL FORMULARIO DINÁMICO DE INICIO -->
    <div class="modal fade" [class.show]="processToStart" [style.display]="processToStart ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">Iniciar Instancia: {{ formatName(processToStart?.name) }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="processToStart = null"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-muted small mb-4">Por favor complete los siguientes campos para iniciar el proceso.</p>
            <app-dynamic-form 
              *ngIf="processToStart?.metaEntityId" 
              [entityId]="processToStart!.metaEntityId!"
              (onSave)="iniciarConDatos($event)"
              (onCancel)="processToStart = null">
            </app-dynamic-form>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="processToConfig || processToStart" class="modal-backdrop fade show"></div>
  `,
  styles: [`
    .table th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .modal.show { background: rgba(0,0,0,0.5); }
    .form-select { border-radius: 8px; }
  `]
})
export class ProcesosListComponent implements OnInit {
  private processService = inject(ProcessService);
  private metaService = inject(MetaService);
  
  processes: ProcessDefinition[] = [];
  entities: MetaEntity[] = [];

  processToConfig: ProcessDefinition | null = null;
  selectedEntityId: number | null = null;

  processToStart: ProcessDefinition | null = null;

  formatName(name: string | undefined): string {
    if (!name) return '';
    return name.replace(/\s*\(?Bizagi\)?/gi, '');
  }

  ngOnInit() {
    this.loadProcesses();
    this.metaService.listarEntidades().subscribe(data => this.entities = data);
  }

  loadProcesses() {
    this.processService.getProcesses().subscribe(data => this.processes = data);
  }

  abrirConfiguracion(p: ProcessDefinition) {
    this.processToConfig = p;
    this.selectedEntityId = p.metaEntityId || null;
  }

  vincularEntidad() {
    if (this.processToConfig) {
      this.processToConfig.metaEntityId = this.selectedEntityId || undefined;
      this.processService.saveProcess(this.processToConfig).subscribe(() => {
        alert('¡Entidad vinculada con éxito!');
        this.processToConfig = null;
        this.loadProcesses();
      });
    }
  }

  confirmarInicio(p: ProcessDefinition) {
    if (p.metaEntityId) {
      this.processToStart = p;
    } else {
      if (confirm(`¿Desea iniciar una instancia de "${this.formatName(p.name)}"?`)) {
        this.processToStart = p;
        this.iniciarConDatos({});
      }
    }
  }

  iniciarConDatos(variables: any) {
    // Si processToStart está nulo, es porque fue un inicio directo sin entidad
    const targetKey = this.processToStart ? this.processToStart.key : variables.key;

    this.processService.startInstance(this.processToStart?.key || '', variables).subscribe({
      next: () => {
        alert('¡Instancia iniciada con éxito con los datos proporcionados!');
        this.processToStart = null;
      },
      error: (err) => alert('Error al iniciar: ' + (err.error?.message || 'Error desconocido'))
    });
  }

  eliminarProceso(p: ProcessDefinition) {
    if (confirm(`¿Está seguro de que desea eliminar el proceso "${this.formatName(p.name)}"?`)) {
      if (p.id) {
        this.processService.deleteProcess(p.id).subscribe({
          next: () => {
            alert('¡Proceso eliminado con éxito!');
            this.loadProcesses();
          },
          error: (err) => {
            console.error('Error al eliminar proceso', err);
            alert('No se pudo eliminar el proceso. Asegúrese de que no tenga instancias activas.');
          }
        });
      }
    }
  }
}
