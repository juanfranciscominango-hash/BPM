import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CrmService, Lead } from '../services/crm.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-prospectos-list',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="container-fluid p-2" style="background-color: #f8f9fa;">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h4 class="fw-bold mb-1" style="color: #1e3a8a;">Gestión de <span style="color: #3b82f6;">Prospectos</span></h4>
          <p class="text-muted small mb-0" style="font-size: 0.75rem;">Captura y seguimiento de oportunidades de venta.</p>
        </div>
        <button class="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm" (click)="nuevoProspecto()" style="background-color: #3b82f6; border: none;">
          <i class="bi bi-plus-circle-fill me-2"></i> NUEVO PROSPECTO
        </button>
      </div>

      <!-- Top Stats Row -->
      <div class="row g-2 mb-2">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-2">
              <span class="text-muted small fw-bold text-uppercase" style="letter-spacing: 0.5px; font-size: 0.65rem;">TOTAL LEADS</span>
              <h4 class="fw-bold mt-1 mb-0">{{ leads.length }}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 h-100" style="background-color: #fff1f2;">
            <div class="card-body p-2">
              <span class="text-danger small fw-bold text-uppercase" style="letter-spacing: 0.5px; font-size: 0.65rem;">CALIENTES 🔥</span>
              <h4 class="text-danger fw-bold mt-1 mb-0">{{ getCountByStatus('CALIENTE') }}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 h-100" style="background-color: #f0f9ff;">
            <div class="card-body p-2">
              <span class="text-primary small fw-bold text-uppercase" style="letter-spacing: 0.5px; font-size: 0.65rem;">EN PROCESO</span>
              <h4 class="text-primary fw-bold mt-1 mb-0">{{ getCountByStatus('EN PROCESO') }}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 h-100" style="background-color: #f0fdf4;">
            <div class="card-body p-2">
              <span class="text-success small fw-bold text-uppercase" style="letter-spacing: 0.5px; font-size: 0.65rem;">PIPELINE ($)</span>
              <h4 class="text-success fw-bold mt-1 mb-0">$ {{ getPipelineTotal() | number:'1.2-2' }}</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Charts -->
      <div class="row g-2 mb-2">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-2">
              <h6 class="fw-bold text-uppercase text-muted mb-1" style="letter-spacing: 0.5px; font-size: 0.7rem;">Leads por Estado Térmico</h6>
              <div style="height: 100px; display: flex; justify-content: center;">
                <canvas *ngIf="doughnutChartData" baseChart
                  [data]="doughnutChartData"
                  [options]="doughnutChartOptions"
                  [type]="'doughnut'">
                </canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-2">
              <h6 class="fw-bold text-uppercase text-muted mb-1" style="letter-spacing: 0.5px; font-size: 0.7rem;">Rendimiento por Origen</h6>
              <div style="height: 100px; display: flex; justify-content: center;">
                <canvas *ngIf="barChartData" baseChart
                  [data]="barChartData"
                  [options]="barChartOptions"
                  [type]="'bar'">
                </canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-2">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 table-sm">
              <thead class="table-light">
                <tr>
                  <th class="text-muted small fw-bold text-uppercase border-0" style="font-size: 0.65rem;">Información Prospecto</th>
                  <th class="text-muted small fw-bold text-uppercase border-0" style="font-size: 0.65rem;">Origen & Asesor</th>
                  <th class="text-muted small fw-bold text-uppercase border-0 text-center" style="font-size: 0.65rem;">Monto Estimado</th>
                  <th class="text-muted small fw-bold text-uppercase border-0 text-center" style="font-size: 0.65rem;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let lead of paginatedLeads" style="cursor: pointer;" (click)="verDetalle(lead.id!)">
                  <td class="py-1 border-bottom-0">
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold" style="width: 30px; height: 30px; font-size: 0.8rem;">
                        {{ lead.nombresCompletos.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <h6 class="mb-0 fw-bold" style="font-size: 0.8rem;">{{ lead.nombresCompletos | uppercase }}</h6>
                        <div class="small text-muted" style="font-size: 0.65rem;">
                          <span *ngIf="lead.empresa">{{ lead.empresa | uppercase }} • </span>
                          <span class="text-primary">{{ lead.telefono }}</span> • {{ lead.email || 'Sin email' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-1 border-bottom-0">
                    <div class="small text-muted fw-bold text-uppercase" style="font-size: 0.65rem;">
                      {{ lead.origen?.nombre || 'DIRECTO' }}
                      <span *ngIf="lead.referencia" class="text-primary fw-normal text-capitalize ms-1" style="font-size: 0.6rem;">(Ref: {{ lead.referencia }})</span>
                    </div>
                    <div class="small d-flex align-items-center gap-1 mt-0" style="font-size: 0.65rem;">
                      <span class="badge bg-primary-subtle text-primary rounded-1 px-1">V</span>
                      <span class="text-dark fw-medium">{{ lead.AsesorAsignado?.nombreCompleto || 'Sin Asignar' }}</span>
                    </div>
                  </td>
                  <td class="py-1 border-bottom-0 text-center">
                    <h6 class="mb-0 fw-bold" style="font-size: 0.85rem;">$ {{ lead.montoEstimado | number:'1.2-2' }}</h6>
                    <span class="badge rounded-pill" [ngClass]="{
                      'bg-danger-subtle text-danger': lead.estado === 'CALIENTE',
                      'bg-warning-subtle text-warning': lead.estado === 'TIBIO',
                      'bg-secondary-subtle text-secondary': lead.estado === 'FRIO',
                      'bg-success-subtle text-success': lead.estado === 'CONVERTIDO'
                    }" style="font-size: 0.55rem;">{{ lead.estado }}</span>
                  </td>
                  <td class="py-1 border-bottom-0 text-center">
                    <button class="btn btn-sm btn-light rounded-circle shadow-sm mx-1 text-primary py-0 px-1" (click)="verDetalle(lead.id!); $event.stopPropagation()">
                      <i class="bi bi-eye" style="font-size: 0.75rem;"></i>
                    </button>
                    <button class="btn btn-sm btn-light rounded-circle shadow-sm mx-1 text-success py-0 px-1" (click)="verDetalle(lead.id!); $event.stopPropagation()">
                      <i class="bi bi-person-check" style="font-size: 0.75rem;"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="paginatedLeads.length === 0">
                  <td colspan="4" class="text-center py-3 text-muted" style="font-size: 0.8rem;">No hay prospectos registrados aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          <div class="d-flex justify-content-between align-items-center mt-2 px-1" *ngIf="leads.length > 0">
            <small class="text-muted" style="font-size: 0.7rem;">Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ mathMin(currentPage * pageSize, leads.length) }} de {{ leads.length }} prospectos</small>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="currentPage === 1">
                <a class="page-link py-0 px-2" (click)="currentPage = currentPage - 1" style="cursor: pointer;"><i class="bi bi-chevron-left"></i></a>
              </li>
              <li class="page-item active"><a class="page-link py-0 px-2">{{ currentPage }}</a></li>
              <li class="page-item" [class.disabled]="currentPage * pageSize >= leads.length">
                <a class="page-link py-0 px-2" (click)="currentPage = currentPage + 1" style="cursor: pointer;"><i class="bi bi-chevron-right"></i></a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ProspectosListComponent implements OnInit {
  leads: Lead[] = [];
  private crmService = inject(CrmService);
  private router = inject(Router);

  // Paginación
  currentPage: number = 1;
  pageSize: number = 7;

  // Charts Data
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] | undefined;
  public doughnutChartOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false };

  public barChartData: ChartConfiguration<'bar'>['data'] | undefined;
  public barChartOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };

  get paginatedLeads(): Lead[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.leads.slice(startIndex, startIndex + this.pageSize);
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  ngOnInit() {
    this.cargarLeads();
    this.cargarAnalytics();
  }

  cargarAnalytics() {
    this.crmService.getAnalyticsLeadsByStatus().subscribe(res => {
      this.doughnutChartData = {
        labels: res.map(r => r.name),
        datasets: [
          { data: res.map(r => r.value), backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280'] }
        ]
      };
    });

    this.crmService.getAnalyticsLeadsByOrigin().subscribe(res => {
      this.barChartData = {
        labels: res.map(r => r.name || 'DIRECTO'),
        datasets: [
          { data: res.map(r => r.value), label: 'Leads', backgroundColor: '#3b82f6' }
        ]
      };
    });
  }

  cargarLeads() {
    this.crmService.getLeads().subscribe({
      next: (data) => {
        console.log("Leads cargados:", data);
        this.leads = data;
      },
      error: (err) => console.error("Error cargando leads", err)
    });
  }

  nuevoProspecto() {
    this.router.navigate(['/portal/crm/nuevo']);
  }

  verDetalle(id: number) {
    this.router.navigate(['/portal/crm/prospecto', id]);
  }

  getCountByStatus(status: string): number {
    return this.leads.filter(l => l.estado === status).length;
  }

  getPipelineTotal(): number {
    const total = this.leads.reduce((sum, current) => {
      const monto = typeof current.montoEstimado === 'string' ? parseFloat(current.montoEstimado) : (current.montoEstimado || 0);
      return sum + monto;
    }, 0);
    console.log("getPipelineTotal:", total, "leads.length:", this.leads.length);
    return total;
  }
}


