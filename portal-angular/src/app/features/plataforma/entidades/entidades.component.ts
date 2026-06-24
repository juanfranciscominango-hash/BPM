import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetaService, MetaEntity } from '../../../core/services/meta.service';

@Component({
  selector: 'app-entidades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 text-gray-800">Constructor de Tablas</h2>
          <p class="text-muted">Define las estructuras de datos dinámicas para tus procesos.</p>
        </div>
        <button class="btn btn-primary shadow-sm" (click)="abrirModal()">
          <i class="bi bi-plus-lg me-2"></i>Nueva Tabla
        </button>
      </div>

      <div class="row">
        <div class="col-xl-3 col-md-6 mb-4" *ngFor="let entity of entities">
          <div class="card border-left-primary shadow h-100 py-2 border-0 border-start border-4 border-primary">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    {{ entity.name }}
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">{{ entity.label }}</div>
                  <div class="mt-2 small text-muted text-truncate" style="max-width: 150px;">
                    {{ entity.description || 'Sin descripción' }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-table fs-2 text-gray-300"></i>
                </div>
              </div>
              <div class="mt-3 d-flex justify-content-between">
                <button class="btn btn-sm btn-link text-primary p-0 fw-bold text-decoration-none" 
                        [routerLink]="['/plataforma/entidades', entity.id, 'atributos']">
                  <i class="bi bi-gear-fill me-1"></i>Configurar Campos
                </button>
                <button class="btn btn-sm btn-link text-danger p-0" (click)="eliminar(entity.id!)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="col-12 text-center py-5" *ngIf="entities.length === 0">
          <i class="bi bi-layers fs-1 text-gray-300"></i>
          <p class="mt-3 text-muted">No has creado ninguna tabla virtual todavía.</p>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title">Nueva Tabla Virtual</h5>
            <button type="button" class="btn-close" (click)="cerrarModal()"></button>
          </div>
          <div class="modal-body p-4">
            <form [formGroup]="form">
              <div class="mb-3">
                <label class="form-label fw-bold">Nombre Técnico</label>
                <input type="text" class="form-control" formControlName="name" placeholder="ej: solicitud_credito">
                <div class="form-text">Solo minúsculas y guiones bajos.</div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Etiqueta Visible</label>
                <input type="text" class="form-control" formControlName="label" placeholder="ej: Solicitud de Crédito">
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Descripción (Opcional)</label>
                <textarea class="form-control" formControlName="description" rows="3"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary px-4" (click)="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-primary px-4" [disabled]="form.invalid" (click)="guardar()">
              Crear Tabla
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="showModal" class="modal-backdrop fade show"></div>
  `,
  styles: [`
    .border-left-primary { border-left: .25rem solid #4e73df!important; }
    .card { transition: all 0.2s; }
    .card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
    .modal.show { background: rgba(0,0,0,0.5); }
  `]
})
export class EntidadesComponent implements OnInit {
  private metaService = inject(MetaService);
  private fb = inject(FormBuilder);

  entities: MetaEntity[] = [];
  showModal = false;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-z0-9_]+$')]],
      label: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.cargarEntidades();
  }

  cargarEntidades() {
    this.metaService.listarEntidades().subscribe({
      next: (res) => this.entities = res,
      error: (err) => console.error('Error al cargar entidades:', err)
    });
  }

  abrirModal() {
    this.form.reset();
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardar() {
    if (this.form.valid) {
      this.metaService.guardarEntidad(this.form.value).subscribe({
        next: () => {
          this.cargarEntidades();
          this.cerrarModal();
        },
        error: (err) => alert('Error al guardar: ' + (err.error?.message || 'Error desconocido'))
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tabla virtual? Se perderán todas las configuraciones asociadas.')) {
      this.metaService.eliminarEntidad(id).subscribe({
        next: () => this.cargarEntidades(),
        error: (err) => alert('Error al eliminar')
      });
    }
  }
}
