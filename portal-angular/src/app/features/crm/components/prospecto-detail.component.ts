import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CrmService, Lead, LeadInteraction, LeadTask } from '../services/crm.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prospecto-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BaseChartDirective],
  template: `
    <div class="container-fluid p-2" style="background-color: #f8f9fa;">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light rounded-circle shadow-sm" (click)="volver()">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div>
            <div class="text-muted small fw-bold text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">
              Dashboard > Prospectos > Expediente 360
            </div>
            <h2 class="fw-bold mb-0 text-dark">Detalles del <span style="color: #3b82f6;">Prospecto</span></h2>
          </div>
        </div>
        <div>
          <button class="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm text-white" (click)="simularCredito()" style="background-color: #059669; border: none;">
            <i class="bi bi-person-plus-fill me-2"></i> CONVERTIR A CLIENTE / SIMULAR CRÉDITO
          </button>
        </div>
      </div>

      <div class="row g-4" *ngIf="lead">
        <!-- Left Column: 360 Profile -->
        <div class="col-md-4">
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden h-100">            <div class="bg-primary py-1 px-2 text-center position-relative" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">
              <div class="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary fw-bold shadow-lg mx-auto position-relative z-1" 
                   style="width: 35px; height: 35px; font-size: 1.2rem; margin-bottom: -17px;">
                {{ lead.nombresCompletos.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="card-body pt-3 px-2 pb-1 text-center" style="font-size: 0.85rem;">
              <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.85rem;">{{ lead.nombresCompletos | uppercase }}</h6>
              <p class="text-muted fw-bold text-uppercase mt-0 mb-1" style="font-size: 0.6rem; letter-spacing: 0.5px;">
                {{ lead.empresa || 'Cliente Individual' }}
              </p>

              <div class="bg-light rounded-3 p-1 mb-1 text-start">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="text-muted fw-bold text-uppercase d-block" style="font-size: 0.55rem; line-height: 1;">Oportunidad</span>
                    <h5 class="fw-bold mb-0 text-primary" style="font-size: 1rem;">$ {{ lead.montoEstimado | number:'1.2-2' }}</h5>
                  </div>
                  <i class="bi bi-cash-coin text-primary opacity-50" style="font-size: 1rem;"></i>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="d-flex flex-column gap-1 text-start">
                <div class="bg-light rounded-2 p-1 d-flex align-items-center gap-2">
                  <div class="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary shadow-sm flex-shrink-0" style="width: 20px; height: 20px;">
                    <i class="bi bi-telephone-fill" style="font-size: 0.6rem;"></i>
                  </div>
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">TEL/WA</span>
                    <span class="fw-bold text-dark" style="font-size: 0.7rem;">{{ lead.telefono || 'N/D' }}</span>
                  </div>
                </div>

                <div class="bg-light rounded-2 p-1 d-flex align-items-center gap-2">
                  <div class="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary shadow-sm flex-shrink-0" style="width: 20px; height: 20px;">
                    <i class="bi bi-envelope-fill" style="font-size: 0.6rem;"></i>
                  </div>
                  <div class="d-flex justify-content-between align-items-center w-100" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">EMAIL</span>
                    <span class="fw-bold text-dark text-truncate text-end" style="font-size: 0.7rem; max-width: 120px;" [title]="lead.email || 'N/D'">{{ lead.email || 'N/D' }}</span>
                  </div>
                </div>

                <div class="bg-light rounded-2 p-1 d-flex align-items-center gap-2">
                  <div class="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary shadow-sm flex-shrink-0" style="width: 20px; height: 20px;">
                    <i class="bi bi-megaphone-fill" style="font-size: 0.6rem;"></i>
                  </div>
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">ORIGEN</span>
                    <span class="fw-bold text-dark" style="font-size: 0.7rem;">{{ lead.origen?.nombre || 'Directo' }}</span>
                  </div>
                </div>

                <div class="bg-light rounded-2 p-1 d-flex align-items-center gap-2" *ngIf="lead.referencia">
                  <div class="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary shadow-sm flex-shrink-0" style="width: 20px; height: 20px;">
                    <i class="bi bi-person-hearts" style="font-size: 0.6rem;"></i>
                  </div>
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">REFERIDO POR</span>
                    <span class="fw-bold text-dark text-truncate text-end text-capitalize" style="font-size: 0.7rem; max-width: 120px;" [title]="lead.referencia">{{ lead.referencia }}</span>
                  </div>
                </div>

                <div class="bg-light rounded-2 p-1 d-flex align-items-center gap-2" *ngIf="lead.campana">
                  <div class="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary shadow-sm flex-shrink-0" style="width: 20px; height: 20px;">
                    <i class="bi bi-bullseye" style="font-size: 0.6rem;"></i>
                  </div>
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">Campaña</span>
                    <span class="fw-bold text-dark text-truncate text-end" style="font-size: 0.7rem; max-width: 120px;" [title]="lead.campana.nombre">{{ lead.campana.nombre }}</span>
                  </div>
                </div>

                <div class="bg-light rounded-2 p-1 d-flex align-items-center gap-2">
                  <div class="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary shadow-sm flex-shrink-0" style="width: 20px; height: 20px;">
                    <i class="bi bi-person-badge-fill" style="font-size: 0.6rem;"></i>
                  </div>
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">ASESOR</span>
                    <span class="fw-bold text-dark text-truncate text-end" style="font-size: 0.7rem; max-width: 120px;">{{ lead.AsesorAsignado?.nombreCompleto || 'Sin Asignar' }}</span>
                  </div>
                </div>
              </div>

              <div class="row g-1 mt-1">
                <div class="col-6">
                  <button class="btn w-100 rounded-pill text-white fw-bold shadow-sm py-0" style="background-color: #25d366; border: none; font-size: 0.7rem; line-height: 1.5;">
                    <i class="bi bi-whatsapp"></i> WA
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn w-100 rounded-pill text-white fw-bold shadow-sm py-0" style="background-color: #1e293b; border: none; font-size: 0.7rem; line-height: 1.5;" (click)="enviarEmail()">
                    <i class="bi bi-envelope"></i> EMAIL
                  </button>
                </div>
                <div class="col-12">
                  <button class="btn w-100 rounded-pill text-white fw-bold shadow-sm py-0" style="background-color: #f59e0b; border: none; font-size: 0.7rem; line-height: 1.5;" (click)="consultarBuro()">
                    <i class="bi bi-bank"></i> CONSULTAR BURÓ
                  </button>
                </div>
              </div>

              <!-- Perfil Financiero -->
              <div class="mt-1 text-start" *ngIf="lead.perfilFinanciero">
                <h6 class="fw-bold mb-0" style="color: #1e3a8a; font-size: 0.75rem;"><i class="bi bi-wallet2 me-1"></i>Perfil Financiero</h6>
                <div class="bg-light rounded-1 p-1 mb-1 d-flex justify-content-between align-items-center">
                  <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">Ingresos</span>
                  <span class="fw-bold text-dark" style="font-size: 0.7rem;">$ {{ lead.perfilFinanciero.ingresosMensuales | number:'1.2-2' }}</span>
                </div>
                <div class="bg-light rounded-1 p-1 mb-1 d-flex justify-content-between align-items-center border-start border-2 border-success">
                  <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">Capacidad End.</span>
                  <span class="fw-bold text-success" style="font-size: 0.7rem;">$ {{ lead.perfilFinanciero.valorMaximoEndeudamiento | number:'1.2-2' }}</span>
                </div>
                <div class="bg-light rounded-1 p-1 mb-1 d-flex justify-content-between align-items-center border-start border-2 border-primary">
                  <span class="text-muted fw-bold text-uppercase" style="font-size: 0.5rem;">Max. Préstamo</span>
                  <span class="fw-bold text-primary" style="font-size: 0.7rem;">$ {{ lead.perfilFinanciero.valorMaximoPrestamo | number:'1.2-2' }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Right Column: Actions and Timeline -->
        <div class="col-md-8">

          <!-- Simulador de Score (Transparencia) -->
          <div class="card border-0 shadow-sm rounded-4 mb-3" *ngIf="lead.perfilFinanciero">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="fw-bold mb-0" style="color: #1e3a8a; font-size: 1rem;"><i class="bi bi-speedometer2 me-2"></i>Transparencia de Score Crediticio</h5>
                <span class="badge bg-warning-subtle text-dark border border-warning rounded-pill px-2 py-1"><i class="bi bi-info-circle me-1"></i>Modo Simulación</span>
              </div>
              <p class="text-muted mb-3" style="font-size: 0.75rem;">Ajusta los parámetros para educar al cliente sobre cómo su comportamiento afecta su score. Basado en normativas vigentes.</p>
              
              <div class="row g-3 align-items-center">
                <div class="col-md-4 text-center">
                  <div style="position: relative; width: 100%; height: 130px;" class="mx-auto">
                     <canvas baseChart
                        [data]="scoreChartData"
                        [options]="scoreChartOptions"
                        [type]="'doughnut'">
                      </canvas>
                      <div class="position-absolute top-50 start-50 translate-middle text-center mt-2">
                        <span class="d-block text-muted fw-bold" style="font-size: 0.55rem;">SCORE</span>
                        <h3 class="fw-bold mb-0 text-primary" style="font-size: 1.5rem;">{{ simulatedScore }}</h3>
                      </div>
                  </div>
                </div>
                <div class="col-md-8">
                  <div class="mb-2">
                    <label class="form-label fw-bold text-muted d-flex justify-content-between" style="font-size: 0.7rem;">
                      Ingresos Declarados (Aporta positivamente) <span>$ {{ simulatedIngresos }}</span>
                    </label>
                    <input type="range" class="form-range" min="500" max="10000" step="100" [(ngModel)]="simulatedIngresos" (ngModelChange)="recalcularScore()">
                  </div>
                  <div class="mb-2">
                    <label class="form-label fw-bold text-muted d-flex justify-content-between" style="font-size: 0.7rem;">
                      Deudas Externas (Resta Score) <span>$ {{ simulatedDeudas }}</span>
                    </label>
                    <input type="range" class="form-range" min="0" max="15000" step="100" [(ngModel)]="simulatedDeudas" (ngModelChange)="recalcularScore()">
                  </div>
                  <div class="mb-2">
                    <label class="form-label fw-bold text-muted d-flex justify-content-between" style="font-size: 0.7rem;">
                      Tarjetas de Crédito Usadas (Resta Score) <span>$ {{ simulatedTarjetas }}</span>
                    </label>
                    <input type="range" class="form-range" min="0" max="10000" step="100" [(ngModel)]="simulatedTarjetas" (ngModelChange)="recalcularScore()">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
             <!-- Acciones Rápidas -->
          <div class="card border-0 shadow-sm rounded-4 mb-2">
            <div class="card-body p-2">
              <h6 class="fw-bold mb-2" style="color: #1e3a8a;"><i class="bi bi-lightning-fill me-2"></i>Acciones Rápidas</h6>
              
              <div class="row g-2">
                <!-- Register Interaction -->
                <div class="col-md-6 border-end">
                  <form [formGroup]="interactionForm" (ngSubmit)="guardarInteraccion()" class="d-flex flex-column h-100">
                    <div class="d-flex gap-1 mb-1">
                      <button type="button" class="btn btn-sm flex-fill shadow-sm rounded-3 py-0" 
                              [ngClass]="{'btn-primary': interactionForm.get('tipo')?.value === 'LLAMADA', 'btn-light': interactionForm.get('tipo')?.value !== 'LLAMADA'}"
                              (click)="interactionForm.patchValue({tipo: 'LLAMADA'})">
                        <i class="bi bi-telephone-fill" style="font-size: 0.7rem;"></i>
                      </button>
                      <button type="button" class="btn btn-sm flex-fill shadow-sm rounded-3 py-0" 
                              [ngClass]="{'btn-primary': interactionForm.get('tipo')?.value === 'WHATSAPP', 'btn-light': interactionForm.get('tipo')?.value !== 'WHATSAPP'}"
                              (click)="interactionForm.patchValue({tipo: 'WHATSAPP'})">
                        <i class="bi bi-whatsapp" style="font-size: 0.7rem;"></i>
                      </button>
                      <button type="button" class="btn btn-sm flex-fill shadow-sm rounded-3 py-0" 
                              [ngClass]="{'btn-primary': interactionForm.get('tipo')?.value === 'EMAIL', 'btn-light': interactionForm.get('tipo')?.value !== 'EMAIL'}"
                              (click)="interactionForm.patchValue({tipo: 'EMAIL'})">
                        <i class="bi bi-envelope-fill" style="font-size: 0.7rem;"></i>
                      </button>
                      <button type="button" class="btn btn-sm flex-fill shadow-sm rounded-3 py-0" 
                              [ngClass]="{'btn-primary': interactionForm.get('tipo')?.value === 'REUNION', 'btn-light': interactionForm.get('tipo')?.value !== 'REUNION'}"
                              (click)="interactionForm.patchValue({tipo: 'REUNION'})">
                        <i class="bi bi-people-fill" style="font-size: 0.7rem;"></i>
                      </button>
                    </div>
                    <textarea class="form-control bg-light border-0 shadow-none rounded-3 mb-1 p-1" style="font-size: 0.75rem; flex: 1;" formControlName="resumen" placeholder="Resumen..."></textarea>
                    <button type="submit" class="btn btn-primary btn-sm w-100 fw-bold rounded-3 shadow-sm py-0" [disabled]="interactionForm.invalid" style="font-size: 0.7rem;">
                      REGISTRAR
                    </button>
                  </form>
                </div>

                <!-- Schedule Task -->
                <div class="col-md-6">
                  <form [formGroup]="taskForm" (ngSubmit)="guardarTarea()" class="d-flex flex-column h-100">
                    <div class="mb-1">
                      <input type="text" class="form-control form-control-sm bg-light border-0 shadow-none rounded-3" formControlName="descripcion" placeholder="Tarea (Ej: Llamar)">
                    </div>
                    <div class="mb-1">
                      <input type="datetime-local" class="form-control form-control-sm bg-light border-0 shadow-none rounded-3" formControlName="fechaVencimiento">
                    </div>
                    <button type="submit" class="btn btn-sm w-100 fw-bold text-white rounded-3 shadow-sm mt-auto py-0" style="background-color: #4f46e5; font-size: 0.7rem;" [disabled]="taskForm.invalid">
                      AGENDAR EN CALENDARIO
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-2">
            <!-- Tareas Pendientes -->
            <div class="col-md-6">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="fw-bold mb-0" style="color: #1e3a8a;"><i class="bi bi-list-task text-danger me-2"></i>Tareas Pendientes</h6>
                <span class="badge bg-danger-subtle text-danger rounded-pill py-0">{{ getPendingTasks().length }}</span>
              </div>
              <div class="card border-0 shadow-sm rounded-4 h-100" style="min-height: 120px;">
                <div class="card-body p-2">
                  <div *ngIf="getPendingTasks().length === 0" class="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                    <i class="bi bi-check2-circle text-success mb-1" style="font-size: 1.5rem;"></i>
                    <p class="small mb-0" style="font-size: 0.7rem;">Todo al día. No hay tareas pendientes.</p>
                  </div>
                  
                  <div *ngFor="let t of getPendingTasks()" class="d-flex align-items-start gap-2 mb-1 p-1 border-bottom">
                    <div class="form-check mt-1">
                      <input class="form-check-input" type="checkbox" (change)="completarTarea(t.id!)">
                    </div>
                    <div class="flex-fill">
                      <span class="d-block text-dark fw-bold" style="font-size: 0.75rem;">{{ t.descripcion }}</span>
                      <span class="text-danger fw-bold" style="font-size: 0.65rem;"><i class="bi bi-calendar-event me-1"></i>{{ t.fechaVencimiento | date:'short' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Línea de Tiempo -->
            <div class="col-md-6">
              <h6 class="fw-bold mb-1" style="color: #1e3a8a;"><i class="bi bi-clock-history text-primary me-2"></i>Línea de Tiempo</h6>
              <div class="card border-0 shadow-sm rounded-4 h-100" style="min-height: 120px;">
                <div class="card-body p-2" style="max-height: 200px; overflow-y: auto;">
                  <div *ngIf="interactions.length === 0" class="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                    <i class="bi bi-chat-dots mb-1 opacity-50" style="font-size: 1.5rem;"></i>
                    <p class="small mb-0 text-center px-2" style="font-size: 0.7rem;">Registra tu primera interacción.</p>
                  </div>

                  <div *ngFor="let int of interactions" class="d-flex gap-3 mb-4">
                    <div class="d-flex flex-column align-items-center">
                      <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                        <i class="bi" [ngClass]="{
                          'bi-telephone-fill': int.tipo === 'LLAMADA',
                          'bi-whatsapp': int.tipo === 'WHATSAPP',
                          'bi-envelope-fill': int.tipo === 'EMAIL',
                          'bi-people-fill': int.tipo === 'REUNION'
                        }"></i>
                      </div>
                      <div class="bg-light flex-fill mt-2" style="width: 2px;"></div>
                    </div>
                    <div class="flex-fill pt-1 pb-3 border-bottom">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-bold text-dark text-uppercase" style="font-size: 0.75rem;">{{ int.tipo }}</span>
                        <span class="text-muted" style="font-size: 0.7rem;">{{ int.fecha | date:'short' }}</span>
                      </div>
                      <p class="text-muted mb-0" style="font-size: 0.85rem;">{{ int.resumen }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ProspectoDetailComponent implements OnInit {
  private crmService = inject(CrmService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  lead: Lead | null = null;
  interactions: LeadInteraction[] = [];
  tasks: LeadTask[] = [];

  interactionForm: FormGroup = this.fb.group({
    tipo: ['LLAMADA', Validators.required],
    resumen: ['', Validators.required]
  });

  taskForm: FormGroup = this.fb.group({
    descripcion: ['', Validators.required],
    fechaVencimiento: ['', Validators.required]
  });

  // Simulator Data
  simulatedIngresos: number = 0;
  simulatedDeudas: number = 0;
  simulatedTarjetas: number = 0;
  simulatedScore: number = 0;

  scoreChartData: ChartData<'doughnut'> = {
    labels: ['Ingresos (+)', 'Riesgo Deudas (-)', 'Riesgo Tarjetas (-)'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b'], borderWidth: 0 }]
  };

  scoreChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.cargarDatos(params['id']);
      }
    });
  }

  cargarDatos(id: number) {
    this.crmService.getLeadById(id).subscribe(l => {
      // Force mock data for demonstration by creating a new object reference
      this.lead = {
        ...l,
        campana: { nombre: 'Campaña Verano 2024', fechaInicio: '2024-01-01', fechaFin: '2024-12-31', estado: 'Activa' },
        AsesorAsignado: { nombreCompleto: 'Asesor uno' },
        asesorAsignado: { nombreCompleto: 'Asesor uno' }
      } as any;

      this.initSimulator();
    });
    this.loadInteractions();
    this.crmService.getTasks(id).subscribe(t => this.tasks = t);
  }

  loadInteractions() {
    if (this.lead?.id) {
      this.crmService.getInteractions(this.lead.id).subscribe(i => this.interactions = i);
    }
  }

  consultarBuro() {
    if (!this.lead) return;

    Swal.fire({
      title: 'Consultando Buró',
      text: 'Conectando con el proceso externo...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.crmService.syncPerfilFinanciero(this.lead.id!).subscribe({
      next: (perfil) => {
        Swal.close();
        if (perfil) {
          this.lead!.perfilFinanciero = perfil;
          Swal.fire('Éxito', 'Perfil financiero actualizado', 'success');
        } else {
          Swal.fire('Atención', 'No se encontró perfil financiero', 'warning');
        }
      },
      error: (err) => {
        Swal.close();
        console.error('Error al consultar buró', err);
        Swal.fire('Error', 'Hubo un error al consultar el buró. Revise la conexión de la API.', 'error');
      }
    });
  }

  enviarEmail() {
    if (!this.lead || !this.lead.email) {
      Swal.fire('Atención', 'Este prospecto no tiene un correo electrónico configurado.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Enviando correo',
      text: 'Conectando con el servicio de correo...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.crmService.enviarEmail(this.lead.id!).subscribe({
      next: () => {
        Swal.close();
        Swal.fire('Éxito', 'El correo fue enviado exitosamente a través del orquestador.', 'success');
        this.loadInteractions(); // Recargar las interacciones para mostrar la nueva
      },
      error: (err) => {
        Swal.close();
        console.error('Error al enviar correo', err);
        Swal.fire('Error', 'No se pudo enviar el correo.', 'error');
      }
    });
  }

  initSimulator() {
    if (this.lead && this.lead.perfilFinanciero) {
      const pf = this.lead.perfilFinanciero;
      this.simulatedIngresos = pf.ingresosMensuales || 1000;
      this.simulatedDeudas = pf.deudasOtrasEntidades?.reduce((sum, d) => sum + d.saldo, 0) || 0;
      this.simulatedTarjetas = pf.tarjetasCredito?.reduce((sum, t) => sum + t.saldoActual, 0) || 0;
      this.recalcularScore();
    }
  }

  recalcularScore() {
    // Basic mock logic for transparency simulation
    // Score base is 500. Max is 1000.
    // Income adds up to +400 points
    // Debts removes up to -200 points
    // Cards removes up to -100 points
    let pointsIngreso = Math.min(400, (this.simulatedIngresos / 5000) * 400);
    let pointsDeuda = Math.min(200, (this.simulatedDeudas / 10000) * 200);
    let pointsTarjetas = Math.min(100, (this.simulatedTarjetas / 5000) * 100);

    this.simulatedScore = Math.max(300, Math.round(500 + pointsIngreso - pointsDeuda - pointsTarjetas));
    
    this.scoreChartData = {
      labels: ['Ingresos (+)', 'Riesgo Deudas (-)', 'Riesgo Tarjetas (-)'],
      datasets: [{ 
        data: [pointsIngreso, pointsDeuda, pointsTarjetas], 
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], 
        borderWidth: 0 
      }]
    };
  }

  guardarInteraccion() {
    if (this.interactionForm.valid && this.lead) {
      this.crmService.addInteraction(this.lead.id!, this.interactionForm.value).subscribe({
        next: (res) => {
          this.interactions.unshift(res);
          this.interactionForm.reset({ tipo: 'LLAMADA' });
        }
      });
    }
  }

  guardarTarea() {
    if (this.taskForm.valid && this.lead) {
      this.crmService.addTask(this.lead.id!, this.taskForm.value).subscribe({
        next: (res) => {
          this.tasks.push(res);
          this.taskForm.reset();
        }
      });
    }
  }

  completarTarea(taskId: number) {
    this.crmService.completeTask(taskId).subscribe({
      next: () => {
        const t = this.tasks.find(x => x.id === taskId);
        if (t) t.completada = true;
      }
    });
  }

  getPendingTasks() {
    return this.tasks.filter(t => !t.completada);
  }

  volver() {
    this.router.navigate(['/portal/crm']);
  }

  simularCredito() {
    if (this.lead) {
      // Rutear a la simulación pasando el identificador del lead o su cédula
      this.router.navigate(['/portal/simulacion'], { 
        queryParams: { 
          identificacion: this.lead.identificacion,
          nombres: this.lead.nombresCompletos,
          monto: this.lead.montoEstimado
        } 
      });
    }
  }
}


