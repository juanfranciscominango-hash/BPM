import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService, UserTask } from '../../../core/services/task.service';
import { ProcessService } from '../../../core/services/process.service';
import { MetaService, MetaAttribute } from '../../../core/services/meta.service';
import { ParametricService } from '../../../core/services/parametric.service';
import { ScreenService, ScreenDefinition } from '../../../core/services/screen.service';
import { DocumentService, DocumentDefinition, StoredDocument } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { TwoDecimalsDirective } from '../../../shared/directives/two-decimals.directive';

@Component({
  selector: 'app-bandeja-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TwoDecimalsDirective],
  template: `
    <div class="container-fluid p-4">
      <div class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-inbox-fill me-2"></i>Bandeja de Tareas</h2>
          <p class="text-muted mb-0">Tareas pendientes asignadas a tu usuario en los procesos activos.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- Column Selector Dropdown -->
          <div class="dropdown">
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle shadow-sm" type="button" id="dropdownColumns" data-bs-toggle="dropdown" aria-expanded="false" (click)="$event.stopPropagation()">
              <i class="bi bi-grid-3x3-gap me-1"></i>Columnas
            </button>
            <ul class="dropdown-menu dropdown-menu-end p-3 shadow border-0 rounded-3" aria-labelledby="dropdownColumns" style="min-width: 220px;" (click)="$event.stopPropagation()">
              <li class="mb-2 fw-semibold text-secondary small text-uppercase">Configurar Columnas</li>
              <li *ngFor="let col of columns">
                <div class="form-check py-1">
                  <input class="form-check-input" type="checkbox" [id]="'col-' + col.key" [(ngModel)]="col.visible" (change)="guardarPreferenciasColumnas()">
                  <label class="form-check-label small" [for]="'col-' + col.key">{{ col.label }}</label>
                </div>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="btn btn-sm btn-primary w-100 mt-1 rounded-pill" (click)="abrirGestionColumnas()">
                  <i class="bi bi-gear me-1"></i>Gestionar DB Cols
                </button>
              </li>
            </ul>
          </div>
          
          <button class="btn btn-outline-primary btn-sm shadow-sm px-3" (click)="cargarTareas()">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>
        </div>
      </div>
 
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-body p-0">
              <div class="table-responsive" style="min-height: 380px;">
                <table class="table table-hover align-middle mb-0">
                  <thead class="bg-light text-muted small text-uppercase">
                    <tr>
                      <th class="ps-4">Acciones</th>
                      <ng-container *ngFor="let col of columns">
                        <th *ngIf="col.visible">{{ col.label }}</th>
                      </ng-container>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let task of tasks">
                      <td class="ps-4">
                        <button class="btn btn-sm btn-outline-info me-2 rounded-pill px-3" [routerLink]="['/plataforma/monitoreo', task.processInstanceId]">
                          <i class="bi bi-eye me-1"></i>Ver Progreso
                        </button>
                        <button class="btn btn-sm btn-primary px-3 shadow-sm rounded-pill" (click)="abrirFormulario(task)">
                          <i class="bi bi-pencil-square me-1"></i>Completar
                        </button>
                      </td>
                      <ng-container *ngFor="let col of columns">
                        <td *ngIf="col.visible">
                          <ng-container [ngSwitch]="col.key">
                            <div *ngSwitchCase="'task'">
                              <div class="fw-bold text-dark">{{ task.name }}</div>
                              <small class="text-muted">ID: {{ task.id }}</small>
                            </div>
                            <div *ngSwitchCase="'caseNumber'">
                              <span class="fw-bold text-dark">{{ task.numeroCaso || task.processInstanceId }}</span>
                              <div class="small text-muted mt-1">{{ task.processName || task.processDefinitionId.split(':')[0] }}</div>
                            </div>
                            <div *ngSwitchCase="'client'">
                              <div class="fw-semibold text-dark">{{ task.nombreCompleto || 'Sin Cliente' }}</div>
                              <small class="text-muted"><i class="bi bi-card-text me-1"></i>{{ task.identificacion || '-' }}</small>
                            </div>
                            <div *ngSwitchCase="'creditDetails'">
                              <div *ngIf="task.producto" class="fw-semibold text-primary small">{{ task.producto }}</div>
                              <div class="small text-dark fw-bold">
                                <span *ngIf="task.monto">{{ task.monto | currency:'USD':'symbol':'1.2-2' }}</span>
                                <span *ngIf="task.plazo" class="text-muted font-normal"> / {{ task.plazo }} meses</span>
                              </div>
                            </div>
                            <span *ngSwitchCase="'assignee'" class="badge bg-light text-dark border">
                              {{ task.assignee || 'Sin asignar' }}
                            </span>
                            <span *ngSwitchCase="'advisor'" class="badge bg-light text-dark border px-2 py-1">
                              <i class="bi bi-person-badge-fill text-muted me-1"></i>{{ task.asesor || 'Desconocido' }}
                            </span>
                            <span *ngSwitchCase="'createTime'">
                              {{ task.createTime | date:'yyyy-MM-dd HH:mm:ss' }}
                            </span>
                            <ng-container *ngSwitchDefault>
                              <span [ngSwitch]="col.type">
                                <span *ngSwitchCase="'currency'" class="fw-bold text-dark">
                                  {{ getAdditionalVar(task, col.key) | currency:'USD':'symbol':'1.2-2' }}
                                </span>
                                <span *ngSwitchCase="'date'">
                                  {{ getAdditionalVar(task, col.key) | date:'yyyy-MM-dd HH:mm:ss' }}
                                </span>
                                <span *ngSwitchCase="'number'" class="fw-semibold">
                                  {{ getAdditionalVar(task, col.key) }}
                                </span>
                                <span *ngSwitchDefault>
                                  {{ getAdditionalVar(task, col.key) || '-' }}
                                </span>
                              </span>
                            </ng-container>
                          </ng-container>
                        </td>
                      </ng-container>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gestionar Columnas de DB -->
    <div class="modal fade show d-block" *ngIf="mostrarModalCols" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1050; overflow-y: auto;">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-dark text-white rounded-top-4">
            <h5 class="modal-title fw-bold"><i class="bi bi-grid-3x3-gap me-2"></i>Gestionar Columnas DB</h5>
            <button type="button" class="btn-close btn-close-white" (click)="cerrarGestionColumnas()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-4">
              <label class="fw-bold text-secondary small text-uppercase mb-2">Columnas en Base de Datos</label>
              <div class="list-group list-group-flush border rounded-3 overflow-hidden" style="max-height: 180px; overflow-y: auto;">
                <div *ngFor="let col of columnsFromDb" class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                  <div>
                    <span class="fw-semibold text-dark">{{ col.labelName }}</span>
                    <div class="small text-muted">BPM Var: {{ col.variableName }} ({{ col.columnType }})</div>
                  </div>
                  <button *ngIf="!esColumnaFija(col.keyName)" class="btn btn-sm btn-outline-danger border-0 rounded-circle" (click)="eliminarColumnaDb(col.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                  <span *ngIf="esColumnaFija(col.keyName)" class="badge bg-light text-muted border">Sistema</span>
                </div>
              </div>
            </div>

            <div>
              <label class="fw-bold text-secondary small text-uppercase mb-3">Agregar Nueva Columna</label>
              <form [formGroup]="colForm" (ngSubmit)="agregarColumnaDb()">
                <div class="mb-2">
                  <label class="form-label small mb-1 text-muted">Título Columna</label>
                  <input type="text" class="form-control form-control-sm" formControlName="labelName" placeholder="Ej: Score de Riesgo" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small mb-1 text-muted">ID Columna (Key)</label>
                  <input type="text" class="form-control form-control-sm" formControlName="keyName" placeholder="Ej: score" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small mb-1 text-muted">Variable en Flowable</label>
                  <input type="text" class="form-control form-control-sm" formControlName="variableName" placeholder="Ej: score_riesgo" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small mb-1 text-muted">Tipo de Dato</label>
                  <select class="form-select form-select-sm" formControlName="columnType" required>
                    <option value="text">Texto</option>
                    <option value="currency">Moneda (USD)</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-sm btn-primary w-100 rounded-pill py-2" [disabled]="colForm.invalid">
                  <i class="bi bi-plus-circle me-1"></i>Crear en DB
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Formulario Dinámico con Pestañas y Documentos -->
    <div class="modal fade show d-block" *ngIf="mostrarModal" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1040; overflow-y: auto;">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="bi bi-clipboard-check me-2"></i>Tarea: {{ selectedTask?.name }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="mostrarModal = false"></button>
          </div>
          <div class="modal-body p-0" *ngIf="dynamicForm">
            
            <!-- TABS NAVIGATION -->
            <ul class="nav nav-tabs px-4 pt-3 bg-light">
              <!-- Tabs dinámicas del diseño -->
              <ng-container *ngIf="screenLayout?.tabs?.length > 0">
                <li class="nav-item" *ngFor="let tab of screenLayout.tabs; let tIdx = index">
                  <a class="nav-link cursor-pointer" [class.active]="activeTabIdx === tIdx" (click)="activeTabIdx = tIdx" href="javascript:void(0)">
                    {{ tab.title }}
                  </a>
                </li>
              </ng-container>
              <!-- Tab por defecto si no hay diseño -->
              <li class="nav-item" *ngIf="!screenLayout?.tabs">
                <a class="nav-link active" href="javascript:void(0)">Formulario</a>
              </li>
              <!-- TAB DE DOCUMENTOS (SIEMPRE DISPONIBLE) -->
              <li class="nav-item">
                <a class="nav-link cursor-pointer" [class.active]="activeTabIdx === 99" (click)="activeTabIdx = 99" href="javascript:void(0)">
                  <i class="bi bi-files me-1"></i>Documentos
                </a>
              </li>
            </ul>

            <div class="p-4">
              <!-- SECCIÓN FORMULARIO -->
              <div *ngIf="activeTabIdx !== 99" [formGroup]="dynamicForm">
                <ng-container *ngIf="screenLayout?.tabs; else defaultLayout">
                  <div *ngFor="let tab of screenLayout.tabs; let tIdx = index" [hidden]="activeTabIdx !== tIdx">
                    <div *ngFor="let section of tab.sections" class="mb-4 bg-white p-3 rounded border shadow-xs">
                      <h6 class="fw-bold text-primary border-bottom pb-2 mb-3"><i class="bi bi-chevron-right me-1 small"></i>{{ section.title }}</h6>
                      <div class="row g-3">
                        <ng-container *ngFor="let field of section.fields">
                          <div *ngIf="isFieldVisible(field)" [class]="'col-md-' + (field.cols || 6)">
                            <ng-container *ngTemplateOutlet="fieldTemplate; context: { $implicit: getAttribute(field.name), fieldConfig: field }"></ng-container>
                          </div>
                        </ng-container>
                      </div>
                    </div>
                  </div>
                </ng-container>

                <ng-template #defaultLayout>
                  <div class="row g-3">
                    <div *ngFor="let attr of metaAttributes" [class]="attr.type === 'TEXT' ? 'col-12' : 'col-md-6'">
                      <ng-container *ngTemplateOutlet="fieldTemplate; context: { $implicit: attr, fieldConfig: null }"></ng-container>
                    </div>
                  </div>
                </ng-template>
              </div>

              <!-- SECCIÓN DOCUMENTOS -->
              <div *ngIf="activeTabIdx === 99">
                <div class="mb-4" *ngFor="let def of docDefinitions">
                  <div class="d-flex justify-content-between align-items-center p-3 border rounded bg-white shadow-sm mb-2">
                    <div>
                      <h6 class="mb-1 fw-bold text-dark">{{ def.name }}</h6>
                      <p class="text-muted small mb-0">{{ def.description }}</p>
                      <span *ngIf="def.required" class="badge bg-danger-subtle text-danger border border-danger-subtle mt-1">Requerido</span>
                    </div>
                    <div>
                      <input type="file" #fileInput [style.display]="'none'" (change)="onFileSelected($event, def.id!)">
                      <button *ngIf="!def.isTemplate" class="btn btn-sm btn-outline-primary" (click)="fileInput.click()">
                        <i class="bi bi-upload me-1"></i>Subir
                      </button>
                      <button *ngIf="def.isTemplate" class="btn btn-sm btn-success" (click)="generarDocumento(def)">
                        <i class="bi bi-gear-fill me-1"></i>Generar
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <h6 class="fw-bold mb-3">Archivos Adjuntos</h6>
                  <ul class="list-group list-group-flush border rounded border-bottom-0">
                    <li *ngFor="let doc of storedDocuments" class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <i class="bi bi-file-earmark-pdf text-danger me-2 fs-5"></i>
                        <span class="fw-semibold">{{ doc.fileName }}</span>
                        <small class="text-muted d-block">{{ doc.uploadedAt | date:'medium' }} por {{ doc.uploadedBy }}</small>
                      </div>
                      <button class="btn btn-sm btn-link text-primary" (click)="firmarDocumento(doc)"><i class="bi bi-pencil-fill me-1"></i>Firmar</button>
                    </li>
                    <li *ngIf="storedDocuments.length === 0" class="list-group-item text-center py-4 text-muted small">
                      No se han subido documentos todavía.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- TEMPLATE GENERICO PARA CAMPOS CON INTEGRACION DE CONTROLES BIZAGI -->
            <ng-template #fieldTemplate let-attr let-field="fieldConfig">
              <div *ngIf="field; else defaultField">
                
                <!-- RENDERIZACION SEGUN TIPO DE CONTROL BIZAGI -->
                
                <!-- 1. Control LABEL -->
                <div *ngIf="field.controlType === 'LABEL'" class="p-3 border rounded bg-warning-subtle text-warning-emphasis my-2" style="font-size: 0.85rem;">
                  <i class="bi bi-info-circle-fill me-2 fs-5"></i>{{ field.label }}
                </div>

                <!-- 2. Control BUTTON -->
                <div *ngIf="field.controlType === 'BUTTON'" class="d-grid mt-2">
                  <button type="button" 
                          [class]="'btn ' + (field.config?.buttonStyle || 'btn-primary') + ' shadow-sm py-2'" 
                          (click)="ejecutarAccionBoton(field)">
                    <i class="bi bi-play-circle me-1"></i>{{ field.label }}
                  </button>
                </div>

                <!-- Otros controles requieren etiqueta visual -->
                <div *ngIf="field.controlType !== 'LABEL' && field.controlType !== 'BUTTON'">
                  <label class="form-label fw-bold text-dark small mb-1">
                    {{ field.label || attr?.label }}
                    <span class="text-danger" *ngIf="field.required">*</span>
                  </label>

                  <!-- TEXTBOX -->
                  <input *ngIf="field.controlType === 'TEXTBOX'" 
                         type="text" 
                         [formControlName]="field.name" 
                         [readonly]="field.readOnly"
                         [placeholder]="field.defaultValue || ''"
                         class="form-control shadow-none">
                         
                  <!-- TEXTAREA -->
                  <textarea *ngIf="field.controlType === 'TEXTAREA'" 
                            [formControlName]="field.name" 
                            [readonly]="field.readOnly"
                            [placeholder]="field.defaultValue || ''"
                            rows="3"
                            class="form-control shadow-none"></textarea>
                         
                  <!-- NUMBER -->
                  <div *ngIf="field.controlType === 'NUMBER'" class="input-group">
                    <input type="number" 
                           [formControlName]="field.name" 
                           [readonly]="field.readOnly"
                           [placeholder]="field.defaultValue || ''"
                           class="form-control shadow-none">
                    <span class="input-group-text bg-light text-muted"><i class="bi bi-hash"></i></span>
                  </div>

                  <!-- MONEY -->
                  <div *ngIf="field.controlType === 'MONEY'" class="input-group">
                    <span class="input-group-text bg-light text-success fw-bold">$</span>
                    <input type="number" 
                           appTwoDecimals
                           [formControlName]="field.name" 
                           [readonly]="field.readOnly"
                           [placeholder]="field.defaultValue || '0.00'"
                           class="form-control shadow-none">
                  </div>

                  <!-- DATE -->
                  <input *ngIf="field.controlType === 'DATE'" 
                         type="date" 
                         [formControlName]="field.name" 
                         [readonly]="field.readOnly"
                         class="form-control shadow-none">

                  <!-- YESNO (Checkbox Switch) -->
                  <div *ngIf="field.controlType === 'YESNO'" class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" [formControlName]="field.name">
                    <label class="form-check-label text-muted small">Estado activo</label>
                  </div>

                  <!-- COMBO (Select Enlazado a Base de Datos / Paramétrica) -->
                  <select *ngIf="field.controlType === 'COMBO'" 
                          [formControlName]="field.name" 
                          (change)="onComboChange(field)"
                          class="form-select shadow-none">
                    <option value="">-- Seleccione --</option>
                    <option *ngFor="let opt of parametricOptions[field.name]" 
                            [value]="opt[field.config?.valueField || 'codigo'] || opt.codigo || opt.id">
                      {{ opt[field.config?.displayField || 'descripcion'] || opt.descripcion || opt.nombre }}
                    </option>
                  </select>

                  <!-- GRID (Tabla Dinámica con soporte de Entidad BD) -->
                  <div *ngIf="field.controlType === 'GRID'" class="table-responsive border rounded bg-light p-3 mt-1 shadow-xs">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="small fw-bold text-primary"><i class="bi bi-table me-1"></i>Registros de la Tabla</span>
                      <button type="button" class="btn btn-xs btn-success py-1 px-2 shadow-xs d-flex align-items-center gap-1" style="font-size: 0.75rem;" (click)="abrirModalAgregarGrid(field)">
                        <i class="bi bi-plus-lg"></i>Agregar Fila
                      </button>
                    </div>
                    <table class="table table-sm table-bordered bg-white mb-0" style="font-size: 0.8rem;">
                      <thead class="table-light text-muted small text-uppercase">
                        <tr>
                          <th *ngFor="let col of getGridColumnsForField(field)" class="py-2">{{ col.label || col.name }}</th>
                          <th class="text-center py-2" style="width: 70px;">Eliminar</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let row of gridData[field.name]; let rIdx = index" class="align-middle">
                          <td *ngFor="let col of getGridColumnsForField(field)" class="py-2">
                            {{ row[col.name] }}
                          </td>
                          <td class="text-center py-2">
                            <button type="button" class="btn btn-sm btn-link text-danger p-0 border-0" (click)="eliminarFilaGrid(field, rIdx)">
                              <i class="bi bi-trash-fill fs-6"></i>
                            </button>
                          </td>
                        </tr>
                        <tr *ngIf="!gridData[field.name] || gridData[field.name].length === 0">
                          <td [attr.colspan]="(getGridColumnsForField(field).length || 0) + 1" class="text-center text-muted py-3 small">
                            <i class="bi bi-database-exclamation d-block fs-4 text-secondary mb-1"></i>No hay registros ingresados
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- FILEUPLOAD (Carga de archivos integrada con visor de subida) -->
                  <div *ngIf="field.controlType === 'FILEUPLOAD'" class="border rounded p-3 text-center bg-light" style="border-style: dashed !important; border-color: #0d6efd !important;">
                    <i class="bi bi-cloud-arrow-up-fill fs-3 text-primary mb-2 d-block"></i>
                    <span class="d-block text-muted small mb-2">Sube o arrastra el archivo requerido para: <strong>{{ field.label }}</strong></span>
                    <input type="file" [id]="'file_' + field.name" [style.display]="'none'" (change)="onFieldFileSelected($event, field)">
                    <button type="button" class="btn btn-sm btn-primary shadow-xs" (click)="activarUpload(field)">
                      <i class="bi bi-upload me-1"></i>Subir Archivo
                    </button>
                    <div *ngIf="fieldUploadedFiles[field.name]" class="mt-2 text-success small fw-medium">
                      <i class="bi bi-check-circle-fill me-1"></i>Archivo: {{ fieldUploadedFiles[field.name] }}
                    </div>
                  </div>

                  <!-- IMAGE (Visor/Mostrador) -->
                  <div *ngIf="field.controlType === 'IMAGE'" class="border rounded p-3 text-center bg-light">
                    <i class="bi bi-image text-muted fs-2 mb-1 d-block"></i>
                    <span class="text-muted small d-block">{{ field.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Renderizado de respaldo (cuando no hay diseño de pantalla visual) -->
              <ng-template #defaultField>
                <div *ngIf="attr">
                  <label class="form-label fw-semibold small text-muted mb-1">
                    {{ attr.label }}
                  </label>
                  
                  <input *ngIf="attr.type === 'STRING' || attr.type === 'NUMBER'" 
                         [type]="attr.type === 'NUMBER' ? 'number' : 'text'" 
                         [formControlName]="attr.name" 
                         class="form-control shadow-none">
                         
                  <textarea *ngIf="attr.type === 'TEXT'" 
                            [formControlName]="attr.name" 
                            class="form-control shadow-none" 
                            rows="3"></textarea>
                            
                  <input *ngIf="attr.type === 'DATE'" 
                         type="date" 
                         [formControlName]="attr.name" 
                         class="form-control shadow-none">
                         
                  <div *ngIf="attr.type === 'BOOLEAN'" class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" [formControlName]="attr.name">
                    <label class="form-check-label">{{ attr.label }}</label>
                  </div>
                  
                  <select *ngIf="attr.type === 'PARAMETRICA'" 
                          [formControlName]="attr.name" 
                          class="form-select shadow-none">
                    <option value="">-- Seleccione --</option>
                    <option *ngFor="let opt of parametricOptions[attr.name]" [value]="opt.codigo">{{ opt.descripcion }}</option>
                  </select>
                </div>
              </ng-template>
            </ng-template>
          </div>
          
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-outline-secondary px-4" (click)="mostrarModal = false">Cancelar</button>
            <button type="button" class="btn btn-primary px-4 shadow-sm" (click)="completarTarea()" [disabled]="dynamicForm?.invalid">
              <i class="bi bi-check-circle me-1"></i>Confirmar Finalización
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Secundario para Agregar Fila a la Grilla (GRID) -->
    <div class="modal fade show d-block" *ngIf="mostrarModalGrid" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1060; overflow-y: auto;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold"><i class="bi bi-table me-2"></i>Agregar Fila a: {{ currentGridField?.label }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="mostrarModalGrid = false"></button>
          </div>
          <div class="modal-body p-4" *ngIf="gridForm">
            <form [formGroup]="gridForm">
              <div class="row g-3">
                <div *ngFor="let col of gridFormAttributes" class="col-12">
                  <label class="form-label fw-bold text-dark small mb-1">{{ col.label }}</label>
                  
                  <input *ngIf="col.type === 'STRING' || col.type === 'NUMBER'" 
                         [type]="col.type === 'NUMBER' ? 'number' : 'text'" 
                         [formControlName]="col.name" 
                         class="form-control shadow-none">
                         
                  <textarea *ngIf="col.type === 'TEXT'" 
                            [formControlName]="col.name" 
                            class="form-control shadow-none" 
                            rows="3"></textarea>
                            
                  <input *ngIf="col.type === 'DATE'" 
                         type="date" 
                         [formControlName]="col.name" 
                         class="form-control shadow-none">
                         
                  <div *ngIf="col.type === 'BOOLEAN'" class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" [formControlName]="col.name">
                    <label class="form-check-label text-muted small">{{ col.label }}</label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-outline-secondary btn-sm px-3" (click)="mostrarModalGrid = false">Cancelar</button>
            <button type="button" class="btn btn-success btn-sm px-3 shadow-sm" (click)="confirmarAgregarFilaGrid()" [disabled]="gridForm?.invalid">
              <i class="bi bi-check-circle me-1"></i>Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th { font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .badge { font-weight: 500; }
    .nav-tabs .nav-link { border: none; color: #6c757d; font-weight: 500; padding: 1rem 1.5rem; }
    .nav-tabs .nav-link.active { color: #0d6efd; border-bottom: 2px solid #0d6efd; background: transparent; }
    .form-control:focus, .form-select:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1); }
    .btn-xs { padding: 0.15rem 0.4rem; font-size: 0.75rem; border-radius: 0.2rem; }
    .cursor-pointer { cursor: pointer; }
    .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
  `]
})
export class BandejaTareasComponent implements OnInit {
  private taskService = inject(TaskService);
  private processService = inject(ProcessService);
  private metaService = inject(MetaService);
  private parametricService = inject(ParametricService);
  private screenService = inject(ScreenService);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  
  tasks: UserTask[] = [];
  selectedTask: UserTask | null = null;
  mostrarModal = false;
  dynamicForm: FormGroup | null = null;
  metaAttributes: MetaAttribute[] = [];
  parametricOptions: { [key: string]: any[] } = {};
  screenLayout: any = null;
  activeTabIdx = 0;
  
