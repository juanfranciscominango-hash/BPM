import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetaService, MetaAttribute, MetaEntity } from '../../../core/services/meta.service';
import { ParametricService, ParametricTable } from '../../../core/services/parametric.service';

@Component({
  selector: 'app-atributos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb bg-transparent p-0">
          <li class="breadcrumb-item"><a routerLink="/plataforma/entidades" class="text-decoration-none">Entidades</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ entity?.label || 'Cargando...' }}</li>
        </ol>
      </nav>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 text-gray-800">Campos de "{{ entity?.label }}"</h2>
          <p class="text-muted mb-0">Define los atributos y tipos de datos para esta tabla virtual.</p>
        </div>
        <button class="btn btn-primary shadow-sm px-4" (click)="abrirModal()">
          <i class="bi bi-plus-lg me-2"></i>Agregar Campo
        </button>
      </div>

      <div class="card shadow border-0 overflow-hidden">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="px-4 py-3" style="width: 250px;">Etiqueta (UI)</th>
                  <th class="py-3">Nombre Técnico</th>
                  <th class="py-3">Tipo de Dato</th>
                  <th class="py-3 text-center">Obligatorio</th>
                  <th class="py-3 text-center" style="width: 100px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let attr of attributes">
                  <td class="px-4 fw-bold text-dark">{{ attr.label }}</td>
                  <td><code class="text-primary bg-light px-2 py-1 rounded">{{ attr.name }}</code></td>
                  <td>
                    <span class="badge rounded-pill" [ngClass]="getTypeBadgeClass(attr.type)">
                      {{ attr.type }}
                    </span>
                    <span *ngIf="attr.fieldSize && (attr.type === 'STRING' || attr.type === 'NUMBER')"
                      class="badge bg-light text-secondary border ms-1" style="font-size:0.7rem; font-family: monospace;">
                      {{ attr.type === 'STRING' ? 'VARCHAR(' + attr.fieldSize + ')' : 'NUMERIC(' + attr.fieldSize + ')' }}
                    </span>
                    <small *ngIf="attr.type === 'PARAMETRICA'" class="text-muted d-block mt-1">
                      Catálogo ID: {{ attr.parametricTableId }}
                    </small>
                  </td>
                  <td class="text-center">
                    <span *ngIf="attr.required" class="badge bg-success-subtle text-success border border-success-subtle px-2">
                      SÍ
                    </span>
                    <span *ngIf="!attr.required" class="badge bg-light text-muted border px-2">
                      NO
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary border-0 rounded-circle me-1"
                      (click)="editarAtributo(attr)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-circle" (click)="eliminar(attr.id!)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="attributes.length === 0">
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-list-task fs-1 d-block mb-2"></i>
                    No hay campos definidos para esta tabla todavía.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i class="bi me-2" [class.bi-plus-circle]="!editingAttrId" [class.bi-pencil-square]="editingAttrId"></i>
              {{ editingAttrId ? 'Editar Campo' : 'Configurar Nuevo Campo' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="cerrarModal()"></button>
          </div>
          <div class="modal-body p-4">
            <form [formGroup]="form">
              <div class="mb-3">
                <label class="form-label fw-bold text-dark">Etiqueta Visible</label>
                <input type="text" class="form-control shadow-none" formControlName="label" placeholder="ej: Fecha de Nacimiento">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-dark">Nombre Técnico</label>
                <input type="text" class="form-control shadow-none" formControlName="name"
                  placeholder="ej: fecha_nacimiento"
                  (input)="sanitizarNombre($event)">
                <div class="form-text text-danger" *ngIf="form.get('name')?.invalid && form.get('name')?.dirty">
                  Solo letras minúsculas, números y guión bajo. Sin espacios ni mayúsculas.
                </div>
              </div>
              <div class="row">
                <div class="col-md-7 mb-3">
                  <label class="form-label fw-bold text-dark">Tipo de Dato</label>
                  <select class="form-select shadow-none" formControlName="type">
                    <option value="STRING">Texto Corto (String)</option>
                    <option value="TEXT">Texto Largo (TextArea)</option>
                    <option value="NUMBER">Número (Integer/Decimal)</option>
                    <option value="DATE">Fecha (DatePicker)</option>
                    <option value="BOOLEAN">Booleano (Switch)</option>
                    <option value="PARAMETRICA">Catálogo (Tabla Paramétrica)</option>
                  </select>
                </div>
                <div class="col-md-5 mb-3 d-flex align-items-end pb-2">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" formControlName="required" id="reqSwitch">
                    <label class="form-check-label fw-bold" for="reqSwitch">Obligatorio</label>
                  </div>
                </div>
              </div>

              <!-- Tamaño del campo (sólo STRING o NUMBER) -->
              <div class="row mb-3" *ngIf="form.get('type')?.value === 'STRING' || form.get('type')?.value === 'NUMBER'">
                <div class="col-md-7">
                  <label class="form-label fw-bold text-dark">
                    <i class="bi bi-rulers me-1"></i>
                    <ng-container *ngIf="form.get('type')?.value === 'STRING'">Longitud Máxima (caracteres)</ng-container>
                    <ng-container *ngIf="form.get('type')?.value === 'NUMBER'">Precisión (dígitos)</ng-container>
                  </label>
                  <div class="input-group">
                    <select class="form-select shadow-none" formControlName="fieldSizePreset"
                      (change)="onFieldSizePreset($event)">
                      <ng-container *ngIf="form.get('type')?.value === 'STRING'">
                        <option value="50">50 — Texto corto (nombre)</option>
                        <option value="100">100 — Texto medio</option>
                        <option value="255">255 — Estándar (defecto)</option>
                        <option value="500">500 — Descripción</option>
                        <option value="1000">1000 — Texto extenso</option>
                        <option value="custom">✏️ Personalizado...</option>
                      </ng-container>
                      <ng-container *ngIf="form.get('type')?.value === 'NUMBER'">
                        <option value="5">5 dígitos (entero pequeño)</option>
                        <option value="10">10 dígitos (entero estándar)</option>
                        <option value="15">15 dígitos (moneda)</option>
                        <option value="18">18 dígitos (alta precisión)</option>
                      </ng-container>
                    </select>
                    <input *ngIf="showCustomSize"
                      type="number" class="form-control shadow-none" formControlName="fieldSize"
                      placeholder="ej: 300" min="1" max="8000" style="max-width:110px">
                  </div>
                  <div class="form-text text-muted mt-1">
                    <i class="bi bi-info-circle me-1"></i>
                    <ng-container *ngIf="form.get('type')?.value === 'STRING'">
                      Genera <code>VARCHAR({{ form.get('fieldSize')?.value || 255 }})</code>
                    </ng-container>
                    <ng-container *ngIf="form.get('type')?.value === 'NUMBER'">
                      Genera <code>NUMERIC({{ form.get('fieldSize')?.value || 10 }})</code>
                    </ng-container>
                  </div>
                </div>
              </div>

              <!-- Selector de Tabla Paramétrica (Solo si el tipo es PARAMETRICA) -->
              <div class="mb-3 animate__animated animate__fadeIn" *ngIf="form.get('type')?.value === 'PARAMETRICA'">
                <label class="form-label fw-bold text-primary"><i class="bi bi-list-stars me-2"></i>Seleccionar Catálogo</label>
                <select class="form-select border-primary shadow-none" formControlName="parametricTableId">
                  <option [ngValue]="null">-- Seleccione un catálogo --</option>
                  <option *ngFor="let table of parametricTables" [value]="table.id">{{ table.label }} (PR_{{ table.name }})</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-outline-secondary px-4" (click)="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-primary px-4 shadow-sm"
              [disabled]="form.invalid || (form.get('type')?.value === 'PARAMETRICA' && !form.get('parametricTableId')?.value)"
              (click)="guardar()">
              <i class="bi bi-save me-2"></i>{{ editingAttrId ? 'Actualizar Campo' : 'Guardar Campo' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="showModal" class="modal-backdrop fade show"></div>
  `,
  styles: [`
    .breadcrumb-item + .breadcrumb-item::before { content: "›"; font-size: 1.2rem; vertical-align: middle; }
    .modal.show { background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); }
    .table thead th { font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
  `]
})
export class AtributosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private metaService = inject(MetaService);
  private parametricService = inject(ParametricService);
  private fb = inject(FormBuilder);

  entityId!: number;
  entity: MetaEntity | null = null;
  attributes: MetaAttribute[] = [];
  parametricTables: ParametricTable[] = [];
  showModal = false;
  editingAttrId: number | null = null;  // null = crear, number = editar
  showCustomSize = false;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name:              ['', [Validators.required, Validators.pattern('^[a-z0-9_]+$')]],
      label:             ['', Validators.required],
      type:              ['STRING', Validators.required],
      required:          [false],
      parametricTableId: [null],
      fieldSize:         [255],
      fieldSizePreset:   ['255']
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.entityId = Number(params.get('id'));
      this.cargarDatos();
      this.cargarTablasParametricas();
    });
  }

  cargarTablasParametricas() {
    this.parametricService.getTables().subscribe(tables => this.parametricTables = tables);
  }

  cargarDatos() {
    this.metaService.listarEntidades().subscribe(entities => {
      this.entity = entities.find(e => e.id === this.entityId) || null;
    });

    this.metaService.listarAtributos(this.entityId).subscribe(res => {
      this.attributes = res;
    });
  }

  abrirModal() {
    this.editingAttrId = null;
    this.showCustomSize = false;
    this.form.reset({
      type: 'STRING', required: false,
      parametricTableId: null, name: '', label: '',
      fieldSize: 255, fieldSizePreset: '255'
    });
    this.form.get('name')?.enable();
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.editingAttrId = null;
  }

  editarAtributo(attr: MetaAttribute) {
    this.editingAttrId = attr.id!;
    this.showCustomSize = false;
    this.form.patchValue({
      name:              attr.name,
      label:             attr.label,
      type:              attr.type,
      required:          attr.required,
      parametricTableId: attr.parametricTableId ?? null,
      fieldSize:         attr.fieldSize ?? 255,
      fieldSizePreset:   String(attr.fieldSize ?? 255)
    });
    // El nombre técnico no se puede cambiar (afectaría la BD)
    this.form.get('name')?.disable();
    this.showModal = true;
  }

  onFieldSizePreset(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    if (val === 'custom') {
      this.showCustomSize = true;
      this.form.get('fieldSize')?.setValue(null);
    } else {
      this.showCustomSize = false;
      this.form.get('fieldSize')?.setValue(Number(val));
    }
  }

  sanitizarNombre(event: Event) {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    this.form.get('name')?.setValue(cleaned, { emitEvent: false });
    input.value = cleaned;
  }

  guardar() {
    if (this.form.valid || (this.editingAttrId && this.form.get('label')?.valid)) {
      if (this.editingAttrId) {
        // MODO EDICIÓN
        const payload = {
          name:             this.form.get('name')?.value,
          label:            this.form.get('label')?.value,
          type:             this.form.get('type')?.value,
          required:         this.form.get('required')?.value,
          parametricTableId: this.form.get('parametricTableId')?.value,
          fieldSize:        this.form.get('fieldSize')?.value
        };
        this.metaService.actualizarAtributo(this.editingAttrId, payload as MetaAttribute).subscribe(() => {
          this.cargarDatos();
          this.cerrarModal();
        });
      } else {
        // MODO CREACIÓN
        const payload: MetaAttribute = {
          ...this.form.value,
          entity: { id: this.entityId }
        };
        this.metaService.guardarAtributo(payload).subscribe(() => {
          this.cargarDatos();
          this.cerrarModal();
        });
      }
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este campo? Esta acción no se puede deshacer.')) {
      this.metaService.eliminarAtributo(id).subscribe(() => this.cargarDatos());
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'STRING': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'NUMBER': return 'bg-success-subtle text-success border border-success-subtle';
      case 'DATE': return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'BOOLEAN': return 'bg-info-subtle text-info border border-info-subtle';
      default: return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }
}
