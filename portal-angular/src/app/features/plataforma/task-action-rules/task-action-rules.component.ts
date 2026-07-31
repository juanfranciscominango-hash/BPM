import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskActionService, TaskActionRule } from '../../../core/services/task-action.service';
import { ProcessService } from '../../../core/services/process.service';

@Component({
  selector: 'app-task-action-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <h3 class="mb-4 text-primary"><i class="bi bi-code-square me-2"></i>Reglas de Tareas (Eventos)</h3>
      
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row align-items-end">
            <div class="col-md-5">
              <label class="form-label text-muted fw-bold">Proceso</label>
              <select class="form-select" [(ngModel)]="selectedProcess" (change)="loadRules()">
                <option value="">Seleccione un proceso...</option>
                <option *ngFor="let p of processes" [value]="p.key">{{ p.name }} ({{ p.key }})</option>
              </select>
            </div>
            <div class="col-md-7 text-end">
              <button class="btn btn-primary shadow-sm rounded-pill px-4" [disabled]="!selectedProcess" (click)="openRuleModal()">
                <i class="bi bi-plus-circle me-1"></i> Nueva Regla
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm" *ngIf="selectedProcess">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Tarea</th>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Nombre Regla</th>
                  <th>Expresión/Condición</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rule of rules">
                  <td><span class="badge bg-secondary">{{ rule.taskDefinitionKey }}</span></td>
                  <td>
                    <span class="badge rounded-pill" 
                          [ngClass]="{'bg-primary': rule.eventTrigger === 'ON_ENTER', 
                                      'bg-info text-dark': rule.eventTrigger === 'ON_SAVE',
                                      'bg-success': rule.eventTrigger === 'ON_EXIT'}">
                      {{ rule.eventTrigger }}
                    </span>
                  </td>
                  <td><span class="badge bg-dark">{{ rule.actionType }}</span></td>
                  <td><strong>{{ rule.ruleName }}</strong></td>
                  <td class="font-monospace small text-muted text-truncate" style="max-width: 250px;">
                    <div *ngIf="rule.conditionExpression">C: {{ rule.conditionExpression }}</div>
                    A: {{ rule.actionExpression }}
                  </td>
                  <td>{{ rule.sortOrder }}</td>
                  <td>
                    <span class="badge" [ngClass]="rule.active ? 'bg-success' : 'bg-danger'">
                      {{ rule.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-2" (click)="editRule(rule)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteRule(rule.id!)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="rules.length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle fs-4 d-block mb-2"></i>
                    No hay reglas configuradas para este proceso.
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
            <h5 class="modal-title fw-bold text-primary">{{ isEdit ? 'Editar Regla' : 'Nueva Regla' }}</h5>
            <button type="button" class="btn-close" (click)="closeRuleModal()"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">ID Tarea (Key)</label>
                <input type="text" class="form-control" [(ngModel)]="currentRule.taskDefinitionKey" placeholder="ej: tarea_aprobacion">
              </div>
              <div class="col-md-6">
                <label class="form-label">Evento (Gatillo)</label>
                <select class="form-select" [(ngModel)]="currentRule.eventTrigger">
                  <option value="ON_ENTER">AL ENTRAR (On Enter)</option>
                  <option value="ON_SAVE">AL GUARDAR (On Save)</option>
                  <option value="ON_EXIT">AL SALIR (On Exit)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Nombre de Regla</label>
                <input type="text" class="form-control" [(ngModel)]="currentRule.ruleName" placeholder="Validar campos obligatorios">
              </div>
              <div class="col-md-6">
                <label class="form-label">Tipo de Acción</label>
                <select class="form-select" [(ngModel)]="currentRule.actionType">
                  <option value="VALIDATION">Validación (Fallo = Bloquea flujo)</option>
                  <option value="ASSIGNMENT">Asignación (Calcula y guarda var)</option>
                  <option value="EXPRESSION">Expresión Libres (Ejecuta código)</option>
                  <option value="NOTIFICATION">Notificación (Envía correo/msj)</option>
                  <option value="API_CALL">Llamada a API Externa</option>
                </select>
              </div>

              <div class="col-md-12">
                <label class="form-label">Condición (Opcional - JUEL/SPEL)</label>
                <input type="text" class="form-control font-monospace" [(ngModel)]="currentRule.conditionExpression" placeholder="\${ monto > 50000 }">
                <small class="text-muted">Si se deja vacío, la acción se ejecutará siempre en este evento.</small>
              </div>

              <div class="col-md-12">
                <label class="form-label text-primary fw-bold">Expresión de la Acción (JUEL/SPEL)</label>
                <textarea class="form-control font-monospace" rows="3" [(ngModel)]="currentRule.actionExpression" placeholder="\${ cedula != null }"></textarea>
              </div>

              <!-- Extra fields dependent on type -->
              <ng-container *ngIf="currentRule.actionType === 'VALIDATION'">
                <div class="col-md-12">
                  <label class="form-label text-danger">Mensaje de Error (Se mostrará al usuario si falla la validación)</label>
                  <input type="text" class="form-control" [(ngModel)]="currentRule.errorMessage" placeholder="La cédula es requerida.">
                </div>
              </ng-container>

              <ng-container *ngIf="currentRule.actionType === 'ASSIGNMENT'">
                <div class="col-md-12">
                  <label class="form-label text-success">Variable Destino</label>
                  <input type="text" class="form-control" [(ngModel)]="currentRule.targetVariable" placeholder="tasa_interes">
                </div>
              </ng-container>

              <div class="col-md-6">
                <label class="form-label">Orden de Ejecución</label>
                <input type="number" class="form-control" [(ngModel)]="currentRule.sortOrder">
              </div>
              <div class="col-md-6 d-flex align-items-end pb-2">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="activeSwitch" [(ngModel)]="currentRule.active">
                  <label class="form-check-label" for="activeSwitch">Activo</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="closeRuleModal()">Cancelar</button>
            <button type="button" class="btn btn-primary rounded-pill px-4" (click)="saveRule()" [disabled]="!isValid()">
              <i class="bi bi-save me-1"></i> Guardar Regla
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskActionRulesComponent implements OnInit {
  private taskActionService = inject(TaskActionService);
  private processService = inject(ProcessService);

  processes: any[] = [];
  selectedProcess: string = '';
  rules: TaskActionRule[] = [];

  isModalOpen = false;
  isEdit = false;
  currentRule: Partial<TaskActionRule> = this.getEmptyRule();

  ngOnInit() {
    this.processService.getProcesses().subscribe(res => {
      // Tomamos solo procesos únicos por key
      const uniqueMap = new Map();
      res.forEach(p => {
        if (!uniqueMap.has(p.key)) {
          uniqueMap.set(p.key, p);
        }
      });
      this.processes = Array.from(uniqueMap.values());
    });
  }

  loadRules() {
    if (!this.selectedProcess) return;
    this.taskActionService.getByProcess(this.selectedProcess).subscribe(res => {
      this.rules = res;
    });
  }

  getEmptyRule(): Partial<TaskActionRule> {
    return {
      processDefinitionKey: this.selectedProcess,
      eventTrigger: 'ON_SAVE',
      actionType: 'VALIDATION',
      taskDefinitionKey: '',
      ruleName: '',
      actionExpression: '',
      sortOrder: 10,
      active: true
    };
  }

  openRuleModal() {
    this.currentRule = this.getEmptyRule();
    this.isEdit = false;
    this.isModalOpen = true;
  }

  editRule(rule: TaskActionRule) {
    this.currentRule = { ...rule };
    this.isEdit = true;
    this.isModalOpen = true;
  }

  closeRuleModal() {
    this.isModalOpen = false;
  }

  isValid() {
    return this.currentRule.taskDefinitionKey && 
           this.currentRule.ruleName && 
           this.currentRule.actionExpression;
  }

  saveRule() {
    const rule = this.currentRule as TaskActionRule;
    if (this.isEdit && rule.id) {
      this.taskActionService.update(rule.id, rule).subscribe(() => {
        this.loadRules();
        this.closeRuleModal();
      });
    } else {
      this.taskActionService.create(rule).subscribe(() => {
        this.loadRules();
        this.closeRuleModal();
      });
    }
  }

  deleteRule(id: number) {
    if(confirm('¿Está seguro de eliminar esta regla?')) {
      this.taskActionService.delete(id).subscribe(() => this.loadRules());
    }
  }
}

