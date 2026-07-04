import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-columnas-mantenimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-grid-3x3-gap me-2"></i>Mantenimiento de Columnas de Bandeja</h2>
          <p class="text-muted mb-0">Gestiona y configura las columnas dinámicas que se visualizan en la bandeja de tareas.</p>
        </div>
        <button class="btn btn-primary shadow-sm rounded-pill px-4" (click)="abrirFormularioCreacion()">
          <i class="bi bi-plus-lg me-1"></i>Nueva Columna
        </button>
      </div>

      <div class="row">
        <!-- List of columns -->
        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-body p-0">
              <div class="table-responsive" style="min-height: 250px;">
                <table class="table table-hover align-middle mb-0">
                  <thead class="bg-light text-muted small text-uppercase">
                    <tr>
                      <th class="ps-4">Título / Label</th>
                      <th>ID / Key</th>
                      <th>Variable Flowable</th>
                      <th>Tipo Formato</th>
                      <th>Estado</th>
                      <th class="text-end pe-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let col of columns">
                      <td class="ps-4 fw-bold text-dark">{{ col.labelName }}</td>
                      <td><code>{{ col.keyName }}</code></td>
                      <td><span class="badge bg-light text-dark border">{{ col.variableName }}</span></td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-primary-subtle text-primary': col.columnType === 'text',
                          'bg-success-subtle text-success': col.columnType === 'currency',
                          'bg-info-subtle text-info': col.columnType === 'number',
                          'bg-warning-subtle text-warning': col.columnType === 'date'
                        }">{{ col.columnType | uppercase }}</span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="col.visible ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'">
                          {{ col.visible ? 'Visible' : 'Oculto' }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <button *ngIf="!esColumnaFija(col.keyName)" class="btn btn-sm btn-outline-danger border-0 rounded-circle" (click)="eliminarColumna(col.id)" title="Eliminar de la DB">
                          <i class="bi bi-trash"></i>
                        </button>
                        <span *ngIf="esColumnaFija(col.keyName)" class="badge bg-light text-muted border small">Fija (Sistema)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Form Card -->
        <div class="col-lg-4" *ngIf="mostrarFormulario">
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-header bg-dark text-white rounded-top-4 py-3">
              <h5 class="card-title mb-0 fw-bold"><i class="bi bi-pencil-square me-2"></i>{{ editandoId ? 'Editar Columna' : 'Nueva Columna DB' }}</h5>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="colForm" (ngSubmit)="guardarColumna()">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted">Título de Columna (Frontend)</label>
                  <input type="text" class="form-control rounded-3" formControlName="labelName" placeholder="Ej: Score de Riesgo" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted">ID de Columna (Key)</label>
                  <input type="text" class="form-control rounded-3" formControlName="keyName" placeholder="Ej: score" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted">Variable en el BPM (Flowable)</label>
                  <input type="text" class="form-control rounded-3" formControlName="variableName" placeholder="Ej: score_riesgo" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted">Tipo de Dato / Formato</label>
                  <select class="form-select rounded-3" formControlName="columnType" required>
                    <option value="text">Texto</option>
                    <option value="currency">Moneda (Dólares)</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                  </select>
                </div>
                <div class="mb-4 form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" formControlName="visible">
                  <label class="form-check-label small fw-semibold text-muted" for="flexSwitchCheckChecked">Visible por defecto</label>
                </div>

                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-outline-secondary w-50 rounded-pill" (click)="cancelarEdicion()">Cancelar</button>
                  <button type="submit" class="btn btn-primary w-50 rounded-pill shadow-sm" [disabled]="colForm.invalid">
                    <i class="bi bi-save me-1"></i>Guardar DB
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ColumnasComponent implements OnInit {
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  columns: any[] = [];
  mostrarFormulario = false;
  editandoId: number | null = null;
  colForm!: FormGroup;

  ngOnInit() {
    this.colForm = this.fb.group({
      keyName: ['', Validators.required],
      labelName: ['', Validators.required],
      variableName: ['', Validators.required],
      columnType: ['text', Validators.required],
      visible: [true]
    });
    this.cargarColumnas();
  }

  cargarColumnas() {
    this.taskService.getDynamicColumns().subscribe({
      next: (data) => this.columns = data,
      error: (err) => console.error('Error al cargar columnas:', err)
    });
  }

  esColumnaFija(key: string): boolean {
    return ['task', 'caseNumber', 'client', 'creditDetails', 'assignee', 'advisor', 'createTime'].includes(key);
  }

  abrirFormularioCreacion() {
    this.mostrarFormulario = true;
    this.editandoId = null;
    this.colForm.reset({ columnType: 'text', visible: true });
  }

  cancelarEdicion() {
    this.mostrarFormulario = false;
    this.editandoId = null;
  }

  guardarColumna() {
    if (this.colForm.invalid) return;
    this.taskService.addColumn(this.colForm.value).subscribe({
      next: () => {
        alert('Columna guardada correctamente en la Base de Datos.');
        this.mostrarFormulario = false;
        this.cargarColumnas();
      },
      error: (err) => {
        console.error('Error al guardar columna:', err);
        alert('Error al intentar guardar la columna.');
      }
    });
  }

  eliminarColumna(id: number) {
    if (confirm('¿Estás seguro que deseas eliminar esta columna de la base de datos?')) {
      this.taskService.deleteColumn(id).subscribe({
        next: () => {
          alert('Columna eliminada correctamente.');
          this.cargarColumnas();
        },
        error: (err) => {
          console.error('Error al eliminar columna:', err);
          alert('Ocurrió un error al intentar eliminar la columna.');
        }
      });
    }
  }
}
