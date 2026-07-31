import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebhookService, WebhookConfig } from '../../../core/services/webhook.service';
import { ProcessService } from '../../../core/services/process.service';

@Component({
  selector: 'app-webhooks-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <h3 class="mb-4 text-primary"><i class="bi bi-diagram-3 me-2"></i>Configuración de Webhooks</h3>
      
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row align-items-end">
            <div class="col-md-5">
              <label class="form-label text-muted fw-bold">Filtrar por Proceso</label>
              <select class="form-select" [(ngModel)]="selectedProcess" (change)="applyFilter()">
                <option value="">-- Todos los Procesos / Globales --</option>
                <option *ngFor="let p of processes" [value]="p.key">{{ p.name }} ({{ p.key }})</option>
              </select>
            </div>
            <div class="col-md-7 text-end">
              <button class="btn btn-primary shadow-sm rounded-pill px-4" (click)="openModal()">
                <i class="bi bi-plus-circle me-1"></i> Nuevo Webhook
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Proceso (Key)</th>
                  <th>URL (Endpoint)</th>
                  <th>Eventos Suscritos</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let wh of filteredWebhooks">
                  <td>
                    <span class="badge bg-secondary" *ngIf="wh.processDefinitionKey">{{ wh.processDefinitionKey }}</span>
                    <span class="badge bg-info text-dark" *ngIf="!wh.processDefinitionKey">Global (Todos)</span>
                  </td>
                  <td><a [href]="wh.url" target="_blank" class="text-decoration-none text-truncate d-inline-block" style="max-width:300px">{{ wh.url }}</a></td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span class="badge bg-dark" *ngFor="let ev of wh.events.split(',')">{{ ev }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="wh.active ? 'bg-success' : 'bg-danger'">
                      {{ wh.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-2" (click)="edit(wh)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteWh(wh.id!)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredWebhooks.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    No hay webhooks configurados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal" tabindex="-1" [ngClass]="{'show d-block': isModalOpen}" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-0 bg-light">
            <h5 class="modal-title fw-bold text-primary">{{ isEdit ? 'Editar Webhook' : 'Nuevo Webhook' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label">Proceso (Dejar en blanco para GLOBAL)</label>
                <select class="form-select" [(ngModel)]="currentWh.processDefinitionKey">
                  <option value="">-- Aplica a Todos los Procesos --</option>
                  <option *ngFor="let p of processes" [value]="p.key">{{ p.name }} ({{ p.key }})</option>
                </select>
              </div>
              
              <div class="col-md-12">
                <label class="form-label">URL del Webhook (POST)</label>
                <input type="url" class="form-control" [(ngModel)]="currentWh.url" placeholder="https://api.empresa.com/webhook/bpm">
              </div>

              <div class="col-md-12">
                <label class="form-label">Secret Key (Token de Autorización - Opcional)</label>
                <input type="text" class="form-control" [(ngModel)]="currentWh.secretKey" placeholder="Bearer Token o HMAC Secret">
              </div>

              <div class="col-md-12">
                <label class="form-label text-primary fw-bold">Eventos a Escuchar</label>
                <div class="d-flex flex-wrap gap-3 mt-2">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="ev1" [checked]="hasEvent('PROCESS_STARTED')" (change)="toggleEvent('PROCESS_STARTED', $event)">
                    <label class="form-check-label" for="ev1">PROCESS_STARTED</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="ev2" [checked]="hasEvent('PROCESS_COMPLETED')" (change)="toggleEvent('PROCESS_COMPLETED', $event)">
                    <label class="form-check-label" for="ev2">PROCESS_COMPLETED</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="ev3" [checked]="hasEvent('TASK_CREATED')" (change)="toggleEvent('TASK_CREATED', $event)">
                    <label class="form-check-label" for="ev3">TASK_CREATED</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="ev4" [checked]="hasEvent('TASK_COMPLETED')" (change)="toggleEvent('TASK_COMPLETED', $event)">
                    <label class="form-check-label" for="ev4">TASK_COMPLETED</label>
                  </div>
                </div>
              </div>

              <div class="col-md-12 mt-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="activeSwitchWh" [(ngModel)]="currentWh.active">
                  <label class="form-check-label fw-bold" for="activeSwitchWh">Activo (Enviará peticiones)</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary rounded-pill px-4" (click)="save()" [disabled]="!isValid()">
              <i class="bi bi-save me-1"></i> Guardar Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WebhooksConfigComponent implements OnInit {
  private webhookService = inject(WebhookService);
  private processService = inject(ProcessService);

  processes: any[] = [];
  selectedProcess: string = '';
  
  webhooks: WebhookConfig[] = [];
  filteredWebhooks: WebhookConfig[] = [];

  isModalOpen = false;
  isEdit = false;
  currentWh: Partial<WebhookConfig> = this.getEmptyWh();

  ngOnInit() {
    this.processService.getProcesses().subscribe(res => {
      const uniqueMap = new Map();
      res.forEach(p => {
        if (!uniqueMap.has(p.key)) {
          uniqueMap.set(p.key, p);
        }
      });
      this.processes = Array.from(uniqueMap.values());
    });
    this.loadAll();
  }

  loadAll() {
    this.webhookService.getAll().subscribe(res => {
      this.webhooks = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    if (!this.selectedProcess) {
      this.filteredWebhooks = this.webhooks;
    } else {
      this.filteredWebhooks = this.webhooks.filter(w => w.processDefinitionKey === this.selectedProcess || !w.processDefinitionKey);
    }
  }

  getEmptyWh(): Partial<WebhookConfig> {
    return {
      processDefinitionKey: this.selectedProcess,
      url: '',
      events: 'PROCESS_STARTED,PROCESS_COMPLETED',
      active: true,
      secretKey: ''
    };
  }

  openModal() {
    this.currentWh = this.getEmptyWh();
    this.isEdit = false;
    this.isModalOpen = true;
  }

  edit(wh: WebhookConfig) {
    this.currentWh = { ...wh };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  hasEvent(ev: string): boolean {
    if (!this.currentWh.events) return false;
    return this.currentWh.events.split(',').includes(ev);
  }

  toggleEvent(ev: string, event: any) {
    let evArr = this.currentWh.events ? this.currentWh.events.split(',').filter(e => e.trim() !== '') : [];
    if (event.target.checked) {
      if (!evArr.includes(ev)) evArr.push(ev);
    } else {
      evArr = evArr.filter(e => e !== ev);
    }
    this.currentWh.events = evArr.join(',');
  }

  isValid() {
    return this.currentWh.url && this.currentWh.url.startsWith('http') && this.currentWh.events;
  }

  save() {
    const wh = this.currentWh as WebhookConfig;
    // Si processKey está vacío, mandarlo null para indicar global
    if (!wh.processDefinitionKey || wh.processDefinitionKey.trim() === '') {
      wh.processDefinitionKey = undefined;
    }

    if (this.isEdit && wh.id) {
      this.webhookService.update(wh.id, wh).subscribe(() => {
        this.loadAll();
        this.closeModal();
      });
    } else {
      this.webhookService.create(wh).subscribe(() => {
        this.loadAll();
        this.closeModal();
      });
    }
  }

  deleteWh(id: number) {
    if(confirm('¿Está seguro de eliminar este Webhook?')) {
      this.webhookService.delete(id).subscribe(() => this.loadAll());
    }
  }
}