  docDefinitions: DocumentDefinition[] = [];
  storedDocuments: StoredDocument[] = [];

  // Propiedades para renderización avanzada de Grillas, Combos y Archivos Subidos
  gridData: { [key: string]: any[] } = {};
  gridColumns: { [key: string]: MetaAttribute[] } = {};
  fieldUploadedFiles: { [key: string]: string } = {};
  
  mostrarModalGrid = false;
  currentGridField: any = null;
  gridForm: FormGroup | null = null;
  gridFormAttributes: MetaAttribute[] = [];

  columns: any[] = [
    { key: 'task', label: 'Tarea', visible: true, type: 'text' },
    { key: 'caseNumber', label: 'Número Caso', visible: true, type: 'text' },
    { key: 'client', label: 'Cliente / ID', visible: true, type: 'text' },
    { key: 'creditDetails', label: 'Detalles Crédito', visible: true, type: 'currency' },
    { key: 'assignee', label: 'Asignado a', visible: true, type: 'text' },
    { key: 'advisor', label: 'Asesor', visible: true, type: 'text' },
    { key: 'createTime', label: 'Fecha Creación', visible: true, type: 'date' }
  ];

  guardarPreferenciasColumnas() {
    localStorage.setItem('preferencias_columnas_tareas_admin', JSON.stringify(this.columns.map(c => ({ key: c.key, visible: c.visible }))));
  }

