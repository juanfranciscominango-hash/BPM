import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessErrorService, ProcessErrorLog } from '../../../core/services/process-error.service';

@Component({
  selector: 'app-process-errors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <h3 class="mb-4 text-primary"><i class="bi bi-bug me-2"></i>Monitoreo de Errores de Proceso</h3>

      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <ul class="nav nav-pills" id="errorTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="pending-tab" data-bs-toggle="tab" data-bs-target="#pending" type="button" role="tab" aria-controls="pending" aria-selected="true" (click)="loadPending()">
                Errores Pendientes
              </button>
            </li>
            <li class="nav-item ms-3" role="presentation">
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Buscar por Instancia ID..." [(ngModel)]="searchInstanceId" (keyup.enter)="searchByInstance()">
                <button class="btn btn-outline-secondary" type="button" (click)="searchByInstance()">Buscar</button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID Error</th>
                  <th>Instancia / Tarea</th>
                  <th>Tipo / Fecha</th>
                  <th>Mensaje</th>
                  <th>Reintentos</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let error of errors">
                  <td><span class="fw-bold">#{{ error.id }}</span></td>
                  <td>
                    <div><span class="badge bg-secondary">{{ error.processInstanceId }}</span></div>
                    <div class="small text-muted">{{ error.taskName || 'N/A' }}</div>
                  </td>
                  <td>
                    <span class="badge bg-danger">{{ error.errorType }}</span>
                    <div class="small text-muted mt-1">{{ error.createdAt | date:'short' }}</div>
                  </td>
                  <td style="max-width: 300px;">
                    <div class="text-truncate fw-bold text-danger" [title]="error.errorMessage">{{ error.errorMessage }}</div>
                    <a *ngIf="error.stackTrace" href="javascript:void(0)" class="small text-primary text-decoration-none" (click)="viewStackTrace(error)">Ver Traza Completa</a>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="error.retryCount >= error.maxRetries ? 'bg-danger' : 'bg-warning text-dark'">
                      {{ error.retryCount }} / {{ error.maxRetries }}
                    </span>
                  </td>
                  <td>
                    <span class="badge rounded-pill" 
                          [ngClass]="{
                            'bg-warning text-dark': error.status === 'PENDING',
                            'bg-info text-dark': error.status === 'RETRYING',
                            'bg-success': error.status === 'RESOLVED',
                            'bg-secondary': error.status === 'IGNORED'
                          }">
                      {{ error.status }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-2" (click)="retry(error)" title="Reintentar" *ngIf="error.status === 'PENDING' || error.status === 'RETRYING'">
                      <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success me-2" (click)="resolve(error)" title="Marcar como Resuelto" *ngIf="error.status !== 'RESOLVED' && error.status !== 'IGNORED'">
                      <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" (click)="ignore(error)" title="Ignorar" *ngIf="error.status !== 'RESOLVED' && error.status !== 'IGNORED'">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="errors.length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-check-circle fs-1 text-success d-block mb-3"></i>
                    No hay errores registrados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal StackTrace -->
    <div class="modal" tabindex="-1" [ngClass]="{'show d-block': isModalOpen}" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl">
        <div class="modal-content rounded-4 shadow">
          <div class="modal-header bg-danger text-white border-0">
            <h5 class="modal-title fw-bold"><i class="bi bi-exclamation-triangle-fill me-2"></i>Detalle del Error</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <h6 class="fw-bold text-danger">{{ selectedError?.errorMessage }}</h6>
            <pre class="bg-dark text-light p-3 rounded mt-3 font-monospace" style="max-height: 400px; overflow-y: auto; font-size: 0.85rem;">{{ selectedError?.stackTrace }}</pre>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="closeModal()">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProcessErrorsComponent implements OnInit {
  private errorService = inject(ProcessErrorService);

  errors: ProcessErrorLog[] = [];
  searchInstanceId: string = '';
  
  isModalOpen = false;
  selectedError: ProcessErrorLog | null = null;

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.errorService.getPending().subscribe(res => {
      this.errors = res;
    });
  }

  searchByInstance() {
    if (!this.searchInstanceId) {
      this.loadPending();
      return;
    }
    this.errorService.getByInstance(this.searchInstanceId).subscribe(res => {
      this.errors = res;
    });
  }

  viewStackTrace(error: ProcessErrorLog) {
    this.selectedError = error;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedError = null;
  }

  retry(error: ProcessErrorLog) {
    if (confirm('¿Desea reintentar la acción que generó este error?')) {
      // Current user should be taken from AuthService, using hardcoded for demo
      this.errorService.retryError(error.id!, 'admin').subscribe(() => {
        this.loadPending();
      });
    }
  }

  resolve(error: ProcessErrorLog) {
    const notes = prompt('Ingrese notas de resolución:');
    if (notes !== null) {
      this.errorService.resolveError(error.id!, 'admin', notes).subscribe(() => {
        this.loadPending();
      });
    }
  }

  ignore(error: ProcessErrorLog) {
    const notes = prompt('Ingrese motivo para ignorar:');
    if (notes !== null) {
      this.errorService.ignoreError(error.id!, 'admin', notes).subscribe(() => {
        this.loadPending();
      });
    }
  }
}

