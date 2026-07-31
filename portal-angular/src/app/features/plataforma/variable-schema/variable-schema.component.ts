import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VariableSchemaService, ProcessVariableSchema } from '../../../core/services/variable-schema.service';
import { ProcessService } from '../../../core/services/process.service';

@Component({
  selector: 'app-variable-schema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="h4 mb-0 text-primary fw-bold">
            <i class="bi bi-diagram-2 me-2"></i>Esquema de Variables de Proceso
          </h2>
          <p class="text-muted mb-0 small">
            Define y valida las variables tipadas por proceso. Garantiza integridad de datos.
          </p>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <select class="form-select form-select-sm rounded-3" style="min-width:240px;"
            [(ngModel)]="selectedProcess" (change)="onProcessChange()">
            <option value="">— Seleccionar proceso —</option>
            <option *ngFor="let p of processes" [value]="p.key">
              {{ p.name || p.key }}
            </option>
          </select>
          <button class="btn btn-sm btn-primary rounded-3 px-3"
            (click)="nuevoSchema()" [disabled]="!selectedProcess">
            <i class="bi bi-plus-lg me-1"></i>Nueva Variable
          </button>
        </div>
      </div>

      <!-- Info banner si no hay proceso seleccionado -->
      <div *ngIf="!selectedProcess" class="alert alert-info border-0 rounded-4 shadow-sm">
        <i class="bi bi-info-circle-fill me-2"></i>
        Selecciona un proceso del desplegable para ver y gestionar su esquema de variables.
      </div>

      <!-- Formulario nuevo/editar -->
      <div *ngIf="showForm && selectedProcess" class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-3">
            <i class="bi bi-pencil-square me-2 text-primary"></i>
            {{ editing ? 'Editar Variable' : 'Nueva Variable' }}
            <small class="text-muted fw-normal ms-2 small">— {{ selectedProcess }}</small>
          </h5>
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Nombre de variable <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm rounded-3 font-monospace"
                [(ngModel)]="form.variableName" placeholder="ej: monto, identificacion">
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Etiqueta UI</label>
              <input type="text" class="form-control form-control-sm rounded-3"
                [(ngModel)]="form.label" placeholder="ej: Monto del Préstamo">
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Tipo de dato <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm rounded-3" [(ngModel)]="form.dataType">
                <option value="STRING">STRING (texto)</option>
                <option value="NUMBER">NUMBER (número)</option>
                <option value="BOOLEAN">BOOLEAN (sí/no)</option>
                <option value="DATE">DATE (fecha)</option>
                <option value="OBJECT">OBJECT (JSON)</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Valor por defecto</label>
              <input type="text" class="form-control form-control-sm rounded-3"
                [(ngModel)]="form.defaultValue" placeholder="ej: 0, true, PENDIENTE">
            </div>
            <div class="col-md-1">
              <label class="form-label small fw-semibold">Orden</label>
              <input type="number" class="form-control form-control-sm rounded-3"
                [(ngModel)]="form.sortOrder" min="0">
            </div>
            <div class="col-md-1 d-flex align-items-end">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" [(ngModel)]="form.required" id="chkRequired">
                <label class="form-check-label small fw-semibold" for="chkRequired">Obligatorio</label>
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">
                Expresión de validación (regex)
                <span class="text-muted fw-normal">(solo STRING)</span>
              </label>
              <input type="text" class="form-control form-control-sm rounded-3 font-monospace"
                [(ngModel)]="form.validationExpression" placeholder="ej: ^[0-9]{10}$ para cédula">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Mensaje de error de validación</label>
              <input type="text" class="form-control form-control-sm rounded-3"
                [(ngModel)]="form.validationMessage" placeholder="ej: La cédula debe tener 10 dígitos">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Descripción</label>
              <input type="text" class="form-control form-control-sm rounded-3"
                [(ngModel)]="form.description" placeholder="Descripción breve para documentación">
            </div>
          </div>
          <div class="mt-4 d-flex gap-2">
            <button class="btn btn-primary btn-sm rounded-3 px-4"
              (click)="guardar()"
              [disabled]="!form.variableName || !form.dataType">
              <i class="bi bi-check-lg me-1"></i>Guardar
            </button>
            <button class="btn btn-light btn-sm border rounded-3 px-4" (click)="showForm = false">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de variables -->
      <div *ngIf="selectedProcess" class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-4">#</th>
                  <th>Variable</th>
                  <th>Etiqueta</th>
                  <th class="text-center">Tipo</th>
                  <th class="text-center">Obligatorio</th>
                  <th>Default</th>
                  <th>Validación</th>
                  <th class="text-center">Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="loading">
                  <td colspan="9" class="text-center py-5">
                    <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                    Cargando esquema...
                  </td>
                </tr>
                <tr *ngIf="!loading && schemas.length === 0">
                  <td colspan="9" class="text-center py-5 text-muted">
                    <i class="bi bi-diagram-2 fs-2 d-block mb-2"></i>
                    No hay variables definidas para este proceso.
                    Haz clic en "Nueva Variable" para comenzar.
                  </td>
                </tr>
                <tr *ngFor="let s of schemas">
                  <td class="ps-4 text-muted small">{{ s.sortOrder }}</td>
                  <td>
                    <code class="text-primary fw-bold">{{ s.variableName }}</code>
                    <div *ngIf="s.description" class="text-muted small">{{ s.description }}</div>
                  </td>
                  <td class="fw-semibold">{{ s.label || '—' }}</td>
                  <td class="text-center">
                    <span class="badge rounded-pill border px-3 py-1 small"
                      [ngClass]="{
                        'bg-info bg-opacity-10 text-info border-info border-opacity-25': s.dataType === 'STRING',
                        'bg-success bg-opacity-10 text-success border-success border-opacity-25': s.dataType === 'NUMBER',
                        'bg-warning bg-opacity-10 text-warning border-warning border-opacity-25': s.dataType === 'BOOLEAN',
                        'bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25': s.dataType === 'DATE' || s.dataType === 'OBJECT'
                      }">
                      {{ s.dataType }}
                    </span>
                  </td>
                  <td class="text-center">
                    <i *ngIf="s.required" class="bi bi-check-circle-fill text-success fs-5"></i>
                    <i *ngIf="!s.required" class="bi bi-dash-circle text-muted fs-5"></i>
                  </td>
                  <td>
                    <code *ngIf="s.defaultValue" class="text-muted small">{{ s.defaultValue }}</code>
                    <span *ngIf="!s.defaultValue" class="text-muted small">—</span>
                  </td>
                  <td>
                    <span *ngIf="s.validationExpression" class="badge bg-light text-dark border small" title="{{ s.validationMessage }}">
                      <i class="bi bi-regex me-1"></i>{{ s.validationExpression | slice:0:20 }}...
                    </span>
                    <span *ngIf="!s.validationExpression" class="text-muted small">—</span>
                  </td>
                  <td class="text-center">
                    <span *ngIf="s.active" class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2">Activo</span>
                    <span *ngIf="!s.active" class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2">Inactivo</span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary rounded-circle me-1" (click)="editar(s)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-circle" (click)="eliminar(s)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Resumen stats -->
      <div *ngIf="schemas.length > 0" class="row g-3 mt-3">
        <div class="col-auto">
          <div class="p-3 rounded-4 border shadow-sm bg-white text-center" style="min-width:120px">
            <div class="fw-bold fs-4 text-primary">{{ schemas.length }}</div>
            <div class="text-muted small">Total variables</div>
          </div>
        </div>
        <div class="col-auto">
          <div class="p-3 rounded-4 border shadow-sm bg-white text-center" style="min-width:120px">
            <div class="fw-bold fs-4 text-danger">{{ obligatoriasCount }}</div>
            <div class="text-muted small">Obligatorias</div>
          </div>
        </div>
        <div class="col-auto">
          <div class="p-3 rounded-4 border shadow-sm bg-white text-center" style="min-width:120px">
            <div class="fw-bold fs-4 text-warning">{{ conValidacionCount }}</div>
            <div class="text-muted small">Con validación regex</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VariableSchemaComponent implements OnInit {
  private schemaService = inject(VariableSchemaService);
  private processService = inject(ProcessService);

  processes: any[] = [];
  schemas: ProcessVariableSchema[] = [];
  selectedProcess = '';
  loading = false;
  showForm = false;
  editing = false;
  form: ProcessVariableSchema = this.emptyForm();

  get obligatoriasCount() { return this.schemas.filter(s => s.required).length; }
  get conValidacionCount() { return this.schemas.filter(s => !!s.validationExpression).length; }

  ngOnInit() {
    this.processService.getProcesses().subscribe({
      next: (data) => this.processes = data || [],
      error: () => {}
    });
  }

  onProcessChange() {
    if (!this.selectedProcess) { this.schemas = []; return; }
    this.cargarSchemas();
  }

  cargarSchemas() {
    this.loading = true;
    this.showForm = false;
    this.schemaService.getByProcess(this.selectedProcess).subscribe({
      next: (data) => { this.schemas = data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  nuevoSchema() {
    this.form = this.emptyForm();
    this.form.processDefinitionKey = this.selectedProcess;
    this.form.sortOrder = this.schemas.length;
    this.editing = false;
    this.showForm = true;
  }

  editar(s: ProcessVariableSchema) {
    this.form = { ...s };
    this.editing = true;
    this.showForm = true;
  }

  guardar() {
    this.schemaService.save(this.form).subscribe({
      next: () => { this.showForm = false; this.cargarSchemas(); },
      error: (err) => {
        console.error('Error al guardar', err);
        alert('Error al guardar la variable. Verifique que el nombre no esté duplicado.');
      }
    });
  }

  eliminar(s: ProcessVariableSchema) {
    if (!confirm(`¿Eliminar la variable "${s.variableName}"?`)) return;
    this.schemaService.delete(s.id!).subscribe({
      next: () => this.cargarSchemas(),
      error: () => alert('Error al eliminar la variable.')
    });
  }

  private emptyForm(): ProcessVariableSchema {
    return {
      processDefinitionKey: '',
      variableName: '',
      label: '',
      dataType: 'STRING',
      required: false,
      defaultValue: '',
      description: '',
      validationExpression: '',
      validationMessage: '',
      sortOrder: 0,
      active: true
    };
  }
}
