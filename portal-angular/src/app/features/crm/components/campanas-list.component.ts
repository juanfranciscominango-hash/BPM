import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService, Campana } from '../services/crm.service';

@Component({
  selector: 'app-campanas-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4" style="background-color: #f8f9fa; min-height: 100vh;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1" style="color: #1e3a8a;">Gestión de <span style="color: #3b82f6;">Campañas</span></h2>
          <p class="text-muted small">Monitor de rendimiento y métricas de marketing.</p>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4" *ngFor="let campana of campanas">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="fw-bold text-primary mb-0">{{ campana.nombre }}</h5>
                <span class="badge rounded-pill" [ngClass]="{
                  'bg-success-subtle text-success': campana.estado === 'activa',
                  'bg-secondary-subtle text-secondary': campana.estado !== 'activa'
                }">{{ campana.estado | uppercase }}</span>
              </div>
              
              <p class="text-muted small mb-4"><i class="bi bi-calendar-event me-2"></i>{{ campana.fechaInicio }} a {{ campana.fechaFin }}</p>
              
              <div class="row text-center mb-3">
                <div class="col-6 border-end">
                  <span class="text-muted small fw-bold text-uppercase d-block" style="font-size: 0.7rem;">Leads</span>
                  <span class="fw-bold fs-5 text-dark">{{ campana.leadsGenerados || 0 }}</span>
                </div>
                <div class="col-6">
                  <span class="text-muted small fw-bold text-uppercase d-block" style="font-size: 0.7rem;">Conversión</span>
                  <span class="fw-bold fs-5 text-success">{{ campana.conversiones || 0 }}</span>
                </div>
              </div>

              <div class="bg-light p-3 rounded-3">
                <div class="d-flex justify-content-between small mb-2">
                  <span class="text-muted fw-bold">Presupuesto Ejecutado</span>
                  <span class="fw-bold">$ {{ campana.presupuestoEjecutado || 0 }} / $ {{ campana.presupuestoAsignado || 0 }}</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar bg-primary" role="progressbar" [style.width]="getPresupuestoPorcentaje(campana) + '%'"></div>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-top-0 p-3 text-center">
               <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill"><i class="bi bi-graph-up-arrow me-2"></i>ROI: {{ campana.roi || '0%' }}</span>
            </div>
          </div>
        </div>
        
        <div class="col-md-12" *ngIf="campanas.length === 0">
           <div class="text-center p-5 text-muted">
              <i class="bi bi-megaphone display-1 text-light"></i>
              <p class="mt-3">No hay campañas registradas.</p>
           </div>
        </div>
      </div>
    </div>
  `
})
export class CampanasListComponent implements OnInit {
  campanas: Campana[] = [];
  private crmService = inject(CrmService);

  ngOnInit() {
    this.cargarCampanas();
  }

  cargarCampanas() {
    this.crmService.getCampanas().subscribe({
      next: (data) => this.campanas = data,
      error: (err) => console.error("Error cargando campañas", err)
    });
  }

  getPresupuestoPorcentaje(campana: Campana): number {
    if (!campana.presupuestoAsignado || !campana.presupuestoEjecutado) return 0;
    return Math.min(100, Math.round((campana.presupuestoEjecutado / campana.presupuestoAsignado) * 100));
  }
}
