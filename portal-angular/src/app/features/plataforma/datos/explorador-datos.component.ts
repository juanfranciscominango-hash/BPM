import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetaService, MetaEntity, MetaAttribute } from '../../../core/services/meta.service';

@Component({
  selector: 'app-explorador-datos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="mb-4">
        <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-database-fill me-2"></i>Explorador de Datos</h2>
        <p class="text-muted">Consulta los registros guardados en tus tablas dinámicas de negocio.</p>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-4">
              <label class="form-label fw-bold small text-uppercase">Seleccionar Tabla/Entidad</label>
              <select class="form-select shadow-sm" [(ngModel)]="selectedEntityId" (change)="onEntityChange()">
                <option [ngValue]="null" disabled>-- Seleccione una entidad --</option>
                <option *ngFor="let ent of entities" [ngValue]="ent.id">{{ ent.label }} ({{ ent.name }})</option>
              </select>
            </div>
            <div class="col-md-8 pt-4">
              <button class="btn btn-outline-primary" (click)="cargarDatos()" [disabled]="!selectedEntityId">
                <i class="bi bi-arrow-clockwise me-1"></i>Refrescar Datos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm overflow-hidden" *ngIf="selectedEntityId">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0 fw-bold"><i class="bi bi-table me-2 text-primary"></i>Registros de {{ getSelectedEntity()?.label }}</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">ID</th>
                <th *ngFor="let attr of attributes">{{ attr.label }}</th>
                <th>Instancia Proceso</th>
                <th class="text-end pe-4">Fecha Creación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of tableData">
                <td class="ps-4 fw-bold text-primary">{{ row.id }}</td>
                <td *ngFor="let attr of attributes">
                  {{ formatValue(row[attr.name.toLowerCase()]) }}
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ row.process_instance_id }}</span>
                </td>
                <td class="text-end pe-4 small text-muted">
                  {{ row.created_at | date:'medium' }}
                </td>
              </tr>
              <tr *ngIf="tableData.length === 0">
                <td [attr.colspan]="attributes.length + 3" class="text-center py-5 text-muted">
                  <i class="bi bi-info-circle h1 d-block mb-3"></i>
                  No se encontraron registros para esta tabla.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .form-select { border-radius: 8px; }
  `]
})
export class ExploradorDatosComponent implements OnInit {
  private metaService = inject(MetaService);

  entities: MetaEntity[] = [];
  attributes: MetaAttribute[] = [];
  tableData: any[] = [];
  selectedEntityId: number | null = null;

  ngOnInit() {
    this.metaService.listarEntidades().subscribe(data => this.entities = data);
  }

  onEntityChange() {
    if (this.selectedEntityId) {
      this.metaService.listarAtributos(this.selectedEntityId).subscribe(attrs => {
        this.attributes = attrs;
        this.cargarDatos();
      });
    }
  }

  cargarDatos() {
    if (this.selectedEntityId) {
      this.metaService.getEntityData(this.selectedEntityId).subscribe({
        next: (data) => this.tableData = data,
        error: (err) => {
          alert('La tabla física aún no ha sido creada. Inicie un proceso vinculado a esta entidad para generarla.');
          this.tableData = [];
        }
      });
    }
  }

  getSelectedEntity() {
    return this.entities.find(e => e.id === this.selectedEntityId);
  }

  formatValue(val: any): string {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'SÍ' : 'NO';
    return val.toString();
  }
}