  cargarPreferenciasColumnas() {
    this.taskService.getDynamicColumns().subscribe({
      next: (dbCols) => {
        if (dbCols && dbCols.length > 0) {
          const cached = localStorage.getItem('preferencias_columnas_tareas_admin');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              this.columns = dbCols.map(c => {
                const match = parsed.find((p: any) => p.key === c.keyName);
                return {
                  key: c.keyName,
                  label: c.labelName,
                  visible: match ? match.visible : c.visible,
                  type: c.columnType
                };
              });
            } catch (e) {
              this.columns = dbCols.map(c => ({ key: c.keyName, label: c.labelName, visible: c.visible, type: c.columnType }));
            }
          } else {
            this.columns = dbCols.map(c => ({ key: c.keyName, label: c.labelName, visible: c.visible, type: c.columnType }));
          }
        }
      },
      error: (err) => console.error('Error fetching dynamic columns from DB:', err)
    });
  }

  isColumnVisible(key: string): boolean {
    return this.columns.find(c => c.key === key)?.visible ?? false;
  }

  getAdditionalVar(task: UserTask, key: string): any {
    return task.additionalVariables ? task.additionalVariables[key] : null;
  }

  mostrarModalCols = false;
  columnsFromDb: any[] = [];
  colForm!: FormGroup;

  abrirGestionColumnas() {
    this.mostrarModalCols = true;
    this.taskService.getDynamicColumns().subscribe({
      next: (data) => this.columnsFromDb = data
    });
  }

  cerrarGestionColumnas() {
    this.mostrarModalCols = false;
  }

  esColumnaFija(key: string): boolean {
    return ['task', 'caseNumber', 'client', 'creditDetails', 'assignee', 'advisor', 'createTime'].includes(key);
  }

  agregarColumnaDb() {
    if (this.colForm.invalid) return;
    this.taskService.addColumn(this.colForm.value).subscribe({
      next: () => {
        alert('Columna agregada exitosamente en la Base de Datos.');
        this.colForm.reset({ columnType: 'text' });
        this.cargarPreferenciasColumnas();
        this.abrirGestionColumnas();
      },
      error: (err) => {
        console.error('Error al agregar columna:', err);
        alert('Error al intentar agregar la columna. Verifique que el identificador no esté duplicado.');
      }
    });
  }

  eliminarColumnaDb(id: number) {
    if (confirm('¿Estás seguro que deseas eliminar esta columna de la base de datos?')) {
      this.taskService.deleteColumn(id).subscribe({
        next: () => {
          alert('Columna eliminada correctamente.');
          this.cargarPreferenciasColumnas();
          this.abrirGestionColumnas();
        },
        error: (err) => {
          console.error('Error al eliminar columna:', err);
          alert('Error al intentar eliminar la columna.');
        }
      });
    }
  }

  ngOnInit() {
    this.colForm = this.fb.group({
      keyName: ['', Validators.required],
      labelName: ['', Validators.required],
      variableName: ['', Validators.required],
      columnType: ['text', Validators.required]
    });
    this.cargarPreferenciasColumnas();
    this.cargarTareas();
  }

  isFieldVisible(field: any): boolean {
    if (!field.visibleIf || !this.dynamicForm) return true;
    try {
      const data = this.dynamicForm.getRawValue();
      const check = new Function('data', `with(data) { return ${field.visibleIf} }`);
      return check(data);
    } catch (e) { return true; }
  }

  cargarTareas() {
    const user = this.authService.getCurrentUser();
    this.taskService.getTasks(user?.username).subscribe({
      next: (data) => this.tasks = data
    });
  }

  abrirFormulario(task: UserTask) {
    this.selectedTask = task;
    this.metaAttributes = [];
    this.parametricOptions = {};
    this.screenLayout = null;
    this.activeTabIdx = 0;
    this.gridData = {};
    this.gridColumns = {};
    this.fieldUploadedFiles = {};
    
    this.processService.getProcessByProcDefId(task.processDefinitionId).subscribe({
      next: (procDef) => {
        // Cargar Atributos
        if (procDef.metaEntityId) {
          this.metaService.listarAtributos(procDef.metaEntityId).subscribe(attrs => {
            this.metaAttributes = attrs;
            this.loadParametricOptions();
            
            // Cargar Pantalla usando processKey y taskKey (task.name representa el taskKey)
            this.screenService.getForTask(procDef.key, task.name).subscribe(screen => {
              if (screen && screen.layoutJson) {
                this.screenLayout = JSON.parse(screen.layoutJson);
              }
              this.buildForm();
              this.loadLayoutData();
              this.mostrarModal = true;
            });

            // Cargar Definiciones de Documentos y Documentos Almacenados
            this.documentService.getDefinitions(procDef.key).subscribe(defs => this.docDefinitions = defs);
            this.documentService.getDocumentsByInstance(task.processInstanceId).subscribe(docs => this.storedDocuments = docs);
          });
        } else {
          this.buildForm();
          this.mostrarModal = true;
        }
      }
    });
  }

  onFileSelected(event: any, definitionId: number) {
    const file: File = event.target.files[0];
    if (file && this.selectedTask) {
      const user = this.authService.getCurrentUser()?.username || 'sistema';
      this.documentService.upload(file, this.selectedTask.processInstanceId, definitionId, user).subscribe({
        next: () => {
          this.documentService.getDocumentsByInstance(this.selectedTask!.processInstanceId).subscribe(docs => this.storedDocuments = docs);
        }
      });
    }
  }

  generarDocumento(def: DocumentDefinition) {
    if (this.selectedTask) {
      const user = this.authService.getCurrentUser()?.username || 'sistema';
      const variables = this.dynamicForm?.getRawValue() || {};
      this.documentService.generate(def.id!, this.selectedTask.processInstanceId, variables, user).subscribe(() => {
        alert('Documento generado con éxito');
        this.documentService.getDocumentsByInstance(this.selectedTask!.processInstanceId).subscribe(docs => this.storedDocuments = docs);
      });
    }
  }

  firmarDocumento(doc: any) {
    const pin = prompt('Ingresa tu PIN de firma electrónica (ej: 1234):');
    const user = this.authService.getCurrentUser();
    if (pin && user) {
      this.documentService.signDocument(doc.id, user.username, pin).subscribe({
        next: () => {
          alert('Documento firmado electrónicamente con éxito. Se ha generado un hash de integridad.');
          if (this.selectedTask) {
            this.documentService.getDocumentsByInstance(this.selectedTask.processInstanceId).subscribe(docs => this.storedDocuments = docs);
          }
        },
        error: (err) => alert('Error al firmar: ' + (err.error?.message || 'Error'))
      });
    }
  }

  loadParametricOptions() {
    this.metaAttributes.forEach(attr => {
      if (attr.type === 'PARAMETRICA' && attr.parametricTableId) {
        this.parametricService.getTableData(attr.parametricTableId).subscribe(data => this.parametricOptions[attr.name] = data);
      }
    });
  }

  buildForm() {
    const group: any = {};
    
    // 1. Agregar atributos nativos del proceso
    this.metaAttributes.forEach(attr => {
      const layoutField = this.findFieldInLayout(attr.name);
      const isRequired = attr.required || (layoutField && layoutField.required);
      const defaultValue = (layoutField && layoutField.defaultValue) || '';
      
      group[attr.name] = [
        { value: defaultValue, disabled: layoutField ? layoutField.readOnly : false },
        isRequired ? Validators.required : null
      ];
    });

    // 2. Agregar campos personalizados del layout visual
    if (this.screenLayout && this.screenLayout.tabs) {
      this.screenLayout.tabs.forEach((tab: any) => {
        tab.sections.forEach((sec: any) => {
          sec.fields.forEach((f: any) => {
            if (f.name && !group[f.name] && f.controlType !== 'BUTTON' && f.controlType !== 'LABEL' && f.controlType !== 'GRID') {
              const isRequired = f.required;
              group[f.name] = [
                { value: f.defaultValue || '', disabled: f.readOnly || false },
                isRequired ? Validators.required : null
              ];
            }
          });
        });
      });
    }

    this.dynamicForm = this.fb.group(group);
  }

  findFieldInLayout(name: string): any {
    if (!this.screenLayout || !this.screenLayout.tabs) return null;
    let found = null;
    this.screenLayout.tabs.forEach((tab: any) => {
      tab.sections.forEach((sec: any) => {
        sec.fields.forEach((f: any) => {
          if (f.name === name) found = f;
        });
      });
    });
    return found;
  }

  onComboChange(field: any) {
    if (!this.dynamicForm) return;
    const selectedValue = this.dynamicForm.get(field.name)?.value;
    if (!selectedValue) return;

    const rules = field.config?.cascadeRules || [];
    if (rules.length === 0) return;

    const options = this.parametricOptions[field.name] || [];
    const valField = field.config?.valueField || 'codigo';
    const selectedRecord = options.find(opt => {
      const optVal = opt[valField] || opt.codigo || opt.id;
      return String(optVal) === String(selectedValue);
    });

    if (!selectedRecord) return;

    rules.forEach((rule: any) => {
      if (rule.sourceColumn && rule.targetField) {
        const sourceVal = selectedRecord[rule.sourceColumn];
        if (sourceVal !== undefined) {
          if (this.dynamicForm!.contains(rule.targetField)) {
            this.dynamicForm!.patchValue({ [rule.targetField]: String(sourceVal) });
          }
        }
      }
    });
  }

  getAttribute(name: string) {
    return this.metaAttributes.find(a => a.name === name);
  }

  completarTarea() {
    if (!this.selectedTask) return;
    this.taskService.completeTask(this.selectedTask.id, this.dynamicForm?.getRawValue() || {}).subscribe({
      next: () => {
        alert('¡Tarea completada!');
        this.mostrarModal = false;
        this.cargarTareas();
      }
    });
  }

  // --- MÉTODOS PARA CARGAR DATOS DINÁMICOS DEL DISEÑO DE PANTALLAS ---
  
  loadLayoutData() {
    if (!this.screenLayout || !this.screenLayout.tabs) return;

    this.screenLayout.tabs.forEach((tab: any) => {
      tab.sections.forEach((sec: any) => {
        sec.fields.forEach((f: any) => {
          if (f.config?.dataSourceEntityId) {
            const entityId = Number(f.config.dataSourceEntityId);
            if (f.controlType === 'COMBO') {
              // Intenta cargar como entidad, sino recurre a tabla paramétrica
              this.metaService.getEntityData(entityId).subscribe({
                next: (data) => {
                  this.parametricOptions[f.name] = data;
                },
                error: () => {
                  this.parametricService.getTableData(entityId).subscribe(data => {
                    this.parametricOptions[f.name] = data;
                  });
                }
              });
            } else if (f.controlType === 'GRID') {
              // Carga los registros del Grid
              this.metaService.getEntityData(entityId).subscribe({
                next: (data) => {
                  this.gridData[f.name] = data;
                },
                error: () => {
                  this.gridData[f.name] = [];
                }
              });

              // Si el campo tiene selectedColumns configuradas (del diseñador), úsalas
              const selectedCols: any[] = f.config?.selectedColumns;
              if (selectedCols && selectedCols.length > 0) {
                // Convertir selectedColumns visibles a formato MetaAttribute-like
                this.gridColumns[f.name] = selectedCols
                  .filter((c: any) => c.visible !== false)
                  .map((c: any) => ({ name: c.name, type: c.type, label: c.label || c.name } as any));
              } else {
                // Fallback: cargar todos los atributos de la entidad
                this.metaService.listarAtributos(entityId).subscribe({
                  next: (attrs) => {
                    this.gridColumns[f.name] = attrs;
                  }
                });
              }
            }
          }
        });
      });
    });
  }

  // --- GESTIÓN DE ACCIONES DE BOTONES BIZAGI ---
  
  ejecutarAccionBoton(field: any) {
    const action = field.config?.buttonAction;
    if (action === 'SAVE') {
      if (this.selectedTask && this.dynamicForm) {
        this.taskService.completeTask(this.selectedTask.id, this.dynamicForm.getRawValue()).subscribe({
          next: () => {
            alert('Datos del formulario guardados con éxito.');
            this.mostrarModal = false;
            this.cargarTareas();
          }
        });
      }
    } else if (action === 'NEXT_TASK') {
      this.completarTarea();
    } else if (action === 'CANCEL') {
      this.mostrarModal = false;
    } else if (action === 'CUSTOM') {
      alert(`Acción ejecutada: ${field.label}`);
    }
  }

  // --- CARGA DE ARCHIVOS PERSONALIZADA EN FILEUPLOAD ---
  
  activarUpload(field: any) {
    const el = document.getElementById('file_' + field.name);
    if (el) el.click();
  }

  onFieldFileSelected(event: any, field: any) {
    const file: File = event.target.files[0];
    if (file && this.selectedTask) {
      const user = this.authService.getCurrentUser()?.username || 'sistema';
      // Asigna al primer ID de definición de documento del proceso
      const defId = this.docDefinitions.length > 0 ? this.docDefinitions[0].id : null;
      if (defId) {
        this.documentService.upload(file, this.selectedTask.processInstanceId, defId, user).subscribe({
          next: () => {
            this.fieldUploadedFiles[field.name] = file.name;
            // Refresca también la pestaña de documentos general
            this.documentService.getDocumentsByInstance(this.selectedTask!.processInstanceId).subscribe(docs => this.storedDocuments = docs);
            alert(`Archivo '${file.name}' subido con éxito.`);
          }
        });
      } else {
        alert('Configura definiciones de documentos para habilitar la subida.');
      }
    }
  }

  // --- AGREGAR Y ELIMINAR FILAS EN LA GRILLA DE DATOS (GRID) ---
  
  abrirModalAgregarGrid(field: any) {
    this.currentGridField = field;
    // Use selectedColumns from config if available (respects designer config)
    const cols = this.getGridColumnsForField(field);
    this.gridFormAttributes = cols as any[];
    
    const group: any = {};
    cols.forEach((col: any) => {
      group[col.name] = ['', null];
    });
    
    this.gridForm = this.fb.group(group);
    this.mostrarModalGrid = true;
  }

  // Returns the visible columns for a GRID field, respecting selectedColumns config
  getGridColumnsForField(field: any): {name: string; type: string; label: string}[] {
    // If field has selectedColumns configuration (from screen designer), use it
    const selected: any[] = field?.config?.selectedColumns;
    if (selected && selected.length > 0) {
      return selected
        .filter((c: any) => c.visible !== false)
        .map((c: any): {name: string; type: string; label: string} => ({ name: c.name, type: c.type || 'string', label: c.label || c.name }));
    }
    // Fallback: use the gridColumns loaded from meta attributes
    const fallback: {name: string; type: string; label: string}[] = [];
    (this.gridColumns[field.name] || []).forEach((c: any) => {
      fallback.push({ name: c.name, type: c.type || 'string', label: c.label || c.name });
    });
    return fallback;
  }

  confirmarAgregarFilaGrid() {
    if (!this.gridForm || this.gridForm.invalid || !this.currentGridField) return;
    
    const fieldName = this.currentGridField.name;
    if (!this.gridData[fieldName]) {
      this.gridData[fieldName] = [];
    }
    
    this.gridData[fieldName].push(this.gridForm.value);
    
    // Serializar el estado del grid en el main Form
    if (this.dynamicForm) {
      if (!this.dynamicForm.contains(fieldName)) {
        this.dynamicForm.addControl(fieldName, this.fb.control(JSON.stringify(this.gridData[fieldName])));
      } else {
        this.dynamicForm.patchValue({ [fieldName]: JSON.stringify(this.gridData[fieldName]) });
      }
    }
    
    this.mostrarModalGrid = false;
    this.currentGridField = null;
    this.gridForm = null;
  }

  eliminarFilaGrid(field: any, rIdx: number) {
    const fieldName = field.name;
    if (this.gridData[fieldName]) {
      this.gridData[fieldName].splice(rIdx, 1);
      
      if (this.dynamicForm && this.dynamicForm.contains(fieldName)) {
        this.dynamicForm.patchValue({ [fieldName]: JSON.stringify(this.gridData[fieldName]) });
      }
    }
  }
}
