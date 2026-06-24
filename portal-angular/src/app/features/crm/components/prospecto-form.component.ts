import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiManagerService } from '../../../core/services/api-manager.service';
import { CrmService, Asesor, OrigenLead } from '../services/crm.service';

@Component({
  selector: 'app-prospecto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-4 d-flex justify-content-center align-items-center" style="background-color: #f8f9fa; min-height: 100vh;">
      <div class="card border-0 shadow-lg rounded-4" style="max-width: 950px; width: 100%;">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <h2 class="fw-bold mb-1" style="color: #1e3a8a;">Registrar <span style="color: #3b82f6;">Prospecto</span></h2>
            <p class="text-muted small">Completa la información para realizar el seguimiento comercial de esta oportunidad.</p>
          </div>

          <form [formGroup]="leadForm" (ngSubmit)="guardar()">
            <div class="row g-4">
              <!-- Left Column -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Identificación</label>
                  <div class="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                    <input type="text" class="form-control bg-light border-0 shadow-none" formControlName="identificacion" placeholder="Ej. 1700000000">
                    <button class="btn btn-primary px-3 border-0" type="button" (click)="buscarCliente()" [disabled]="buscandoCliente" style="background-color: #3b82f6;">
                      <i class="bi" [ngClass]="buscandoCliente ? 'bi-hourglass-split' : 'bi-search'"></i>
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Nombre Completo / Contacto</label>
                  <input type="text" class="form-control form-control-lg bg-light border-0 shadow-none rounded-3" formControlName="nombresCompletos" placeholder="Ej. Juan Pérez">
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Empresa / Negocio</label>
                  <input type="text" class="form-control form-control-lg bg-light border-0 shadow-none rounded-3" formControlName="empresa" placeholder="Ej. Corporación X">
                </div>
                <div class="row g-2">
                  <div class="col-6 mb-3">
                    <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Teléfono</label>
                    <input type="text" class="form-control form-control-lg bg-light border-0 shadow-none rounded-3" formControlName="telefono" placeholder="Ej. 099...">
                  </div>
                  <div class="col-6 mb-3">
                    <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Monto Estimado ($)</label>
                    <input type="number" class="form-control form-control-lg border-0 shadow-none rounded-3" style="background-color: #eff6ff; color: #1e3a8a; font-weight: bold;" formControlName="montoEstimado" placeholder="0.00">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Email de Contacto</label>
                  <input type="email" class="form-control form-control-lg bg-light border-0 shadow-none rounded-3" formControlName="email">
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-md-6">
                <div class="mb-4">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Estado del Prospecto</label>
                  <div class="d-flex gap-2">
                    <div class="flex-fill text-center p-3 rounded-3 cursor-pointer border transition-all" 
                         [ngClass]="{'bg-dark text-white border-dark': leadForm.get('estado')?.value === 'FRIO', 'bg-light border-light text-muted': leadForm.get('estado')?.value !== 'FRIO'}"
                         (click)="leadForm.patchValue({estado: 'FRIO'})">
                      <span class="d-block fw-bold" style="font-size: 0.8rem;">FRÍO</span>
                      <i class="bi bi-snow"></i>
                    </div>
                    <div class="flex-fill text-center p-3 rounded-3 cursor-pointer border transition-all" 
                         [ngClass]="{'bg-warning text-dark border-warning': leadForm.get('estado')?.value === 'TIBIO', 'bg-light border-light text-muted': leadForm.get('estado')?.value !== 'TIBIO'}"
                         (click)="leadForm.patchValue({estado: 'TIBIO'})">
                      <span class="d-block fw-bold" style="font-size: 0.8rem;">TIBIO</span>
                      <i class="bi bi-sun"></i>
                    </div>
                    <div class="flex-fill text-center p-3 rounded-3 cursor-pointer border transition-all" 
                         [ngClass]="{'bg-danger text-white border-danger': leadForm.get('estado')?.value === 'CALIENTE', 'bg-light border-light text-muted': leadForm.get('estado')?.value !== 'CALIENTE'}"
                         (click)="leadForm.patchValue({estado: 'CALIENTE'})">
                      <span class="d-block fw-bold" style="font-size: 0.8rem;">CALIENTE</span>
                      <i class="bi bi-fire"></i>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Asesor Asignado</label>
                  <select class="form-select form-select-lg bg-light border-0 shadow-none rounded-3 fw-bold" formControlName="AsesorId">
                    <option [ngValue]="null">-- Sin Asignar --</option>
                    <option *ngFor="let v of asesores" [ngValue]="v.id">{{ v.nombreCompleto }}</option>
                  </select>
                </div>

                <div class="mb-4">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Origen del Lead</label>
                  <select class="form-select form-select-lg bg-light border-0 shadow-none rounded-3 fw-bold" formControlName="origenId">
                    <option [ngValue]="null">-- Seleccionar Origen --</option>
                    <option *ngFor="let o of origenes" [ngValue]="o.id">{{ o.nombre }}</option>
                  </select>
                </div>

                <div class="mb-4" *ngIf="isReferido()">
                  <label class="form-label small fw-bold text-muted text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Nombre del Referido</label>
                  <input type="text" class="form-control form-control-lg bg-light border-0 shadow-none rounded-3" formControlName="referencia" placeholder="¿Quién lo refirió?">
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-3 mt-4 pt-4 border-top">
              <button type="button" class="btn btn-light btn-lg px-4 fw-bold rounded-3" (click)="cancelar()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-lg px-5 fw-bold rounded-3 shadow-sm" style="background-color: #2563eb; border: none;" [disabled]="leadForm.invalid">
                <i class="bi bi-save me-2"></i> CREAR PROSPECTO
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .transition-all { transition: all 0.2s ease-in-out; }
    .transition-all:hover { filter: brightness(0.95); }
  `]
})
export class ProspectoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private crmService = inject(CrmService);
  private apiManagerService = inject(ApiManagerService);
  private router = inject(Router);

  asesores: Asesor[] = [];
  origenes: OrigenLead[] = [];
  buscandoCliente = false;

  leadForm: FormGroup = this.fb.group({
    nombresCompletos: ['', Validators.required],
    identificacion: [''],
    empresa: [''],
    telefono: [''],
    email: [''],
    estado: ['FRIO', Validators.required],
    montoEstimado: [0],
    AsesorId: [null],
    origenId: [null],
    referencia: ['']
  });

  ngOnInit() {
    this.crmService.getAsesores().subscribe(v => this.asesores = v);
    this.crmService.getOrigenes().subscribe(o => this.origenes = o);
  }

  buscarCliente() {
    const ident = this.leadForm.get('identificacion')?.value;
    if (!ident) {
      alert("Por favor ingresa una identificación primero.");
      return;
    }
    
    this.buscandoCliente = true;
    this.apiManagerService.testApi('APICLI', { interviniente_int_identificacion: ident, DocumentNumber: ident }).subscribe({
      next: (res: any) => {
        this.buscandoCliente = false;

        let fullName = '';
        let email = '';
        let phone = '';
        let monto = 0;

        let dataObj = res;
        if (Array.isArray(res) && res.length > 0) dataObj = res[0];
        else if (res && res.data && Array.isArray(res.data) && res.data.length > 0) dataObj = res.data[0];
        else if (res && res.value && Array.isArray(res.value) && res.value.length > 0) dataObj = res.value[0];

        if (dataObj) {
          if (dataObj.interviniente_int_nombres_completos) {
            fullName = dataObj.interviniente_int_nombres_completos;
          } else if (dataObj.nombres_completos) {
            fullName = dataObj.nombres_completos;
          } else if (dataObj.primer_nombre || dataObj.primer_apellido) {
            fullName = `${dataObj.primer_nombre || ''} ${dataObj.segundo_nombre || ''} ${dataObj.primer_apellido || ''} ${dataObj.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();
          }

          email = dataObj.correo || dataObj.email || '';
          phone = dataObj.telefono || dataObj.celular || '';
          if (dataObj.valorMaximoPrestamo) {
            monto = Number(dataObj.valorMaximoPrestamo);
          }
        }

        if (fullName) {
          const patchData: any = { 
            nombresCompletos: fullName,
            email: email,
            telefono: phone
          };
          if (monto > 0) {
            patchData.montoEstimado = monto;
          }
          this.leadForm.patchValue(patchData);
        } else {
          alert("No se encontraron datos para esta identificación.");
        }
      },
      error: (err: any) => {
        this.buscandoCliente = false;
        alert("Error al conectar con APICLI");
        console.error(err);
      }
    });
  }

  isReferido(): boolean {
    const origenId = this.leadForm.get('origenId')?.value;
    if (!origenId) return false;
    const origen = this.origenes.find(o => o.id == origenId);
    return origen ? origen.nombre.toLowerCase().includes('referido') : false;
  }

  guardar() {
    if (this.leadForm.valid) {
      const val = this.leadForm.value;
      const leadPayload = {
        nombresCompletos: val.nombresCompletos,
        identificacion: val.identificacion,
        empresa: val.empresa,
        telefono: val.telefono,
        email: val.email,
        estado: val.estado,
        montoEstimado: val.montoEstimado,
        AsesorAsignado: val.AsesorId ? { id: val.AsesorId } : null,
        origen: val.origenId ? { id: val.origenId } : null,
        referencia: this.isReferido() ? val.referencia : null
      };

      this.crmService.createLead(leadPayload).subscribe({
        next: () => {
          this.router.navigate(['/portal/crm']);
        },
        error: (err) => alert('Error creando el lead')
      });
    }
  }

  cancelar() {
    this.router.navigate(['/portal/crm']);
  }
}


