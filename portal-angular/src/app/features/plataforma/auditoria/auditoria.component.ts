import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, AuditLog } from '../../../core/services/audit.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Encabezado -->
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-shield-check me-2"></i>Auditoría Integral del Sistema</h2>
          <p class="text-muted">Registro transversal y detallado de las acciones y modificaciones críticas realizadas por los usuarios.</p>
        </div>
        <button class="btn btn-outline-secondary" (click)="cargarLogs()">
          <i class="bi bi-arrow-clockwise me-1"></i> Refrescar
        </button>
      </div>

      <!-- Tarjetas de Resumen -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-white rounded-3">
            <div class="card-body py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h6 class="text-muted text-uppercase mb-1 small fw-bold">Total de Eventos</h6>
                <h2 class="mb-0 fw-bold text-dark">{{ logs.length }}</h2>
              </div>
              <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <i class="bi bi-list-task fs-3"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-white rounded-3">
            <div class="card-body py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h6 class="text-muted text-uppercase mb-1 small fw-bold">Acciones Exitosas</h6>
                <h2 class="mb-0 fw-bold text-success">{{ getExitosos() }}</h2>
              </div>
              <div class="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <i class="bi bi-check-circle fs-3"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-white rounded-3">
            <div class="card-body py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h6 class="text-muted text-uppercase mb-1 small fw-bold">Acciones Fallidas</h6>
                <h2 class="mb-0 fw-bold text-danger">{{ getFallidos() }}</h2>
              </div>
              <div class="bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                <i class="bi bi-exclamation-triangle fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small fw-bold text-muted">Buscador General (Usuario, Acción o Entidad)</label>
              <input type="text" class="form-control" [(ngModel)]="filtroTexto" placeholder="Buscar..." (ngModelChange)="aplicarFiltros()">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-bold text-muted">Filtrar por Estado</label>
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
                <option value="">Todos los estados</option>
                <option value="EXITOSO">EXITOSO</option>
                <option value="FALLIDO">FALLIDO</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-bold text-muted">Filtrar por Entidad</label>
              <select class="form-select" [(ngModel)]="filtroEntidad" (change)="aplicarFiltros()">
                <option value="">Todas las entidades</option>
                <option *ngFor="let ent of entidades" [value]="ent">{{ ent }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Datos -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-4">Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad / ID</th>
                  <th>IP Origen</th>
                  <th>Estado</th>
                  <th class="text-end pe-4">Detalles</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of logsFiltrados">
                  <td class="ps-4 text-nowrap">
                    {{ log.fechaHora | date:'medium' }}
                  </td>
                  <td class="fw-bold text-dark">
                    <i class="bi bi-person-fill me-1 text-muted"></i>{{ log.usuario }}
                  </td>
                  <td>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2.5 py-1.5 fs-7">
                      {{ log.accion }}
                    </span>
                  </td>
                  <td>
                    <div *ngIf="log.nombreEntidad">
                      <span class="text-dark fw-semibold">{{ log.nombreEntidad }}</span>
                      <small class="d-block text-muted" *ngIf="log.idEntidad">ID: {{ log.idEntidad }}</small>
                    </div>
                    <span class="text-muted" *ngIf="!log.nombreEntidad">-</span>
                  </td>
                  <td class="text-monospace small text-muted">
                    {{ log.direccionIp }}
                  </td>
                  <td>
                    <span class="badge rounded-pill px-2.5 py-1.5"
                          [ngClass]="log.estado === 'EXITOSO' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'">
                      <i class="bi" [ngClass]="log.estado === 'EXITOSO' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                      {{ log.estado }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-light border shadow-sm px-3 rounded-pill" (click)="verDetalles(log)">
                      <i class="bi bi-eye"></i> Ver
                    </button>
                  </td>
                </tr>
                <tr *ngIf="logsFiltrados.length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    No se encontraron registros de auditoría que coincidan con la búsqueda.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);" *ngIf="modalAbierto">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-primary"><i class="bi bi-info-circle me-2"></i>Detalles del Evento</h5>
            <button type="button" class="btn-close" (click)="cerrarModal()"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <span class="text-muted small d-block">Acción Ejecutada</span>
                <span class="fw-bold text-dark fs-5">{{ logSeleccionado?.accion }}</span>
              </div>
              <div class="col-md-6 text-md-end">
                <span class="text-muted small d-block">Fecha y Hora</span>
                <span class="fw-semibold text-dark">{{ logSeleccionado?.fechaHora | date:'medium' }}</span>
              </div>
              <div class="col-md-4">
                <span class="text-muted small d-block">Usuario</span>
                <span class="fw-semibold text-dark">{{ logSeleccionado?.usuario }}</span>
              </div>
              <div class="col-md-4">
                <span class="text-muted small d-block">Dirección IP</span>
                <span class="text-monospace text-dark">{{ logSeleccionado?.direccionIp }}</span>
              </div>
              <div class="col-md-4">
                <span class="text-muted small d-block">Estado</span>
                <span class="badge" [ngClass]="logSeleccionado?.estado === 'EXITOSO' ? 'bg-success' : 'bg-danger'">
                  {{ logSeleccionado?.estado }}
                </span>
              </div>
            </div>

            <!-- JSON de detalles formateado -->
            <div class="mt-3" *ngIf="logSeleccionado?.detalles">
              <h6 class="fw-bold text-muted mb-2">Payload y Cambios Detectados</h6>
              <div class="bg-light p-3 rounded-3 border">
                <!-- Si es una modificación con campos modificados -->
                <div *ngIf="detallesParser(logSeleccionado?.detalles)?.campos_modificados; else rawJson">
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered bg-white mb-0 align-middle">
                      <thead class="bg-light text-muted small">
                        <tr>
                          <th>Campo</th>
                          <th>Valor Anterior</th>
                          <th>Valor Nuevo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of getCamposModificados(logSeleccionado?.detalles)">
                          <td class="fw-bold">{{ item.campo }}</td>
                          <td class="text-danger bg-danger bg-opacity-10">{{ item.anterior | json }}</td>
                          <td class="text-success bg-success bg-opacity-10">{{ item.nuevo | json }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Template para mostrar JSON crudo si no hay campos_modificados estructurados -->
                <ng-template #rawJson>
                  <pre class="mb-0 text-monospace text-dark fs-7" style="max-height: 250px; overflow-y: auto;">{{ logSeleccionado?.detalles | json }}</pre>
                </ng-template>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary px-4 rounded-pill" (click)="cerrarModal()">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditoriaComponent implements OnInit {
  private auditService = inject(AuditService);

  logs: AuditLog[] = [];
  logsFiltrados: AuditLog[] = [];
  entidades: string[] = [];

  // Filtros
  filtroTexto: string = '';
  filtroEstado: string = '';
  filtroEntidad: string = '';

  // Modal
  modalAbierto: boolean = false;
  logSeleccionado: AuditLog | null = null;

  ngOnInit() {
    this.cargarLogs();
  }

  cargarLogs() {
    this.auditService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.logsFiltrados = data;
        
        // Extraer lista única de entidades
        const entSet = new Set<string>();
        data.forEach(l => {
          if (l.nombreEntidad) entSet.add(l.nombreEntidad);
        });
        this.entidades = Array.from(entSet);
        
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error cargando auditoría:', err)
    });
  }

  getExitosos(): number {
    return this.logs.filter(l => l.estado === 'EXITOSO').length;
  }

  getFallidos(): number {
    return this.logs.filter(l => l.estado === 'FALLIDO').length;
  }

  aplicarFiltros() {
    this.logsFiltrados = this.logs.filter(l => {
      const cumpleTexto = !this.filtroTexto || 
        l.usuario.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        l.accion.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        (l.nombreEntidad && l.nombreEntidad.toLowerCase().includes(this.filtroTexto.toLowerCase()));

      const cumpleEstado = !this.filtroEstado || l.estado === this.filtroEstado;
      const cumpleEntidad = !this.filtroEntidad || l.nombreEntidad === this.filtroEntidad;

      return cumpleTexto && cumpleEstado && cumpleEntidad;
    });
  }

  verDetalles(log: AuditLog) {
    this.logSeleccionado = log;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.logSeleccionado = null;
  }

  detallesParser(detallesStr: string | undefined): any {
    if (!detallesStr) return null;
    try {
      return JSON.parse(detallesStr);
    } catch (e) {
      return null;
    }
  }

  getCamposModificados(detallesStr: string | undefined): any[] {
    const parsed = this.detallesParser(detallesStr);
    if (!parsed || !parsed.campos_modificados) return [];
    
    return Object.keys(parsed.campos_modificados).map(key => ({
      campo: key,
      anterior: parsed.campos_modificados[key].anterior,
      nuevo: parsed.campos_modificados[key].nuevo
    }));
  }
}
