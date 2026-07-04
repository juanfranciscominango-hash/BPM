import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-conexion-mantenimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container p-4">
      <div class="mb-4">
        <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-database-fill-gear me-2"></i>Conexión a Base de Datos</h2>
        <p class="text-muted">Visualiza y actualiza los parámetros de conexión de la base de datos principal (application.yml).</p>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-header bg-dark text-white py-3">
              <h5 class="card-title mb-0 fw-bold"><i class="bi bi-shield-lock me-2"></i>Credenciales y Enlace JDBC</h5>
            </div>
            <div class="card-body p-4">
              
              <!-- Loader -->
              <div *ngIf="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="text-muted mt-2 small">Cargando configuración actual...</p>
              </div>

              <!-- Form -->
              <form *ngIf="!loading" [formGroup]="dbForm" (ngSubmit)="guardarConfiguracion()">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted">Cadena de Conexión (JDBC URL)</label>
                  <input type="text" class="form-control rounded-3" formControlName="url" placeholder="jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM" required>
                  <div class="form-text text-muted small">Ej: <code>jdbc:postgresql://[host]:[port]/[database]</code></div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted">Usuario de Base de Datos</label>
                  <input type="text" class="form-control rounded-3" formControlName="username" placeholder="postgres" required>
                </div>

                <div class="mb-4">
                  <label class="form-label small fw-semibold text-muted">Contraseña</label>
                  <div class="input-group">
                    <input [type]="showPassword ? 'text' : 'password'" class="form-control rounded-start-3" formControlName="password" placeholder="Contraseña" required>
                    <button class="btn btn-outline-secondary rounded-end-3" type="button" (click)="toggleShowPassword()">
                      <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                    </button>
                  </div>
                </div>

                <div class="alert alert-warning border-0 rounded-3 shadow-xs d-flex align-items-start gap-2 mb-4">
                  <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                  <div class="small">
                    <strong>¡Atención!</strong> Cambiar estos parámetros actualizará el archivo de configuración <code>application.yml</code>. El backend necesitará ser reiniciado para aplicar y establecer la nueva conexión a la base de datos.
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-outline-secondary w-50 rounded-pill" (click)="cargarConfiguracion()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Restaurar
                  </button>
                  <button type="submit" class="btn btn-primary w-50 rounded-pill shadow-sm" [disabled]="dbForm.invalid || saving">
                    <span *ngIf="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i *ngIf="!saving" class="bi bi-check-circle me-1"></i>Guardar Cambios
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
export class ConexionComponent implements OnInit {
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  dbForm!: FormGroup;
  loading = true;
  saving = false;
  showPassword = false;

  ngOnInit() {
    this.dbForm = this.fb.group({
      url: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.cargarConfiguracion();
  }

  cargarConfiguracion() {
    this.loading = true;
    this.taskService.getDbConfig().subscribe({
      next: (config) => {
        this.dbForm.patchValue(config);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar la configuración de DB:', err);
        alert('Error al intentar cargar la configuración actual de la base de datos.');
        this.loading = false;
      }
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  guardarConfiguracion() {
    if (this.dbForm.invalid) return;
    this.saving = true;
    this.taskService.updateDbConfig(this.dbForm.value).subscribe({
      next: (res: any) => {
        alert(res.message || 'Configuración guardada exitosamente. Recuerde reiniciar el servidor backend.');
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al actualizar la configuración de DB:', err);
        alert('Ocurrió un error al intentar actualizar la configuración de la base de datos.');
        this.saving = false;
      }
    });
  }
}
