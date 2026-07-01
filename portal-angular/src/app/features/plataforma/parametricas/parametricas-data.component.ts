import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParametricService, ParametricTable } from '../../../core/services/parametric.service';

@Component({
  selector: 'app-parametricas-data',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid p-4" *ngIf="table" style="max-width: 100%; overflow: hidden;">
      <div class="d-flex justify-content-between align-items-center mb-4 pe-5">
        <div>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
              <li class="breadcrumb-item"><a routerLink="/plataforma/parametricas">Catálogos</a></li>
              <li class="breadcrumb-item active">{{ table.label }}</li>
            </ol>
          </nav>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-table me-2"></i>Registros: {{ table.label }}</h2>
        </div>
        <button class="btn btn-primary shadow-sm" (click)="abrirModalNuevo()" style="margin-right: 15rem;">
          <i class="bi bi-plus-lg me-1"></i>Nuevo Registro
        </button>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-4">ID</th>
                  <th *ngFor="let col of table.columns" class="notranslate" translate="no">{{ col.label }}</th>
                  <th class="text-center" style="width: 100px;">Acciones</th>
                  <th>Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of rows">
                  <td class="ps-4"><span class="text-muted">{{ row.id }}</span></td>
                  <td *ngFor="let col of table.columns" class="notranslate" translate="no">
                    <!-- Si es booleano, mostrar Sí o No -->
                    <span *ngIf="col.type === 'boolean'" class="badge" [ngClass]="row[col.name.toLowerCase()] ? 'bg-success' : 'bg-danger'">
                      {{ row[col.name.toLowerCase()] ? 'ACTIVO' : 'INACTIVO' }}
                    </span>
                    <!-- Si es una referencia a otra paramétrica -->
                    <span *ngIf="col.type === 'reference'">
                      <span class="badge bg-light text-dark border">
                        {{ obtenerTextoReferencia(col.name, row[col.name.toLowerCase()]) }}
                      </span>
                    </span>
                    <!-- Si es referencia múltiple -->
                    <span *ngIf="col.type === 'reference_multiple'" class="d-flex flex-wrap gap-1">
                      <span *ngFor="let texto of obtenerTextosReferenciaMultiple(col.name, row[col.name.toLowerCase()])" class="badge bg-info text-dark border border-info-subtle shadow-xs">
                        {{ texto }}
                      </span>
                    </span>
                    <!-- Si es número o entero -->
                    <span *ngIf="col.type === 'number' || col.type === 'integer'">
                      {{ formatearNumero(row[col.name.toLowerCase()], col.type) }}
                    </span>
                    <!-- Si es otro tipo -->
                    <span *ngIf="col.type !== 'boolean' && col.type !== 'reference' && col.type !== 'reference_multiple' && col.type !== 'number' && col.type !== 'integer'">
                      {{ row[col.name.toLowerCase()] }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-link text-primary p-0 me-2" (click)="abrirModalEditar(row)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-danger p-0" (click)="eliminarRegistro(row.id)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                  <td><small class="text-muted">{{ row.created_at | date:'short' }}</small></td>
                </tr>
                <tr *ngIf="rows.length === 0">
                  <td [attr.colspan]="table.columns.length + 3" class="text-center py-5 text-muted">
                    No hay registros en este catálogo.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal para Nuevo / Editar Registro -->
      <div class="modal fade show d-block" *ngIf="mostrarModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">{{ modoEdicion ? 'Editar Registro' : 'Agregar Registro' }}</h5>
              <button type="button" class="btn-close btn-close-white" (click)="mostrarModal = false"></button>
            </div>
            <div class="modal-body p-4" style="max-height: 70vh; overflow-y: auto;">
              <div class="mb-3" *ngFor="let col of table.columns">
                <label class="form-label fw-semibold notranslate" translate="no">{{ col.label }}</label>
                
                <!-- Si es booleano, mostramos un dropdown de selección -->
                <select *ngIf="col.type === 'boolean'" class="form-select" [(ngModel)]="newData[col.name]">
                  <option [ngValue]="true">Activo / Verdadero (True)</option>
                  <option [ngValue]="false">Inactivo / Falso (False)</option>
                </select>

                <!-- Si es una referencia a otra paramétrica, mostramos una lista desplegable -->
                <select *ngIf="col.type === 'reference'" class="form-select notranslate" translate="no" [(ngModel)]="newData[col.name]">
                  <option [ngValue]="null" class="notranslate" translate="no">-- Seleccionar {{ col.label }} --</option>
                  <option *ngFor="let opt of opcionesReferencia[col.name]" [ngValue]="opt.id" class="notranslate" translate="no">
                    {{ opt.descripcion || opt.description || opt.codigo || opt.id }} (Código: {{ opt.codigo }})
                  </option>
                </select>

                <!-- Si es una referencia a múltiples valores, mostramos una lista múltiple -->
                <select *ngIf="col.type === 'reference_multiple'" class="form-select notranslate" translate="no" multiple [(ngModel)]="newData[col.name]" style="min-height: 100px;">
                  <option *ngFor="let opt of opcionesReferencia[col.name]" [ngValue]="opt.id" class="notranslate" translate="no">
                    {{ opt.descripcion || opt.description || opt.codigo || opt.id }} (Código: {{ opt.codigo }})
                  </option>
                </select>

                <!-- Si es texto largo (text), mostramos una caja de texto multilínea -->
                <textarea *ngIf="col.type === 'text'" class="form-control notranslate" translate="no" [(ngModel)]="newData[col.name]" [placeholder]="'Ingresa ' + col.label" rows="3"></textarea>

                 <!-- Si es un número decimal (number) -->
                 <input *ngIf="col.type === 'number'" type="text" class="form-control notranslate" translate="no" 
                   [(ngModel)]="newData[col.name]" 
                   (focus)="onFocusNumero(col.name, 'number')" 
                   (blur)="onBlurNumero(col.name, 'number')"
                   [placeholder]="'Ingresa ' + col.label">
 
                 <!-- Si es un número entero (integer) -->
                 <input *ngIf="col.type === 'integer'" type="text" class="form-control notranslate" translate="no" 
                   [(ngModel)]="newData[col.name]" 
                   (focus)="onFocusNumero(col.name, 'integer')" 
                   (blur)="onBlurNumero(col.name, 'integer')"
                   [placeholder]="'Ingresa ' + col.label">

                <!-- Si es fecha (date) -->
                <input *ngIf="col.type === 'date'" type="date" class="form-control notranslate" translate="no" [(ngModel)]="newData[col.name]" [placeholder]="'Ingresa ' + col.label">

                <!-- Si es fecha y hora (datetime) -->
                <input *ngIf="col.type === 'datetime'" type="datetime-local" class="form-control notranslate" translate="no" [(ngModel)]="newData[col.name]" [placeholder]="'Ingresa ' + col.label">

                <!-- Si es hora (time) -->
                <input *ngIf="col.type === 'time'" type="time" class="form-control notranslate" translate="no" [(ngModel)]="newData[col.name]" [placeholder]="'Ingresa ' + col.label">

                <!-- Si es texto corto (string, por defecto) -->
                <input *ngIf="col.type !== 'boolean' && col.type !== 'reference' && col.type !== 'reference_multiple' && col.type !== 'text' && col.type !== 'number' && col.type !== 'integer' && col.type !== 'date' && col.type !== 'datetime' && col.type !== 'time'" type="text" class="form-control notranslate" translate="no" [(ngModel)]="newData[col.name]" [placeholder]="'Ingresa ' + col.label">
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-outline-secondary" (click)="mostrarModal = false">Cancelar</button>
              <button type="button" class="btn btn-primary px-4" (click)="guardarRegistro()">
                {{ modoEdicion ? 'Guardar Cambios' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParametricasDataComponent implements OnInit {
  private parametricService = inject(ParametricService);
  private route = inject(ActivatedRoute);
  
  tableId!: number;
  table: ParametricTable | null = null;
  rows: any[] = [];
  mostrarModal = false;
  modoEdicion = false;
  selectedRowId: number | null = null;
  newData: any = {};
  opcionesReferencia: { [colName: string]: any[] } = {};

  ngOnInit() {
    this.tableId = +this.route.snapshot.params['id'];
    this.cargarMetadatos();
    this.cargarDatos();
  }

  cargarMetadatos() {
    this.parametricService.getTables().subscribe(tables => {
      this.table = tables.find(t => t.id === this.tableId) || null;
      if (this.table && this.table.columns) {
        this.table.columns.forEach(col => {
          if ((col.type === 'reference' || col.type === 'reference_multiple') && col.referencedTableId) {
            this.parametricService.getTableData(col.referencedTableId).subscribe(data => {
              this.opcionesReferencia[col.name] = data;
            });
          }
        });
      }
    });
  }

  cargarDatos() {
    this.parametricService.getTableData(this.tableId).subscribe(data => this.rows = data);
  }

  obtenerTextoReferencia(colName: string, idVal: any): string {
    if (idVal === null || idVal === undefined || idVal === '') return '';
    const opciones = this.opcionesReferencia[colName];
    if (!opciones) return String(idVal);
    const encontrado = opciones.find(opt => String(opt.id) === String(idVal));
    return encontrado ? (encontrado.descripcion || encontrado.description || encontrado.codigo || String(idVal)) : String(idVal);
  }

  obtenerTextosReferenciaMultiple(colName: string, idVal: any): string[] {
    if (idVal === null || idVal === undefined || idVal === '') return [];
    // The backend saves arrays as comma-separated strings (e.g. "1,3,4")
    const ids = String(idVal).split(',').map(s => s.trim()).filter(s => s);
    return ids.map(id => this.obtenerTextoReferencia(colName, id));
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.selectedRowId = null;
    this.newData = {};
    
    // Asignar valores iniciales según tipo
    this.table?.columns.forEach(col => {
      if (col.type === 'boolean') {
        this.newData[col.name] = true;
      } else if (col.type === 'reference') {
        this.newData[col.name] = null;
      } else if (col.type === 'reference_multiple') {
        this.newData[col.name] = [];
      } else {
        this.newData[col.name] = '';
      }
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(row: any) {
    this.modoEdicion = true;
    this.selectedRowId = row.id;
    this.newData = {};
    
    // RellenarnewData mapeando campos (Postgres devuelve claves en minúscula)
    this.table?.columns.forEach(col => {
      const val = row[col.name.toLowerCase()];
      if (col.type === 'boolean') {
        // Asegurar que sea booleano
        this.newData[col.name] = (val === true || val === 'true' || val === 'verdadero' || val === 'ACTIVO');
      } else if (col.type === 'reference') {
        // Asegurar que se guarde como número para vincular el select
        this.newData[col.name] = val !== undefined && val !== null && val !== '' ? Number(val) : null;
      } else if (col.type === 'reference_multiple') {
        if (val !== undefined && val !== null && val !== '') {
          this.newData[col.name] = String(val).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
        } else {
          this.newData[col.name] = [];
        }
      } else if (col.type === 'datetime') {
        if (val) {
          // Reemplazar espacio por T para input datetime-local de HTML5
          this.newData[col.name] = String(val).replace(' ', 'T').substring(0, 16);
        } else {
          this.newData[col.name] = '';
        }
      } else if (col.type === 'number' || col.type === 'integer') {
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (!isNaN(num)) {
            const locale = navigator.language || 'es-ES';
            if (col.type === 'integer') {
              this.newData[col.name] = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(num);
            } else {
              this.newData[col.name] = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(num);
            }
          } else {
            this.newData[col.name] = '';
          }
        } else {
          this.newData[col.name] = '';
        }
      } else {
        this.newData[col.name] = val !== undefined && val !== null ? val : '';
      }
    });
    this.mostrarModal = true;
  }

  guardarRegistro() {
    this.limpiarNumerosAntesDeGuardar();
    if (this.modoEdicion && this.selectedRowId !== null) {
      this.parametricService.updateData(this.tableId, this.selectedRowId, this.newData).subscribe({
        next: () => {
          this.mostrarModal = false;
          this.cargarDatos();
        },
        error: () => alert('Error al actualizar registro')
      });
    } else {
      this.parametricService.insertData(this.tableId, this.newData).subscribe({
        next: () => {
          this.mostrarModal = false;
          this.cargarDatos();
        },
        error: () => alert('Error al guardar registro')
      });
    }
  }

  eliminarRegistro(rowId: number) {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.parametricService.deleteData(this.tableId, rowId).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: () => alert('Error al eliminar registro')
      });
    }
  }

  formatearNumero(val: any, colType: string): string {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    const locale = navigator.language || 'es-ES';
    if (colType === 'integer') {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(num);
    }
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(num);
  }

  onFocusNumero(colName: string, type: string) {
    let val = this.newData[colName];
    if (val === null || val === undefined || val === '') return;
    
    // Obtener separador decimal del locale actual
    const locale = navigator.language || 'es-ES';
    const formatter = new Intl.NumberFormat(locale);
    const parts = formatter.formatToParts(1.1);
    const groupSeparator = parts.find(p => p.type === 'group')?.value || ',';
    const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '.';

    let cleanVal = String(val).trim();
    // Remover separadores de miles
    cleanVal = cleanVal.split(groupSeparator).join('');
    // Reemplazar separador decimal por punto para edición limpia de input text
    if (decimalSeparator === ',') {
      cleanVal = cleanVal.replace(',', '.');
    }
    
    const num = Number(cleanVal);
    if (!isNaN(num)) {
      this.newData[colName] = String(num);
    }
  }

  onBlurNumero(colName: string, type: string) {
    let val = this.newData[colName];
    if (val === null || val === undefined || val === '') return;
    
    // Cambiar coma por punto si fuera necesario para parsear
    let cleanVal = String(val).trim().replace(',', '.');
    const num = Number(cleanVal);
    if (!isNaN(num)) {
      const locale = navigator.language || 'es-ES';
      if (type === 'integer') {
        this.newData[colName] = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(num);
      } else {
        this.newData[colName] = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(num);
      }
    }
  }

  limpiarNumerosAntesDeGuardar() {
    this.table?.columns.forEach(col => {
      if (col.type === 'number' || col.type === 'integer') {
        let val = this.newData[col.name];
        if (val !== undefined && val !== null && val !== '') {
          let str = String(val).trim();
          const locale = navigator.language || 'es-ES';
          const formatter = new Intl.NumberFormat(locale);
          const parts = formatter.formatToParts(1.1);
          const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '.';
          const groupSeparator = parts.find(p => p.type === 'group')?.value || ',';

          // Quitar separador de miles
          str = str.split(groupSeparator).join('');
          if (decimalSeparator === ',') {
            str = str.replace(',', '.');
          }
          
          const num = Number(str);
          this.newData[col.name] = isNaN(num) ? null : num;
        } else {
          this.newData[col.name] = null;
        }
      }
    });
  }
}
