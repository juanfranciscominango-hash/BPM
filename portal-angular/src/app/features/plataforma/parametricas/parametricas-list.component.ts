import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParametricService, ParametricTable } from '../../../core/services/parametric.service';

@Component({
  selector: 'app-parametricas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid p-4 pe-lg-5">
      <div class="d-flex justify-content-between align-items-center mb-4 pe-5">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-list-stars me-2"></i>Tablas Paramétricas</h2>
          <p class="text-muted">Gestiona diccionarios y catálogos de datos reutilizables.</p>
        </div>
        <button class="btn btn-primary shadow-sm" (click)="abrirModal()" style="margin-right: 15rem;">
          <i class="bi bi-plus-lg me-1"></i>Nuevo Catálogo
        </button>
      </div>

      <!-- Barra de búsqueda -->
      <div class="row mb-4">
        <div class="col-md-6 col-lg-5">
          <div class="input-group shadow-sm">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              id="search-tablas"
              type="text"
              class="form-control border-start-0 ps-0"
              placeholder="Buscar tabla por nombre, etiqueta o descripción..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              style="border-radius: 0 8px 8px 0;"
            >
            <button *ngIf="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
              (click)="limpiarBusqueda()" title="Limpiar búsqueda">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
        <div class="col-md-6 col-lg-7 d-flex align-items-center">
          <span class="text-muted small" *ngIf="searchQuery">
            <i class="bi bi-funnel me-1"></i>
            {{ filteredTables.length }} resultado{{ filteredTables.length !== 1 ? 's' : '' }}
            de {{ tables.length }} tablas
          </span>
          <span class="text-muted small" *ngIf="!searchQuery">
            {{ tables.length }} tabla{{ tables.length !== 1 ? 's' : '' }} en total
          </span>
        </div>
      </div>

      <div class="row">
        <div class="col-md-4" *ngFor="let table of paginatedTables">
          <div class="card border-0 shadow-sm mb-4 hover-lift">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title fw-bold text-dark mb-0" [innerHTML]="highlight(table.label)"></h5>
                <span class="badge bg-light text-muted border">PR_{{ table.name.toUpperCase() }}</span>
              </div>
              <p class="text-muted small mb-2">{{ table.description || 'Sin descripción' }}</p>
              <p class="text-muted small mb-3">
                <i class="bi bi-columns me-1"></i>
                <span class="badge bg-secondary me-1" *ngFor="let col of table.columns">{{ col.name }}</span>
              </p>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary flex-grow-1" (click)="gestionarDatos(table)">
                  <i class="bi bi-table me-1"></i>Gestionar Datos
                </button>
                <button class="btn btn-sm btn-outline-secondary" (click)="abrirEdicion(table)" title="Configurar campos">
                  <i class="bi bi-gear"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío cuando no hay resultados -->
        <div class="col-12 text-center py-5" *ngIf="filteredTables.length === 0 && searchQuery">
          <i class="bi bi-search fs-1 text-muted d-block mb-3"></i>
          <h5 class="text-muted">Sin resultados para <strong>"{{ searchQuery }}"</strong></h5>
          <p class="text-muted small">Intenta con otro término o <a href="javascript:void(0)" (click)="limpiarBusqueda()" class="text-primary">limpia la búsqueda</a>.</p>
        </div>
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-center mt-3" *ngIf="totalPages > 1">
        <nav aria-label="Navegación de páginas">
          <ul class="pagination pagination-sm shadow-sm">
            <li class="page-item" [class.disabled]="currentPage === 1">
              <button class="page-link" (click)="changePage(currentPage - 1)" aria-label="Anterior">
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            <li class="page-item" *ngFor="let page of [].constructor(totalPages); let i = index" [class.active]="currentPage === i + 1">
              <button class="page-link" (click)="changePage(i + 1)">{{ i + 1 }}</button>
            </li>
            <li class="page-item" [class.disabled]="currentPage === totalPages">
              <button class="page-link" (click)="changePage(currentPage + 1)" aria-label="Siguiente">
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Modal Edición -->
      <div class="modal fade show d-block" *ngIf="mostrarEdicion" tabindex="-1" style="background: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-secondary text-white">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-gear me-2"></i>Configurar: {{ editTable?.label }}
                <span class="badge bg-light text-dark ms-2 fs-8">PR_{{ editTable?.name?.toUpperCase() }}</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="cerrarEdicion()"></button>
            </div>
            <div class="modal-body p-4">

              <!-- Metadatos editables -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Etiqueta Visual</label>
                  <input type="text" class="form-control" [(ngModel)]="editTable!.label">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Descripción</label>
                  <input type="text" class="form-control" [(ngModel)]="editTable!.description">
                </div>
              </div>
              <div class="d-flex justify-content-end mb-4">
                <button class="btn btn-sm btn-outline-primary" (click)="guardarMetadata()">
                  <i class="bi bi-save me-1"></i>Guardar cambios de nombre/descripción
                </button>
              </div>

              <hr>

              <!-- Columnas actuales -->
              <h6 class="fw-bold mb-2"><i class="bi bi-list-columns me-1"></i>Columnas Actuales</h6>
              <table class="table table-sm table-bordered align-middle mb-4">
                <thead class="table-light">
                  <tr>
                    <th class="notranslate" translate="no">Nombre Técnico</th>
                    <th class="notranslate" translate="no">Etiqueta</th>
                    <th class="notranslate" translate="no">Tipo</th>
                    <th style="width:80px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let col of editTable?.columns">
                    <!-- Nombre Técnico -->
                    <td>
                      <span *ngIf="col.name === 'id' || col.name === 'codigo' || col.name === 'descripcion' || col.name === 'created_at'">
                        <code class="notranslate" translate="no">{{ col.name }}</code>
                      </span>
                      <input *ngIf="col.name !== 'id' && col.name !== 'codigo' && col.name !== 'descripcion' && col.name !== 'created_at'" 
                        type="text" class="form-control form-control-sm font-monospace notranslate" translate="no" [(ngModel)]="col.name"
                        (blur)="guardarColumnaCambios(col)">
                    </td>

                    <!-- Etiqueta -->
                    <td>
                      <input type="text" class="form-control form-control-sm notranslate" translate="no" [(ngModel)]="col.label"
                        (blur)="guardarColumnaCambios(col)">
                    </td>

                    <!-- Tipo -->
                    <td>
                      <span *ngIf="col.name === 'id' || col.name === 'codigo' || col.name === 'descripcion' || col.name === 'created_at'">
                        <span class="badge notranslate" translate="no" [ngClass]="{
                          'bg-primary': col.type === 'string',
                          'bg-secondary': col.type === 'text',
                          'bg-warning text-dark': col.type === 'number',
                          'bg-dark': col.type === 'integer',
                          'bg-info text-dark': col.type === 'boolean',
                          'bg-danger': col.type === 'date',
                          'bg-warning': col.type === 'datetime',
                          'bg-light text-dark': col.type === 'time',
                          'bg-success': col.type === 'reference',
                          'bg-primary border border-success': col.type === 'reference_multiple'
                        }">{{ col.type }}</span>
                      </span>
                      <div *ngIf="col.name !== 'id' && col.name !== 'codigo' && col.name !== 'descripcion' && col.name !== 'created_at'">
                        <select class="form-select form-select-sm notranslate" translate="no" [(ngModel)]="col.type" (change)="cambiarTipoColumna(col)">
                          <option value="string" class="notranslate" translate="no">Texto Corto (VARCHAR)</option>
                          <option value="text" class="notranslate" translate="no">Texto Largo (TEXT)</option>
                          <option value="number" class="notranslate" translate="no">Número Decimal (NUMERIC)</option>
                          <option value="integer" class="notranslate" translate="no">Número Entero (INTEGER)</option>
                          <option value="boolean" class="notranslate" translate="no">Booleano (Sí/No)</option>
                          <option value="date" class="notranslate" translate="no">Fecha (DATE)</option>
                          <option value="datetime" class="notranslate" translate="no">Fecha y Hora (TIMESTAMP)</option>
                          <option value="time" class="notranslate" translate="no">Hora (TIME)</option>
                          <option value="reference" class="notranslate" translate="no">🔗 Referencia (FK)</option>
                          <option value="reference_multiple" class="notranslate" translate="no">🔗 Referencia Múltiple (Array)</option>
                        </select>
                        <select *ngIf="col.type === 'reference' || col.type === 'reference_multiple'" class="form-select form-select-sm mt-1 notranslate" translate="no" [(ngModel)]="col.referencedTableId" (change)="guardarColumnaCambios(col)">
                          <option [ngValue]="null" class="notranslate" translate="no">-- Seleccionar --</option>
                          <option *ngFor="let t of tables" [value]="t.id" class="notranslate" translate="no">{{ t.label }}</option>
                        </select>
                      </div>
                    </td>

                    <!-- Acciones (Eliminar) -->
                    <td class="text-center">
                      <button *ngIf="col.name !== 'id' && col.name !== 'codigo' && col.name !== 'descripcion' && col.name !== 'created_at'"
                        class="btn btn-sm btn-outline-danger" (click)="eliminarColumnaEdit(col)"
                        title="Eliminar columna">
                        <i class="bi bi-trash"></i>
                      </button>
                      <span *ngIf="col.name === 'id' || col.name === 'codigo' || col.name === 'descripcion' || col.name === 'created_at'" class="text-muted small">
                        Fijo
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <hr>

              <!-- Agregar nueva columna -->
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0"><i class="bi bi-plus-circle me-1"></i>Agregar Nueva Columna</h6>
              </div>
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold notranslate" translate="no">Nombre Técnico</label>
                  <input type="text" class="form-control form-control-sm notranslate" translate="no" [(ngModel)]="nuevaColumna.name"
                    placeholder="ej: estado">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold notranslate" translate="no">Etiqueta</label>
                  <input type="text" class="form-control form-control-sm notranslate" translate="no" [(ngModel)]="nuevaColumna.label"
                    placeholder="ej: Estado">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Tipo</label>
                  <select class="form-select form-select-sm notranslate" translate="no" [(ngModel)]="nuevaColumna.type" (change)="onTipoNuevaColumna()">
                    <option value="string" class="notranslate" translate="no">Texto Corto (VARCHAR)</option>
                    <option value="text" class="notranslate" translate="no">Texto Largo (TEXT)</option>
                    <option value="number" class="notranslate" translate="no">Número Decimal (NUMERIC)</option>
                    <option value="integer" class="notranslate" translate="no">Número Entero (INTEGER)</option>
                    <option value="boolean" class="notranslate" translate="no">Booleano (Sí/No)</option>
                    <option value="date" class="notranslate" translate="no">Fecha (DATE)</option>
                    <option value="datetime" class="notranslate" translate="no">Fecha y Hora (TIMESTAMP)</option>
                    <option value="time" class="notranslate" translate="no">Hora (TIME)</option>
                    <option value="reference" class="notranslate" translate="no">🔗 Referencia (FK)</option>
                    <option value="reference_multiple" class="notranslate" translate="no">🔗 Referencia Múltiple (Array)</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold" *ngIf="nuevaColumna.type === 'reference' || nuevaColumna.type === 'reference_multiple'">Tabla Destino</label>
                  <select class="form-select form-select-sm" *ngIf="nuevaColumna.type === 'reference' || nuevaColumna.type === 'reference_multiple'"
                    [(ngModel)]="nuevaColumna.referencedTableId">
                    <option [value]="null">-- Seleccionar --</option>
                    <option *ngFor="let t of tables" [value]="t.id">{{ t.label }}</option>
                  </select>
                  <button class="btn btn-sm btn-success w-100" (click)="agregarColumnaEdit()"
                    *ngIf="nuevaColumna.type !== 'reference' && nuevaColumna.type !== 'reference_multiple'" [disabled]="!nuevaColumna.name">
                    <i class="bi bi-plus-lg me-1"></i>Agregar
                  </button>
                  <button class="btn btn-sm btn-success w-100 mt-1" (click)="agregarColumnaEdit()"
                    *ngIf="nuevaColumna.type === 'reference' || nuevaColumna.type === 'reference_multiple'" [disabled]="!nuevaColumna.name || !nuevaColumna.referencedTableId">
                    <i class="bi bi-link-45deg me-1"></i>Agregar FK
                  </button>
                </div>
              </div>

            </div>
            <div class="modal-footer bg-light border-0 d-flex justify-content-between">
              <button class="btn btn-outline-danger" (click)="eliminarCatalogo()" [disabled]="guardando">
                <i class="bi bi-trash3-fill me-1"></i>Eliminar Catálogo
              </button>
              <button class="btn btn-outline-secondary" (click)="cerrarEdicion()">
                <i class="bi bi-x-lg me-1"></i>Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade show d-block" *ngIf="mostrarModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold"><i class="bi bi-plus-circle me-2"></i>Crear Nuevo Catálogo</h5>
              <button type="button" class="btn-close btn-close-white" (click)="mostrarModal = false"></button>
            </div>
            <div class="modal-body p-4">

              <!-- Info general -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Nombre Técnico <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="newTable.name"
                    placeholder="ej: tipo_documento" (input)="limpiarNombre()">
                  <div class="form-text">Sin espacios ni caracteres especiales.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Etiqueta Visual <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="newTable.label"
                    placeholder="ej: Tipos de Documento">
                </div>
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold">Descripción</label>
                <textarea class="form-control" [(ngModel)]="newTable.description" rows="2"></textarea>
              </div>

              <!-- Columnas automáticas -->
              <div class="alert alert-info py-2 small mb-3">
                <i class="bi bi-info-circle me-2"></i>
                Columnas creadas automáticamente:
                <span class="badge bg-primary ms-1">id</span>
                <span class="badge bg-primary ms-1">codigo</span>
                <span class="badge bg-primary ms-1">descripcion</span>
                <span class="badge bg-secondary ms-1">created_at</span>
              </div>

              <!-- Columnas adicionales -->
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-semibold mb-0">Columnas Adicionales</label>
                <button class="btn btn-sm btn-outline-success" (click)="agregarColumna()">
                  <i class="bi bi-plus-lg me-1"></i>Agregar Columna
                </button>
              </div>

              <div *ngIf="columnasAdicionales.length === 0" class="text-center text-muted py-3 border rounded bg-light small">
                <i class="bi bi-columns bi-lg d-block mb-1"></i>
                No hay columnas adicionales. Las tablas paramétricas básicas solo usan <code>codigo</code> y <code>descripcion</code>.
              </div>

              <div class="table-responsive" *ngIf="columnasAdicionales.length > 0">
                <table class="table table-sm table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Nombre Técnico</th>
                      <th>Etiqueta</th>
                      <th>Tipo de Dato</th>
                      <th style="width:50px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let col of columnasAdicionales; let i = index">
                      <td>
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="col.name"
                          placeholder="ej: telefono">
                      </td>
                      <td>
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="col.label"
                          placeholder="ej: Teléfono">
                      </td>
                      <td>
                        <select class="form-select form-select-sm" [(ngModel)]="col.type" (change)="onTipoChange(col)">
                          <option value="string">Texto (VARCHAR)</option>
                          <option value="number">Número (NUMERIC)</option>
                          <option value="boolean">Booleano</option>
                          <option value="reference">🔗 Referencia a Tabla</option>
                          <option value="reference_multiple">🔗 Referencia Múltiple</option>
                        </select>
                        <!-- Selector de tabla referenciada -->
                        <select class="form-select form-select-sm mt-1" *ngIf="col.type === 'reference' || col.type === 'reference_multiple'"
                          [(ngModel)]="col.referencedTableId" (change)="onReferenciaChange(col)">
                          <option [value]="null" disabled selected>-- Selecciona tabla --</option>
                          <option *ngFor="let t of tables" [value]="t.id">
                            {{ t.label }} (PR_{{ t.name.toUpperCase() }})
                          </option>
                        </select>
                        <div *ngIf="(col.type === 'reference' || col.type === 'reference_multiple') && col.referencedTableId" class="text-success small mt-1">
                          <i class="bi bi-link-45deg"></i> FK → PR_{{ getRefTableName(col.referencedTableId) }}(id)
                        </div>
                      </td>
                      <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger" (click)="eliminarColumna(i)" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-outline-secondary" (click)="mostrarModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary px-4" (click)="crearCatalogo()"
                [disabled]="!newTable.name || !newTable.label || guardando">
                <span *ngIf="guardando" class="spinner-border spinner-border-sm me-1"></span>
                {{ guardando ? 'Creando...' : 'Crear Catálogo' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-lift { transition: transform 0.2s; }
    .hover-lift:hover { transform: translateY(-5px); }
    .search-highlight { background-color: #fff3cd; border-radius: 3px; padding: 0 2px; font-weight: 600; }
  `]
})
export class ParametricasListComponent implements OnInit {
  private parametricService = inject(ParametricService);
  private router = inject(Router);

  tables: ParametricTable[] = [];
  filteredTables: ParametricTable[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 12;
  mostrarModal = false;
  guardando = false;
  newTable: any = { name: '', label: '', description: '' };
  columnasAdicionales: {
    name: string;
    label: string;
    type: string;
    primaryKey: boolean;
    referencedTableId: number | null;
    referencedTableLabel: string;
  }[] = [];

  // — Edición —
  mostrarEdicion = false;
  editTable: ParametricTable | null = null;
  nuevaColumna: any = { name: '', label: '', type: 'string', primaryKey: false, referencedTableId: null };

  get paginatedTables() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredTables.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredTables.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnInit() { this.cargarTablas(); }

  cargarTablas() {
    this.parametricService.getTables().subscribe({
      next: data => {
        this.tables = data;
        this.applyFilter();
      },
      error: err => console.error('Error cargando tablas:', err)
    });
  }

  onSearch() {
    this.applyFilter();
  }

  applyFilter() {
    const q = this.searchQuery.trim().toLowerCase();
    this.currentPage = 1; // Reset to first page on search
    if (!q) {
      this.filteredTables = [...this.tables];
      return;
    }
    this.filteredTables = this.tables.filter(t =>
      t.label.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }

  limpiarBusqueda() {
    this.searchQuery = '';
    this.applyFilter();
  }

  highlight(text: string): string {
    if (!this.searchQuery.trim()) return text;
    const escaped = this.searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return text.replace(re, '<mark class="search-highlight">$1</mark>');
  }

  abrirModal() {
    this.newTable = { name: '', label: '', description: '' };
    this.columnasAdicionales = [];
    this.mostrarModal = true;
  }

  limpiarNombre() {
    this.newTable.name = this.newTable.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  }

  agregarColumna() {
    this.columnasAdicionales.push({
      name: '', label: '', type: 'string',
      primaryKey: false, referencedTableId: null, referencedTableLabel: ''
    });
  }

  eliminarColumna(index: number) {
    this.columnasAdicionales.splice(index, 1);
  }

  onTipoChange(col: any) {
    col.referencedTableId = null;
    col.referencedTableLabel = '';
  }

  onReferenciaChange(col: any) {
    const ref = this.tables.find(t => t.id == col.referencedTableId);
    if (ref) {
      col.referencedTableLabel = ref.label;
      if (!col.name) col.name = ref.name.toLowerCase() + '_id';
      if (!col.label) col.label = ref.label;
    }
  }

  getRefTableName(refId: any): string {
    const ref = this.tables.find(t => t.id == refId);
    return ref ? ref.name.toUpperCase() : '?';
  }

  crearCatalogo() {
    const defaultColumns = [
      { name: 'codigo', label: 'Código', type: 'string', primaryKey: false },
      { name: 'descripcion', label: 'Descripción', type: 'string', primaryKey: false }
    ];

    const payload: ParametricTable = {
      ...this.newTable,
      columns: [...defaultColumns, ...this.columnasAdicionales.filter(c => c.name.trim() !== '')]
    };

    this.guardando = true;
    this.parametricService.saveTable(payload).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.guardando = false;
        this.cargarTablas();
      },
      error: () => {
        this.guardando = false;
        alert('Error al crear catálogo. Verifica que el nombre técnico no exista ya.');
      }
    });
  }

  gestionarDatos(table: ParametricTable) {
    this.router.navigate(['/plataforma/parametricas', table.id, 'datos']);
  }

  // ─── EDICIÓN ───────────────────────────────────────────────
  abrirEdicion(table: ParametricTable) {
    this.editTable = JSON.parse(JSON.stringify(table)); // deep copy
    this.nuevaColumna = { name: '', label: '', type: 'string', primaryKey: false, referencedTableId: null };
    this.mostrarEdicion = true;
  }

  cerrarEdicion() {
    this.mostrarEdicion = false;
    this.editTable = null;
    this.cargarTablas();
  }

  guardarMetadata() {
    if (!this.editTable) return;
    const payload = { label: this.editTable.label, description: this.editTable.description || '' };
    this.parametricService.updateTableMeta(this.editTable.id!, payload).subscribe({
      next: () => alert('Metadatos guardados'),
      error: () => alert('Error al guardar metadatos')
    });
  }

  guardarColumnaCambios(col: any) {
    if (!col.name.trim()) return;
    this.parametricService.updateColumn(col.id, col).subscribe({
      next: () => console.log('Columna actualizada con éxito'),
      error: (e) => alert('Error al guardar cambios de la columna: ' + (e.error?.error || e.message))
    });
  }

  cambiarTipoColumna(col: any) {
    if (col.type !== 'reference' && col.type !== 'reference_multiple') {
      col.referencedTableId = null;
      this.guardarColumnaCambios(col);
    }
  }

  eliminarColumnaEdit(col: any) {
    if (!this.editTable || !confirm(`¿Eliminar la columna "${col.name}" y todos sus datos?`)) return;
    this.parametricService.removeColumn(this.editTable.id!, col.id).subscribe({
      next: () => {
        this.editTable!.columns = this.editTable!.columns!.filter(c => c.id !== col.id);
      },
      error: (e) => alert('Error al eliminar columna: ' + (e.error?.error || e.message))
    });
  }

  agregarColumnaEdit() {
    if (!this.editTable || !this.nuevaColumna.name.trim()) return;
    this.parametricService.addColumn(this.editTable.id!, this.nuevaColumna).subscribe({
      next: (col) => {
        this.editTable!.columns = [...(this.editTable!.columns || []), col];
        this.nuevaColumna = { name: '', label: '', type: 'string', primaryKey: false, referencedTableId: null };
      },
      error: (e) => alert('Error al agregar columna: ' + (e.error?.error || e.message))
    });
  }

  onTipoNuevaColumna() {
    this.nuevaColumna.referencedTableId = null;
  }

  eliminarCatalogo() {
    if (!this.editTable) return;
    const expectedName = `PR_${this.editTable.name.toUpperCase()}`;
    const confirmName = prompt(`ATENCIÓN: Esta acción eliminará físicamente la tabla "${expectedName}" y todos sus registros de forma IRREVERSIBLE.\n\nPara confirmar, escribe el nombre técnico de la tabla a continuación:`);
    
    if (confirmName !== expectedName) {
      if (confirmName !== null) {
        alert('El nombre ingresado no coincide. Eliminación cancelada.');
      }
      return;
    }

    this.guardando = true;
    this.parametricService.deleteTable(this.editTable.id!).subscribe({
      next: () => {
        alert('Catálogo eliminado con éxito.');
        this.mostrarEdicion = false;
        this.editTable = null;
        this.cargarTablas();
        this.guardando = false;
      },
      error: (e) => {
        this.guardando = false;
        alert('Error al eliminar catálogo: ' + (e.error?.error || e.message));
      }
    });
  }
}
