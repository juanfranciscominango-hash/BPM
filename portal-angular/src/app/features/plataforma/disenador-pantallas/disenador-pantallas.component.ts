import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, DoCheck, KeyValueDiffers } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScreenService, ScreenDefinition } from '../../../core/services/screen.service';
import { ProcessService, ProcessDefinition } from '../../../core/services/process.service';
import { MetaService, MetaAttribute, MetaEntity } from '../../../core/services/meta.service';
import { ParametricService } from '../../../core/services/parametric.service';
import { ApiManagerService, ApiDefinition } from '../../../core/services/api-manager.service';
import { DocumentService, DocumentDefinition } from '../../../core/services/document.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-disenador-pantallas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./disenador-pantallas.component.css'],
  template: `
    <div class="container-fluid p-4 premium-container min-vh-100">
      
      <!-- TOP BANNER WITH PREMIUM GRADIENT -->
      <div class="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-lg text-white header-gradient">
        <div>
          <h2 class="h3 mb-1 fw-bold d-flex align-items-center gap-2">
            <i class="bi bi-window-sidebar animate-pulse"></i>Diseñador de Pantallas Studio
          </h2>
          <p class="mb-0 text-white-50 small">
            Modelador visual de interfaces dinámicas y enlace de datos en tiempo real estilo Bizagi Studio.
          </p>
        </div>
        <div class="d-flex gap-3">
          <button class="btn btn-glass shadow-sm py-2 px-3 fw-semibold" (click)="activarPreview()">
            <i class="bi bi-play-circle-fill me-1"></i>Previsualizar
          </button>
          <button class="btn btn-outline-light shadow-xs py-2 px-3 fw-semibold" (click)="nuevoLayout()">
            <i class="bi bi-plus-lg me-1"></i>Nuevo Layout
          </button>
          <button class="btn btn-primary-premium shadow-lg py-2 px-4 fw-bold" (click)="guardar()">
            <i class="bi bi-save-fill me-1"></i>Guardar Diseño
          </button>
        </div>
      </div>

      <div class="row g-4">
        
        <!-- PANEL IZQUIERDO: BIZAGI TABS (DATOS / CONTROLES) -->
        <div class="col-xxl-2 col-xl-3">
          
          <!-- Bizagi Sidebar Navigation Tabs -->
          <ul class="nav nav-pills nav-fill mb-3 bg-white p-2 rounded-3 shadow-xs border" style="font-size: 0.85rem;">
            <li class="nav-item">
              <a class="nav-link py-2 fw-bold sidebar-tab cursor-pointer" 
                [class.active]="activeSidebarTab === 'data'" 
                (click)="activeSidebarTab = 'data'" href="javascript:void(0)">
                <i class="bi bi-database me-1"></i>Datos
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2 fw-bold sidebar-tab cursor-pointer" 
                [class.active]="activeSidebarTab === 'controls'" 
                (click)="activeSidebarTab = 'controls'" href="javascript:void(0)">
                <i class="bi bi-tools me-1"></i>Controles
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2 fw-bold sidebar-tab cursor-pointer" 
                [class.active]="activeSidebarTab === 'validations'" 
                (click)="activeSidebarTab = 'validations'" href="javascript:void(0)">
                <i class="bi bi-shield-exclamation me-1"></i>Validaciones
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link py-2 fw-bold sidebar-tab cursor-pointer" 
                [class.active]="activeSidebarTab === 'actions'" 
                (click)="activeSidebarTab = 'actions'" href="javascript:void(0)">
                <i class="bi bi-lightning-charge-fill me-1"></i>Acciones
              </a>
            </li>
          </ul>

          <!-- TAB 1: DATOS (Tablas y Atributos) -->
          <div *ngIf="activeSidebarTab === 'data'" class="fade-in">
            <!-- 1. Configuración Básica -->
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-sliders text-indigo"></i>Configuración de Contexto
              </div>
              <div class="card-body py-3 border-top">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-muted mb-1">Proceso de Negocio</label>
                  <div *ngIf="processesLoading" class="d-flex align-items-center gap-2 text-muted small py-1">
                    <span class="spinner-border spinner-border-sm" role="status"></span> Cargando procesos...
                  </div>
                  <div *ngIf="processesError && !processesLoading" class="d-flex align-items-center gap-2 text-danger small py-1">
                    <i class="bi bi-exclamation-triangle-fill"></i> Error al cargar procesos.
                    <a href="javascript:void(0)" (click)="recargarProcesos()" class="text-decoration-none fw-bold">Reintentar</a>
                  </div>
                  <select *ngIf="!processesLoading" class="form-select form-select-sm shadow-none custom-select" [(ngModel)]="selectedProcessKey" (change)="onProcessChange()">
                    <option value="" disabled>-- Seleccionar Proceso --</option>
                    <option *ngFor="let p of processes" [value]="p.key">{{ p.name }}</option>
                  </select>
                </div>
                
                <!-- DROPDOWN DE ACTIVIDAD (USER TASK) DE BIZAGI -->
                <div class="mb-3" *ngIf="selectedProcessKey">
                  <label class="form-label small fw-bold text-muted mb-1">Actividad BPMN (User Task)</label>
                  <select class="form-select form-select-sm shadow-none custom-select" [(ngModel)]="selectedTaskKey">
                    <option value="">-- Sin Vincular (Pantalla Global) --</option>
                    <option *ngFor="let t of userTasks" [value]="t.id">{{ t.name }} ({{ t.id }})</option>
                  </select>
                </div>

                <div class="mb-2" *ngIf="selectedProcessKey">
                  <label class="form-label small fw-bold text-muted mb-1">Nombre Técnico del Layout</label>
                  <input type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="currentScreen.name">
                </div>
              </div>
            </div>

            <!-- 2. Pantallas Guardadas -->
            <div class="card border-0 shadow-xs mb-3 card-premium" *ngIf="selectedProcessKey">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex justify-content-between align-items-center">
                <span class="d-flex align-items-center gap-2"><i class="bi bi-collection-play text-purple"></i>Pantallas Modeladas</span>
                <span class="badge badge-indigo small">{{ savedScreens.length }}</span>
              </div>
              <div class="card-body p-0 border-top">
                <ul class="list-group list-group-flush list-custom" style="max-height: 150px; overflow-y: auto;">
                  <li *ngIf="savedScreens.length === 0" class="list-group-item text-muted small text-center py-3">
                    No hay pantallas guardadas
                  </li>
                  <li *ngFor="let screen of savedScreens" 
                    class="list-group-item d-flex justify-content-between align-items-center py-2 cursor-pointer item-screen"
                    [class.active-screen]="currentScreen.id === screen.id">
                    <span class="text-truncate small fw-semibold flex-grow-1" style="max-width: 170px;" (click)="cargarPantalla(screen)">
                      {{ screen.name }} <small class="text-muted d-block" style="font-size: 0.65rem;" *ngIf="screen.taskKey">→ Tarea: {{ screen.taskKey }}</small>
                    </span>
                    <button class="btn btn-sm btn-link text-danger p-0 border-0 btn-delete-item" (click)="eliminarPantalla(screen.id!)" title="Eliminar">
                      <i class="bi bi-trash3-fill"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 3. Explorador de Tablas (BD Directa con Árbol de Campos) -->
            <div class="card border-0 shadow-xs mb-3 card-premium" *ngIf="selectedProcessKey">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex justify-content-between align-items-center">
                <span class="d-flex align-items-center gap-2"><i class="bi bi-database-fill-gear text-emerald"></i>Diccionario del Sistema</span>
                <span class="badge badge-emerald small">{{ entities.length + parametricTables.length }}</span>
              </div>
              <div class="card-body p-0 border-top">
                <ul class="list-group list-group-flush list-custom" style="max-height: 320px; overflow-y: auto;">

                  <!-- SECCION: Entidades del Modelo -->
                  <li class="list-group-item py-1 bg-light border-bottom-0">
                    <span class="small fw-bold text-indigo" style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.05em;">
                      <i class="bi bi-diagram-2 me-1"></i>Entidades del Modelo
                    </span>
                  </li>
                  <li *ngFor="let ent of entities" class="list-group-item py-2 bg-transparent border-bottom-0">
                    <!-- Fila Tabla -->
                    <div class="d-flex justify-content-between align-items-center py-1">
                      <span class="small fw-bold text-truncate text-dark cursor-pointer flex-grow-1 entity-header" 
                        style="max-width: 150px;" 
                        [title]="ent.label"
                        (click)="toggleEntity(ent)">
                        <i class="bi me-1" 
                          [class.bi-chevron-down]="expandedEntities[ent.id!]" 
                          [class.bi-chevron-right]="!expandedEntities[ent.id!]"></i>
                        <i class="bi bi-table me-1 text-emerald"></i>{{ ent.label }}
                      </span>
                      <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-link text-primary p-0 border-0" (click)="addGridForEntity(ent)" title="Añadir Grilla de Tabla">
                          <i class="bi bi-grid-3x3 text-indigo" style="font-size: 0.95rem;"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Campos Hijos (Árbol Expandible) -->
                    <ul class="list-group list-group-flush ms-3 border-start ps-2" *ngIf="expandedEntities[ent.id!]">
                      <li *ngIf="!entityAttributesMap[ent.id!]" class="list-group-item text-muted small py-1 bg-transparent border-0">
                        <span class="spinner-border spinner-border-sm text-secondary me-1" role="status"></span>Cargando...
                      </li>
                      <li *ngIf="entityAttributesMap[ent.id!] && entityAttributesMap[ent.id!].length === 0" class="list-group-item text-muted small py-1 bg-transparent border-0">
                        Sin campos
                      </li>
                      <li *ngFor="let attr of entityAttributesMap[ent.id!]" class="list-group-item d-flex justify-content-between align-items-center py-1 bg-transparent border-0 small text-muted">
                        <span class="text-truncate text-secondary" style="max-width: 140px;" [title]="attr.label + ' (' + attr.type + ')'">
                          <i class="bi bi-dot"></i>{{ attr.label }}
                        </span>
                        <button class="btn btn-sm btn-link text-success p-0 border-0 fw-bold hover-scale" (click)="addFieldForEntityAttribute(ent, attr)" title="Insertar Control Enlazado">
                          <i class="bi bi-plus-circle-fill" style="font-size: 0.85rem;"></i>
                        </button>
                      </li>
                    </ul>
                  </li>

                  <!-- SECCION: Tablas Paramétricas -->
                  <li class="list-group-item py-1 bg-light border-bottom-0 border-top">
                    <span class="small fw-bold text-indigo" style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.05em;">
                      <i class="bi bi-table me-1"></i>Tablas Paramétricas
                    </span>
                  </li>
                  <li *ngFor="let pt of parametricTables" class="list-group-item py-2 bg-transparent border-bottom-0">
                    <div class="d-flex justify-content-between align-items-center py-1">
                      <span class="small fw-bold text-truncate text-dark cursor-pointer flex-grow-1 entity-header"
                        style="max-width: 150px;"
                        [title]="pt.label"
                        (click)="expandedParamTables[pt.id] = !expandedParamTables[pt.id]">
                        <i class="bi me-1"
                          [class.bi-chevron-down]="expandedParamTables[pt.id]"
                          [class.bi-chevron-right]="!expandedParamTables[pt.id]"></i>
                        <i class="bi bi-list-ul me-1 text-purple"></i>{{ pt.label }}
                      </span>
                      <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-link text-primary p-0 border-0" (click)="addComboForParamTable(pt)" title="Añadir Selector">
                          <i class="bi bi-menu-button-wide text-purple" style="font-size: 0.95rem;"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Columnas de la tabla paramétrica -->
                    <ul class="list-group list-group-flush ms-3 border-start ps-2" *ngIf="expandedParamTables[pt.id]">
                      <li *ngFor="let col of pt.columns" class="list-group-item d-flex justify-content-between align-items-center py-1 bg-transparent border-0 small text-muted">
                        <span class="text-truncate text-secondary" style="max-width: 140px;" [title]="col.label + ' (' + col.type + ')'">
                          <i class="bi bi-dot"></i>{{ col.label }}
                        </span>
                        <button class="btn btn-sm btn-link text-success p-0 border-0 fw-bold hover-scale" (click)="addComboForParamTableField(pt, col)" title="Insertar Selector">
                          <i class="bi bi-plus-circle-fill" style="font-size: 0.85rem;"></i>
                        </button>
                      </li>
                      <li *ngIf="!pt.columns || pt.columns.length === 0" class="list-group-item text-muted small py-1 bg-transparent border-0">
                        Sin columnas
                      </li>
                    </ul>
                  </li>

                  <li *ngIf="entities.length === 0 && parametricTables.length === 0" class="list-group-item text-muted small text-center py-3">
                    No hay tablas registradas
                  </li>
                </ul>
              </div>
            </div>

            <!-- 4. Campos Propios del Proceso -->
            <div class="card border-0 shadow-xs card-premium" *ngIf="selectedProcessKey">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-tags text-rose"></i>Atributos Proceso
              </div>
              <div class="card-body p-0 border-top">
                <ul class="list-group list-group-flush list-custom" style="max-height: 180px; overflow-y: auto;">
                  <li *ngIf="availableAttributes.length === 0" class="list-group-item text-muted small text-center py-3">
                    No hay atributos del proceso
                  </li>
                  <li *ngFor="let attr of availableAttributes" class="list-group-item d-flex justify-content-between align-items-center py-2 hover-bg">
                    <span class="small text-truncate fw-medium text-secondary" style="max-width: 180px;">{{ attr.label }}</span>
                    <button class="btn btn-sm btn-link text-indigo p-0 border-0 hover-scale" (click)="addFieldToLayout(attr)">
                      <i class="bi bi-plus-circle-fill" style="font-size: 0.95rem;"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- TAB 2: CONTROLES (Caja de Herramientas Robustas al estilo Bizagi) -->
          <div *ngIf="activeSidebarTab === 'controls' && selectedProcessKey" class="fade-in">
            <!-- Contenedores -->
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-box text-orange"></i>Contenedores
              </div>
              <div class="card-body p-3 border-top">
                <div class="row g-2">
                  <div class="col-12">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addSection()">
                      <i class="bi bi-ui-checks-grid fs-5 mb-1 text-orange"></i>
                      <span class="lbl-ctrl fw-bold">Sección / Grupo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ingreso de Datos -->
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-input-cursor-text text-indigo"></i>Ingreso de Datos
              </div>
              <div class="card-body p-3 border-top">
                <div class="row g-2">
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('TEXTBOX')">
                      <i class="bi bi-text-left fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl">Caja Texto</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('TEXTAREA')">
                      <i class="bi bi-textarea-t fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl">Texto Extenso</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('NUMBER')">
                      <i class="bi bi-hash fs-5 mb-1 text-info"></i>
                      <span class="lbl-ctrl">Número</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('MONEY')">
                      <i class="bi bi-currency-dollar fs-5 mb-1 text-success"></i>
                      <span class="lbl-ctrl">Moneda</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('DATE')">
                      <i class="bi bi-calendar-event fs-5 mb-1 text-danger"></i>
                      <span class="lbl-ctrl">Fecha</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('YESNO')">
                      <i class="bi bi-toggle-on fs-5 mb-1 text-warning"></i>
                      <span class="lbl-ctrl">Sí / No</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('FILEUPLOAD')">
                      <i class="bi bi-cloud-arrow-up fs-5 mb-1 text-danger"></i>
                      <span class="lbl-ctrl">Subir Archivo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Listas & Vistas -->
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-collection text-emerald"></i>Listas & Vistas
              </div>
              <div class="card-body p-3 border-top">
                <div class="row g-2">
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('COMBO')">
                      <i class="bi bi-menu-button-wide fs-5 mb-1 text-indigo"></i>
                      <span class="lbl-ctrl">Selector</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('GRID')">
                      <i class="bi bi-grid-3x3 fs-5 mb-1 text-emerald"></i>
                      <span class="lbl-ctrl">Tabla / Grilla</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('IMAGE')">
                      <i class="bi bi-image fs-5 mb-1 text-info"></i>
                      <span class="lbl-ctrl">Imagen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Otros -->
            <div class="card border-0 shadow-xs card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex align-items-center gap-2">
                <i class="bi bi-activity text-rose"></i>Otros
              </div>
              <div class="card-body p-3 border-top">
                <div class="row g-2">
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('BUTTON')">
                      <i class="bi bi-hand-index-thumb fs-5 mb-1 text-danger"></i>
                      <span class="lbl-ctrl">Botón Acción</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('LINK')">
                      <i class="bi bi-link-45deg fs-5 mb-1 text-info"></i>
                      <span class="lbl-ctrl">Enlace</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('LABEL')">
                      <i class="bi bi-card-text fs-5 mb-1 text-warning"></i>
                      <span class="lbl-ctrl">Separador</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('SIMULADOR')">
                      <i class="bi bi-calculator-fill fs-5 mb-1 text-primary"></i>
                      <span class="lbl-ctrl">Simulador</span>
                    </button>
                  </div>
                  <div class="col-6 mt-2">
                    <button class="btn btn-outline-secondary btn-control w-100 py-2 d-flex flex-column align-items-center" (click)="addGenericControl('RESUMEN_CASO')">
                      <i class="bi bi-file-earmark-person fs-5 mb-1 text-secondary"></i>
                      <span class="lbl-ctrl">Info General</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="activeSidebarTab === 'controls' && !selectedProcessKey" class="text-center py-5 text-muted card-premium border p-4">
            <i class="bi bi-exclamation-triangle fs-2 d-block mb-2 text-warning animate-bounce"></i>
            <span class="small fw-semibold">Selecciona un proceso primero para ver y arrastrar los controles al lienzo.</span>
          </div>

          <!-- TAB 3: VALIDACIONES -->
          <div *ngIf="activeSidebarTab === 'validations' && selectedProcessKey" class="fade-in">
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex justify-content-between align-items-center">
                <span class="d-flex align-items-center gap-2"><i class="bi bi-shield-exclamation text-danger"></i>Reglas de ValidaciÃ³n</span>
                <button class="btn btn-sm btn-outline-danger shadow-xs py-1 px-2" (click)="addValidation()">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>
              <div class="card-body p-0 border-top">
                <div *ngIf="!layout.validations || layout.validations.length === 0" class="text-muted small text-center py-4">
                  <i class="bi bi-shield-check fs-2 text-success opacity-50 mb-2 d-block"></i>
                  No hay validaciones configuradas.
                </div>
                <div class="list-group list-group-flush" *ngIf="layout.validations && layout.validations.length > 0">
                  <div *ngFor="let val of layout.validations; let i = index" class="list-group-item bg-light border-bottom border-light">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <input type="text" class="form-control form-control-sm fw-bold border-0 bg-transparent text-dark shadow-none px-0" [(ngModel)]="val.name" placeholder="Nombre de validaciÃ³n">
                      <button class="btn btn-sm btn-link text-danger p-0" (click)="removeValidation(i)" title="Eliminar regla"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    
                    <label class="form-label small fw-bold text-muted mb-0" style="font-size: 0.65rem;">CondiciÃ³n (JavaScript):</label>
                    <div class="input-group input-group-sm mb-2 shadow-sm">
                      <input type="text" class="form-control font-monospace text-primary shadow-none border-primary-subtle" [(ngModel)]="val.condition" placeholder="ej: edad < 18">
                      <select class="form-select border-primary-subtle bg-light text-secondary" style="max-width: 180px; font-size: 0.75rem;" (change)="val.condition = (val.condition || '') + ' ' + $any($event.target).value + ' '; $any($event.target).value=''">
                        <option value="">+ Insertar campo...</option>
                        <option *ngFor="let f of _cachedFieldsList" [value]="f.name">{{f.label || f.name}}</option>
                      </select>
                    </div>
                    
                    <label class="form-label small fw-bold text-muted mb-0" style="font-size: 0.65rem;">Mensaje de Error:</label>
                    <textarea class="form-control form-control-sm shadow-none" rows="2" [(ngModel)]="val.message" placeholder="Mensaje mostrado al usuario..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="activeSidebarTab === 'validations' && !selectedProcessKey" class="text-center py-5 text-muted card-premium border p-4">
            <i class="bi bi-exclamation-triangle fs-2 d-block mb-2 text-warning animate-bounce"></i>
            <span class="small fw-semibold">Selecciona un proceso para configurar validaciones.</span>
          </div>

          <!-- TAB 4: ACCIONES -->
          <div *ngIf="activeSidebarTab === 'actions' && selectedProcessKey" class="fade-in">
            <div class="card border-0 shadow-xs mb-3 card-premium">
              <div class="card-header bg-white border-0 fw-bold text-dark py-2 d-flex justify-content-between align-items-center">
                <span class="d-flex align-items-center gap-2"><i class="bi bi-lightning-charge-fill text-warning"></i>Reglas de Acciones</span>
                <button class="btn btn-sm btn-outline-warning shadow-xs py-1 px-2 text-dark" (click)="addAction()">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>
              <div class="card-body p-0 border-top">
                <div *ngIf="!layout.actions || layout.actions.length === 0" class="text-muted small text-center py-4">
                  <i class="bi bi-lightning fs-2 text-secondary opacity-50 mb-2 d-block"></i>
                  No hay acciones configuradas.
                </div>
                <div class="list-group list-group-flush" *ngIf="layout.actions && layout.actions.length > 0">
                  <div *ngFor="let act of layout.actions; let i = index" class="list-group-item bg-light border-bottom border-light">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <input type="text" class="form-control form-control-sm fw-bold border-0 bg-transparent text-dark shadow-none px-0" [(ngModel)]="act.name" placeholder="Nombre de acciÃ³n">
                      <button class="btn btn-sm btn-link text-danger p-0" (click)="removeAction(i)" title="Eliminar regla"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    
                    <label class="form-label small fw-bold text-muted mb-0 mt-2" style="font-size: 0.65rem;">SI (CondiciÃ³n JavaScript):</label>
                    <div class="input-group input-group-sm mb-2 shadow-sm">
                      <input type="text" class="form-control font-monospace text-primary shadow-none border-primary-subtle" [(ngModel)]="act.condition" placeholder="ej: edad < 18">
                      <select class="form-select border-primary-subtle bg-light text-secondary" style="max-width: 180px; font-size: 0.75rem;" (change)="act.condition = (act.condition || '') + ' ' + $any($event.target).value + ' '; $any($event.target).value=''">
                        <option value="">+ Insertar campo...</option>
                        <option *ngFor="let f of _cachedFieldsList" [value]="f.name">{{f.label || f.name}}</option>
                      </select>
                    </div>
                    
                    <!-- ENTONCES -->
                    <div class="bg-white border rounded p-2 mb-2">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <label class="form-label small fw-bold text-success mb-0" style="font-size: 0.65rem;">ENTONCES (Efectos):</label>
                        <button class="btn btn-sm btn-link text-success p-0" (click)="addEffect(act, 'then')"><i class="bi bi-plus-circle"></i></button>
                      </div>
                      <div *ngFor="let eff of act.thenEffects; let eIdx = index" class="d-flex gap-1 mb-1 align-items-center">
                        <select class="form-select form-select-sm" [(ngModel)]="eff.type" style="width: 35%; font-size: 0.7rem;">
                          <option value="visibility">Visibilidad</option>
                          <option value="requirement">Obligatorio</option>
                          <option value="editability">Editable</option>
                          <option value="setValue">Asignar Valor</option>
                        </select>
                        <select class="form-select form-select-sm" [(ngModel)]="eff.target" style="width: 35%; font-size: 0.7rem;">
                           <option *ngFor="let f of getAllFieldsList()" [value]="f.name">{{f.label || f.name}}</option>
                        </select>
                        <input *ngIf="eff.type !== 'setValue'" type="checkbox" class="form-check-input mt-0" [(ngModel)]="eff.value">
                        <input *ngIf="eff.type === 'setValue'" type="text" class="form-control form-control-sm" [(ngModel)]="eff.value" style="width: 20%;">
                        <button class="btn btn-sm btn-link text-danger p-0" (click)="act.thenEffects.splice(eIdx, 1)"><i class="bi bi-x"></i></button>
                      </div>
                    </div>

                    <!-- SINO -->
                    <div class="bg-white border rounded p-2">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <label class="form-label small fw-bold text-danger mb-0" style="font-size: 0.65rem;">SINO (Efectos Alternos):</label>
                        <button class="btn btn-sm btn-link text-danger p-0" (click)="addEffect(act, 'else')"><i class="bi bi-plus-circle"></i></button>
                      </div>
                      <div *ngFor="let eff of act.elseEffects; let eIdx = index" class="d-flex gap-1 mb-1 align-items-center">
                        <select class="form-select form-select-sm" [(ngModel)]="eff.type" style="width: 35%; font-size: 0.7rem;">
                          <option value="visibility">Visibilidad</option>
                          <option value="requirement">Obligatorio</option>
                          <option value="editability">Editable</option>
                          <option value="setValue">Asignar Valor</option>
                        </select>
                        <select class="form-select form-select-sm" [(ngModel)]="eff.target" style="width: 35%; font-size: 0.7rem;">
                           <option *ngFor="let f of getAllFieldsList()" [value]="f.name">{{f.label || f.name}}</option>
                        </select>
                        <input *ngIf="eff.type !== 'setValue'" type="checkbox" class="form-check-input mt-0" [(ngModel)]="eff.value">
                        <input *ngIf="eff.type === 'setValue'" type="text" class="form-control form-control-sm" [(ngModel)]="eff.value" style="width: 20%;">
                        <button class="btn btn-sm btn-link text-danger p-0" (click)="act.elseEffects.splice(eIdx, 1)"><i class="bi bi-x"></i></button>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="activeSidebarTab === 'actions' && !selectedProcessKey" class="text-center py-5 text-muted card-premium border p-4">
            <i class="bi bi-lightning-charge fs-2 d-block mb-2 text-warning animate-bounce"></i>
            <span class="small fw-semibold">Selecciona un proceso para configurar acciones.</span>
          </div>

        </div> <!-- Cierra PANEL IZQUIERDO -->

        <!-- PANEL CENTRAL: LIENZO DE DISEÃ‘O / PREVISUALIZACION -->
        <div [ngClass]="(activeField || activeSection) ? 'col-xxl-7 col-xl-6 col-lg-7' : 'col-xxl-10 col-xl-9 col-lg-10'">
          <div class="card border-0 shadow-sm card-premium overflow-hidden">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <span class="fw-bold text-indigo d-flex align-items-center gap-2">
                <i class="bi bi-display"></i>Lienzo de Diseño Interactivo
              </span>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-indigo shadow-xs rounded-3 px-3 py-1.5" (click)="addTab()">
                  <i class="bi bi-plus-square-fill me-1"></i>Añadir Pestaña
                </button>
              </div>
            </div> 

            <div class="card-body bg-light overflow-auto p-4" style="max-height: 750px; background-color: #f7f9fc !important;">
              
              <!-- Pestañas del Formulario -->
              <ul class="nav nav-tabs mb-4 custom-tabs" *ngIf="layout.tabs.length > 0">
                <li class="nav-item" *ngFor="let tab of layout.tabs; let tIdx = index">
                  <a class="nav-link d-flex align-items-center gap-2 cursor-pointer py-2 px-3"

                    [class.active]="activeTabIdx === tIdx" 
                    (click)="selectTab(tab, tIdx, $event)" href="javascript:void(0)">
                    <input type="text" class="border-0 bg-transparent fw-bold shadow-none text-indigo font-small-tab" 
                      [(ngModel)]="tab.title" (input)="0" style="width: 110px;">
                    <i class="bi bi-x-circle text-danger cursor-pointer tab-close-btn" (click)="removeTab(tIdx); $event.stopPropagation();"></i>
                  </a>
                </li>
              </ul>

              <!-- Contenido de Pestaña -->
              <div *ngIf="layout.tabs.length > 0" class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="text-muted small fw-semibold">Pestaña Activa: <strong class="text-dark">{{ layout.tabs[activeTabIdx].title }}</strong></span>
                  <button class="btn btn-sm btn-outline-indigo shadow-xs" (click)="addSection()">
                    <i class="bi bi-folder-plus me-1"></i>Añadir Sección
                  </button>
                </div>

                <!-- Secciones -->
                <div *ngFor="let section of layout.tabs[activeTabIdx].sections; let sIdx = index" 
                     class="card border-0 shadow-xs mb-4 section-card"
                     [class.border]="activeSection === section"
                     [class.border-primary]="activeSection === section">
                  <div class="card-header bg-white d-flex justify-content-between align-items-center py-2 border-0"
                       style="cursor: pointer;"
                       (click)="selectSection(section, $event)">
                    <div class="d-flex align-items-center gap-2 w-70">
                      <i class="bi bi-grip-vertical text-muted"></i>
                      <input type="text" class="form-control form-control-sm border-0 fw-bold text-dark w-100 shadow-none section-title-input" 
                        [(ngModel)]="section.title" (input)="0" style="font-size: 0.95rem;">
                    </div>
                    <div class="d-flex gap-2 align-items-center">
                      <button class="btn btn-sm btn-link text-secondary p-0 border-0" (click)="moveSectionUp(sIdx)" [disabled]="sIdx === 0" title="Subir Sección">
                        <i class="bi bi-arrow-up-circle"></i>
                      </button>
                      <button class="btn btn-sm btn-link text-secondary p-0 border-0" (click)="moveSectionDown(sIdx)" [disabled]="sIdx === layout.tabs[activeTabIdx].sections.length - 1" title="Bajar Sección">
                        <i class="bi bi-arrow-down-circle"></i>
                      </button>
                      <button class="btn btn-sm btn-link text-danger p-0 border-0 ms-2" (click)="removeSection(sIdx)" title="Eliminar Sección">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                  <div class="card-body bg-white border-top p-4">
                      <div class="row g-2">
                        <!-- Campos / Controles -->
                        <ng-container *ngFor="let field of section.fields; let fIdx = index">
                          <!-- DROP INDICATOR LINE -->
                          <div class="col-12 p-0" style="height:0;position:relative;" *ngIf="dragOverSectionIdx === sIdx && dragOverFieldIdx === fIdx">
                            <div style="position:absolute;top:-2px;left:8px;right:8px;height:3px;border-radius:2px;background:linear-gradient(90deg,#4f46e5,#7c3aed);z-index:50;box-shadow:0 0 6px rgba(99,102,241,0.6);"></div>
                          </div>

                          <div [class]="'col-md-' + (field.cols || 6)"
                            [attr.draggable]="dragHoverId === (sIdx + '_' + fIdx) ? 'true' : 'false'"
                            (dragstart)="onFieldDragStart($event, sIdx, fIdx)"
                            (dragover)="onFieldDragOver($event, sIdx, fIdx)"
                            (dragenter)="onFieldDragEnter($event, sIdx, fIdx)"
                            (drop)="onFieldDrop($event, sIdx, fIdx)"
                            (dragend)="onFieldDragEnd()"
                            [style.opacity]="dragFieldIdx === fIdx && dragSectionIdx === sIdx ? '0.35' : '1'"
                            [style.transition]="'opacity 0.15s'">

                            <!-- Caja de control con hover y foco activo -->
                            <div class="p-2 border rounded-3 bg-white shadow-xs position-relative cursor-pointer field-card"
                              (click)="selectField(field); $event.stopPropagation()"
                              [class.border-indigo]="activeField === field"
                            [class.active-card]="activeField === field"
                            [class.dragging-card]="dragFieldIdx === fIdx && dragSectionIdx === sIdx">

                            <!-- GRIP HANDLE -->
                            <div class="position-absolute top-0 start-0 p-1 d-flex align-items-center h-100 grip-handle"
                                 style="cursor:grab;width:18px;z-index:10;"
                                 title="Arrastrar para reordenar"
                                 (mouseenter)="dragHoverId = sIdx + '_' + fIdx"
                                 (mouseleave)="dragHoverId = null">
                              <i class="bi bi-grip-vertical text-muted" style="font-size:0.85rem;"></i>
                            </div>

                            <!-- Reordering & Sizing Toolbar (Visible when active) -->
                            <div class="field-toolbar d-flex gap-1 bg-indigo text-white p-1 rounded-2 shadow" *ngIf="activeField === field">
                              <button class="btn btn-xxs text-white" (click)="moveFieldUp(sIdx, fIdx); $event.stopPropagation();" [disabled]="fIdx === 0" title="Mover Izquierda/Arriba">
                                <i class="bi bi-arrow-left"></i>
                              </button>
                              <button class="btn btn-xxs text-white" (click)="moveFieldDown(sIdx, fIdx); $event.stopPropagation();" [disabled]="fIdx === section.fields.length - 1" title="Mover Derecha/Abajo">
                                <i class="bi bi-arrow-right"></i>
                              </button>
                              <button class="btn btn-xxs text-white ms-1 border-start ps-2" (click)="changeFieldWidth(field, 4); $event.stopPropagation();" title="Ancho 1/3">1/3</button>
                              <button class="btn btn-xxs text-white" (click)="changeFieldWidth(field, 6); $event.stopPropagation();" title="Ancho 1/2">1/2</button>
                              <button class="btn btn-xxs text-white" (click)="changeFieldWidth(field, 12); $event.stopPropagation();" title="Ancho Completo">1/1</button>
                            </div>

                            <!-- Indicadores del control -->
                            <div class="position-absolute top-0 end-0 p-1 d-flex gap-1" style="font-size: 0.6rem;">
                              <span class="badge bg-light text-dark border">{{ field.controlType }}</span>
                              <span class="badge bg-indigo-soft">{{ field.cols }}/12</span>
                            </div>

                            <div class="pe-4 ps-3 py-1">
                              <small class="text-muted d-block font-monospace" style="font-size: 0.6rem; margin-bottom: 2px;">{{ field.name }}</small>
                              <span class="fw-bold text-dark" style="font-size: 0.85rem;">
                                {{ field.label || 'Sin Etiqueta' }}
                                <span class="text-danger" *ngIf="field.required">*</span>
                                <i class="bi bi-lock-fill text-muted ms-1" *ngIf="isFieldDisabled(field)" title="Solo Lectura"></i>
                              </span>

                              <!-- RENDER MOCKUPS DE CONTROLES BIZAGI -->
                              <div class="mt-1">
                                
                                <!-- TEXTBOX -->
                                <div *ngIf="field.controlType === 'TEXTBOX'" class="input-group input-group-sm">
                                  <input type="text" class="form-control form-control-sm bg-light text-muted" [placeholder]="field.defaultValue || 'abc...'" disabled>
                                </div>

                                <!-- TEXTAREA -->
                                <div *ngIf="field.controlType === 'TEXTAREA'" class="input-group input-group-sm">
                                  <textarea class="form-control form-control-sm bg-light text-muted" placeholder="Texto extenso..." disabled rows="2"></textarea>
                                </div>

                                <!-- NUMBER -->
                                <div *ngIf="field.controlType === 'NUMBER'" class="input-group input-group-sm">
                                  <input type="number" class="form-control form-control-sm bg-light text-muted" [placeholder]="field.defaultValue || '123'" disabled>
                                  <span class="input-group-text"><i class="bi bi-hash"></i></span>
                                </div>

                                <!-- MONEY -->
                                <div *ngIf="field.controlType === 'MONEY'" class="input-group input-group-sm">
                                  <span class="input-group-text">$</span>
                                  <input type="text" class="form-control form-control-sm bg-light text-muted" [placeholder]="field.defaultValue || '0.00'" disabled>
                                </div>

                                <!-- DATE -->
                                <div *ngIf="field.controlType === 'DATE'" class="input-group input-group-sm">
                                  <input type="text" class="form-control form-control-sm bg-light text-muted" [placeholder]="field.defaultValue || 'dd/mm/aaaa'" disabled>
                                  <span class="input-group-text"><i class="bi bi-calendar-date"></i></span>
                                </div>

                                <!-- YESNO -->
                                <div *ngIf="field.controlType === 'YESNO'" class="form-check form-switch mt-1">
                                  <input class="form-check-input" type="checkbox" role="switch" [checked]="field.defaultValue === 'true' || field.defaultValue === true" disabled>
                                  <label class="form-check-label text-muted small">Estado lógico</label>
                                </div>

                                <!-- FILEUPLOAD -->
                                <div *ngIf="field.controlType === 'FILEUPLOAD'" class="border border-secondary rounded p-2 text-center bg-light" style="border-style: dotted !important;">
                                  <i class="bi bi-cloud-arrow-up fs-5 text-purple animate-bounce"></i>
                                  <span class="d-block text-muted" style="font-size: 0.65rem;">Arrastrar archivo aquí</span>
                                </div>

                                <!-- COMBO BOX -->
                                <div *ngIf="field.controlType === 'COMBO'" class="input-group input-group-sm">
                                  <select class="form-select form-select-sm bg-light text-muted" disabled>
                                    <option>-- Seleccionar {{ getEntityLabel(field.config?.dataSourceEntityId) || 'Opción' }} --</option>
                                  </select>
                                  <span class="input-group-text"><i class="bi bi-chevron-down"></i></span>
                                </div>

                                <!-- DATA GRID -->
                                <div *ngIf="field.controlType === 'GRID'" class="table-responsive border rounded p-2 bg-light">
                                  <table class="table table-sm table-bordered mb-0 text-muted" style="font-size: 0.65rem;">
                                    <thead class="table-light text-muted small text-uppercase">
                                      <tr>
                                        <ng-container *ngIf="getGridColumns(field).length > 0; else genericGridCols">
                                          <th *ngFor="let col of getGridColumns(field)">
                                            {{ col.label || col.name }}
                                            <span *ngIf="col.parametricTableId" class="badge bg-indigo ms-1" style="font-size:0.55rem; vertical-align: middle;">CATÁLOGO</span>
                                          </th>
                                        </ng-container>
                                        <ng-template #genericGridCols>
                                          <th>Columna A</th><th>Columna B</th><th>Columna C</th>
                                        </ng-template>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr *ngIf="getGridColumns(field).length > 0">
                                        <td *ngFor="let col of getGridColumns(field)" class="text-center align-middle">
                                          <ng-container *ngIf="col.type === 'RADIO' || col.type === 'radio'">
                                            <input class="form-check-input m-0" type="radio" disabled>
                                          </ng-container>
                                          <ng-container *ngIf="col.type === 'CHECKBOX' || col.type === 'checkbox' || col.type === 'BOOLEAN' || col.type === 'boolean'">
                                            <input class="form-check-input m-0" type="checkbox" disabled>
                                          </ng-container>
                                          <ng-container *ngIf="col.type !== 'RADIO' && col.type !== 'radio' && col.type !== 'CHECKBOX' && col.type !== 'checkbox' && col.type !== 'BOOLEAN' && col.type !== 'boolean'">
                                            ...
                                          </ng-container>
                                        </td>
                                      </tr>
                                      <tr *ngIf="getGridColumns(field).length === 0">
                                        <td>...</td><td>...</td><td>...</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div class="text-center text-indigo mt-1 fw-bold" style="font-size: 0.6rem;">
                                    <i class="bi bi-database me-1"></i>Enlazado a: {{ getEntityLabel(field.config?.dataSourceEntityId) || 'Ninguna Tabla' }}
                                  </div>
                                </div>

                                <!-- IMAGE -->
                                <div *ngIf="field.controlType === 'IMAGE'" class="border rounded p-2 text-center bg-light">
                                  <i class="bi bi-image text-muted fs-4"></i>
                                  <span class="d-block text-muted" style="font-size: 0.65rem;">Visualizador de Imagen</span>
                                </div>

                                <!-- BUTTON -->
                                <div *ngIf="field.controlType === 'BUTTON'" class="d-grid mt-1">
                                  <button type="button" class="btn btn-sm text-truncate" [class]="field.config?.buttonStyle || 'btn-primary'" disabled>
                                    <i class="bi bi-play-circle me-1"></i>{{ field.label || 'Acción' }}
                                  </button>
                                </div>

                                <!-- LABEL -->
                                <div *ngIf="field.controlType === 'LABEL'" class="border p-1 bg-light text-center small text-muted">
                                  <i class="bi bi-card-text"></i> Separador
                                </div>

                                <!-- SIMULADOR -->
                                <div *ngIf="field.controlType === 'SIMULADOR'" class="border p-2 bg-primary bg-opacity-10 text-center rounded-3 shadow-sm border-primary">
                                  <i class="bi bi-calculator-fill fs-3 text-primary mb-1"></i>
                                  <h6 class="text-primary fw-bold mb-0">Componente Interactivo: Simulador de Crédito</h6>
                                  <small class="text-muted" style="font-size: 0.6rem;">Se renderizará el módulo completo de simulación en este espacio.</small>
                                </div>

                                <!-- RESUMEN CASO -->
                                <div *ngIf="field.controlType === 'RESUMEN_CASO'" class="border p-2 bg-secondary bg-opacity-10 text-center rounded-3 shadow-sm border-secondary mt-1">
                                  <i class="bi bi-file-earmark-person fs-2 text-secondary mb-2"></i>
                                  <h6 class="text-secondary fw-bold mb-0">Componente: Información General</h6>
                                  <small class="text-muted">Se renderizará el resumen de la información en este espacio.</small>
                                </div>

                              </div>

                              <!-- Reglas de visibilidad -->
                              <div class="mt-2 text-muted" style="font-size: 0.65rem;" *ngIf="field.visibleIf">
                                <i class="bi bi-eye-slash-fill text-warning me-1"></i>
                                Visible si: <code>{{ field.visibleIf }}</code>
                              </div>
                            </div>

                            <!-- Botón Eliminar Control -->
                            <button class="btn btn-sm btn-link text-danger position-absolute bottom-0 end-0 p-1 border-0 hover-scale" 
                              (click)="removeField(sIdx, fIdx); $event.stopPropagation();" title="Eliminar Control">
                              <i class="bi bi-trash3-fill"></i>
                            </button>
                          </div>
                        </div>
                      </ng-container>

                      <!-- DROP INDICATOR AT END -->
                      <div class="col-12 p-0" style="height:0;position:relative;" *ngIf="dragOverSectionIdx === sIdx && dragOverFieldIdx === section.fields.length">
                        <div style="position:absolute;top:-2px;left:8px;right:8px;height:3px;border-radius:2px;background:linear-gradient(90deg,#4f46e5,#7c3aed);z-index:50;box-shadow:0 0 6px rgba(99,102,241,0.6);"></div>
                      </div>

                      <!-- SECCION VACIA DROP ZONE -->
                      <div *ngIf="section.fields.length === 0" class="col-12"
                           (dragover)="onFieldDragOver($event, sIdx, 0)"
                           (drop)="onFieldDrop($event, sIdx, 0)">
                        <div class="border border-2 border-dashed rounded-3 p-4 text-center text-muted"
                             [style.borderColor]="dragOverSectionIdx === sIdx ? '#4f46e5' : '#dee2e6'"
                             [style.background]="dragOverSectionIdx === sIdx ? '#f5f3ff' : 'transparent'">
                          <i class="bi bi-arrow-bar-down d-block fs-4 mb-1"></i>
                          <span style="font-size:0.8rem;">Arrastra controles aquí o usa el panel de controles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lienzo Vacío -->
              <div *ngIf="layout.tabs.length === 0" class="text-center py-5 text-muted card-premium border bg-white p-5 m-3">
                <i class="bi bi-plus-square fs-1 d-block mb-3 text-secondary animate-pulse"></i>
                <h5 class="fw-bold text-dark">Diseñador de Pantalla Vacío</h5>
                <p class="small text-muted mb-4">Empieza añadiendo una pestaña para tu formulario y organizando tus campos.</p>
                <button class="btn btn-primary-premium shadow-md" (click)="addTab()">
                  <i class="bi bi-plus-circle me-1"></i>Añadir Pestaña Inicial
                </button>
              </div>            </div>
          </div>
        </div>

        <!-- PANEL DERECHO: PROPIEDADES DEL CONTROL SELECCIONADO (OFFCANVAS) -->
        <div class="col-xxl-3 col-xl-3 col-lg-3">
          
          <!-- ESTADO VACIO -->
          <div *ngIf="!activeField && !activeSection && !activeTabObj" class="card border-0 shadow-sm card-premium h-100 d-flex flex-column align-items-center justify-content-center text-muted p-4">
            <i class="bi bi-hand-index-thumb fs-1 mb-3 text-primary" style="opacity: 0.5;"></i>
            <h6 class="fw-bold">Selecciona un Elemento</h6>
            <p class="small text-center mb-0">Haz clic sobre un campo, secci&oacute;n o pesta&ntilde;a en el lienzo para ver y editar sus propiedades.</p>
          </div>

          <!-- PROPIEDADES CAMPO -->
          <div class="card border-0 shadow-sm card-premium h-100" *ngIf="activeField && draftField">
          <div class="card-header bg-white text-dark shadow-xs py-3 border-0">
            <h5 class="offcanvas-title fw-bold d-flex align-items-center gap-2 mb-0" style="font-size: 1rem;"><i class="bi bi-sliders"></i>Propiedades Campo</h5>
            <button type="button" class="btn-close" (click)="cancelarPropiedades()" aria-label="Close"></button>
          </div>
          <div class="card-body p-0 d-flex flex-column" style="background-color: #f8fafc;">
            <div class="card-body p-2 flex-grow-1 overflow-auto">
              <div class="accordion" id="propiedadesAccordion">
                
                <!-- 1. GENERAL -->
                <div class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                  <h2 class="accordion-header" id="headingGeneral">
                    <button class="accordion-button rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseGeneral" aria-expanded="true" aria-controls="collapseGeneral">
                      <i class="bi bi-info-circle text-primary me-2"></i>General
                    </button>
                  </h2>
                  <div id="collapseGeneral" class="accordion-collapse collapse show" aria-labelledby="headingGeneral" data-bs-parent="#propiedadesAccordion">
                    <div class="accordion-body bg-white border border-top-0 rounded-bottom-3 p-3">
                      <div class="mb-3">
                        <label class="form-label small fw-bold mb-1">Nombre Técnico (BD)</label>
                        <input type="text" class="form-control form-control-sm bg-light shadow-none custom-input font-monospace text-dark" [value]="draftField.name" readonly>
                        <div class="form-text text-muted" style="font-size: 0.65rem;">Identificador único persistente en base de datos.</div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label small fw-bold mb-1">Etiqueta Visual</label>
                        <input type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="draftField.label">
                      </div>

                      <div class="mb-3">
                        <label class="form-label small fw-bold mb-1">Tipo de Control</label>
                        <select class="form-select form-select-sm shadow-none custom-select" [(ngModel)]="draftField.controlType">
                          <option value="TEXTBOX">Caja de Texto</option>
                          <option value="TEXTAREA">Texto Extenso</option>
                          <option value="NUMBER">Número</option>
                          <option value="MONEY">Dinero</option>
                          <option value="COMBO">Lista Desplegable (Combo)</option>
                          <option value="DATE">Fecha</option>
                          <option value="YESNO">Sí/No (Switch)</option>
                          <option value="FILEUPLOAD">Archivo (Gestor Documental)</option>
                          <option value="BUTTON">Botón de Acción</option>
                          <option value="LABEL">Separador</option>
                          <option value="LINK">Enlace</option>
                          <option value="SIMULADOR">Simulador</option>
                          <option value="RESUMEN_CASO">Info General</option>
                        </select>
                      </div>

                      <div class="mb-3">
                        <label class="form-label small fw-bold mb-1">Ancho en Pantalla</label>
                        <select class="form-select form-select-sm shadow-none custom-select" [(ngModel)]="draftField.cols">
                          <option [value]="3">Un Cuarto (1/4)</option>
                          <option [value]="4">Un Tercio (1/3)</option>
                          <option [value]="6">Mitad de Pantalla (1/2)</option>
                          <option [value]="12">Ancho Completo (Full)</option>
                        </select>
                      </div>

                      <div class="mb-0">
                        <label class="form-label small fw-bold mb-1">Regla de Visibilidad</label>
                        <input type="text" class="form-control form-control-sm shadow-none custom-input font-monospace text-primary" placeholder="ej: monto_aprobado > 1000" [(ngModel)]="draftField.visibleIf">
                        <div class="form-text text-muted" style="font-size: 0.65rem;">Expresión lógica dinámica en base a variables.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2. REGLAS Y ESTADO -->
                <div class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                  <h2 class="accordion-header" id="headingReglas">
                    <button class="accordion-button collapsed rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseReglas" aria-expanded="false" aria-controls="collapseReglas">
                      <i class="bi bi-check-square-fill text-indigo me-2"></i>Reglas y Estado
                    </button>
                  </h2>
                  <div id="collapseReglas" class="accordion-collapse collapse" aria-labelledby="headingReglas" data-bs-parent="#propiedadesAccordion">
                    <div class="accordion-body bg-white border border-top-0 rounded-bottom-3 p-3">
                      <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="fieldRequired" [(ngModel)]="draftField.required">
                        <label class="form-check-label small fw-bold text-secondary" for="fieldRequired">Campo Obligatorio</label>
                      </div>

                      <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="fieldReadOnly" [(ngModel)]="draftField.readOnly">
                        <label class="form-check-label small fw-bold text-secondary" for="fieldReadOnly">Solo Lectura (Read Only)</label>
                      </div>

                      <div class="mb-0">
                        <label class="form-label small fw-bold mb-1">Valor por Defecto</label>
                        <input type="text" class="form-control form-control-sm shadow-none custom-input" placeholder="Ej: 0.00" [(ngModel)]="draftField.defaultValue">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. ENLACE DE DATOS -->
                <div *ngIf="activeField.controlType === 'COMBO' || activeField.controlType === 'GRID' || activeField.config?.dataSourceEntityId" class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                  <h2 class="accordion-header" id="headingDatos">
                    <button class="accordion-button collapsed rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDatos" aria-expanded="false" aria-controls="collapseDatos">
                      <i class="bi bi-database-fill-gear text-emerald me-2"></i>Enlace de Datos
                    </button>
                  </h2>
                  <div id="collapseDatos" class="accordion-collapse collapse" aria-labelledby="headingDatos" data-bs-parent="#propiedadesAccordion">
                    <div class="accordion-body bg-white border border-top-0 rounded-bottom-3 p-3">
                      <div class="mb-2">
                        <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">Atributo o Campo Enlazado</label>
                        <select class="form-select form-select-sm shadow-none custom-select" [(ngModel)]="draftField.config.dataSourceEntityId">
                          <option [ngValue]="null">-- Sin Enlace (Variable Local) --</option>
                          <optgroup label="Tablas Paramétricas (Catálogos)">
                            <option *ngFor="let pt of parametricTables" [value]="pt.id">{{ pt.label || pt.name }} (Catálogo)</option>
                          </optgroup>
                          <optgroup label="Entidades de Negocio">
                            <option *ngFor="let ent of entities" [value]="ent.id">{{ ent.label }} (Entidad)</option>
                          </optgroup>
                        </select>
                      </div>
                      
                      <div class="row g-2 mb-0">
                        <div class="col-6">
                          <label class="form-label small text-muted mb-1" style="font-size: 0.70rem;">Campo Display</label>
                          <input list="displayColsList" type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="draftField.config.displayField" placeholder="ej: nombre">
                          <datalist id="displayColsList">
                            <option *ngFor="let col of getAvailableSourceColumns(draftField)" [value]="col.name">{{ col.label }}</option>
                          </datalist>
                        </div>
                        <div class="col-6">
                          <label class="form-label small text-muted mb-1" style="font-size: 0.70rem;">Campo Valor</label>
                          <input list="valueColsList" type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="draftField.config.valueField" placeholder="ej: id">
                          <datalist id="valueColsList">
                            <option *ngFor="let col of getAvailableSourceColumns(draftField)" [value]="col.name">{{ col.label }}</option>
                          </datalist>
                        </div>
                      </div>

                      <!-- Columnas configurables para GRID -->
                      <div *ngIf="activeField.controlType === 'GRID'" class="mt-2">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                          <div class="d-flex align-items-center gap-1">
                            <i class="bi bi-list-columns text-indigo" style="font-size:0.8rem;"></i>
                            <span class="small fw-bold text-muted">Columnas a mostrar:</span>
                            <span *ngIf="gridColumnsLoading" class="spinner-border spinner-border-sm text-secondary ms-1" style="width:0.75rem;height:0.75rem;"></span>
                          </div>
                          <button class="btn btn-xs py-0 px-1 btn-outline-indigo" style="font-size:0.65rem;" (click)="syncGridColumns(draftField)" title="Recargar columnas de la tabla">
                            <i class="bi bi-arrow-clockwise"></i>
                          </button>
                        </div>

                        <div *ngIf="!draftField.config.dataSourceEntityId" class="mb-2">
                          <button class="btn btn-sm btn-outline-indigo w-100 py-1 fw-bold" style="font-size:0.75rem;" (click)="addVirtualColumn(draftField)">
                            <i class="bi bi-plus-lg me-1"></i>Añadir Columna Personalizada
                          </button>
                        </div>
                        <div *ngIf="getAvailableColumnsForField(draftField).length > 0"
                             class="border rounded overflow-hidden" style="max-height:450px;overflow-y:auto;">
                          <div *ngFor="let col of getAvailableColumnsForField(draftField); let ci = index"
                               class="d-flex flex-column border-bottom bg-white hover-row">
                            <div class="d-flex align-items-center gap-2 px-2 py-1" style="font-size:0.78rem;">
                              <div class="form-check form-switch mb-0" style="min-width:32px;">
                                <input class="form-check-input" type="checkbox"
                                       [id]="'col_vis_' + draftField.name + '_' + ci"
                                       [(ngModel)]="col.visible"
                                       (ngModelChange)="updateSelectedColumns(draftField)">
                              </div>
                              <input type="text"
                                     class="form-control form-control-xs border-0 shadow-none p-0 bg-transparent"
                                     style="font-size:0.78rem;min-width:0;flex:1;"
                                     [disabled]="!col.visible"
                                     [(ngModel)]="col.label"
                                     (ngModelChange)="updateSelectedColumns(draftField)"
                                     [placeholder]="col.name">
                              <span class="text-muted font-monospace" style="font-size:0.65rem;white-space:nowrap;">{{ col.name }}</span>
                              <button *ngIf="!draftField.config.dataSourceEntityId" class="btn btn-sm text-danger p-0 ms-2" (click)="deleteVirtualColumn(draftField, ci)" title="Eliminar Columna">
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                            <div *ngIf="col.visible" class="d-flex flex-column gap-1 px-2 pb-2 ps-5">
                              <div class="d-flex align-items-center gap-2">
                                <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap; width: 60px;">Tipo:</label>
                                  <select class="form-select form-select-sm border shadow-none px-1 py-0 bg-light"
                                          style="font-size: 0.65rem; height: 22px; flex: 1;"
                                          [(ngModel)]="col.type"
                                          (ngModelChange)="updateSelectedColumns(draftField)">
                                    <option value="string">Texto</option>
                                    <option value="number">Número</option>
                                    <option value="date">Fecha</option>
                                    <option value="boolean">Booleano</option>
                                    <option value="RADIO">Radio (Selección)</option>
                                    <option value="CHECKBOX">Checkbox (Múltiple)</option>
                                  </select>
                                </div>
                                <div class="d-flex align-items-center gap-2">
                                  <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap; width: 60px;">Visibilidad:</label>
                                <input type="text" class="form-control form-control-sm border shadow-none px-1 py-0 bg-light" 
                                       style="font-size: 0.65rem; height: 22px; flex: 1;" 
                                       [(ngModel)]="col.visibilityRule" 
                                       (ngModelChange)="updateSelectedColumns(draftField)"
                                       placeholder="ej: estadoCivil === 'Soltero'">
                              </div>
                              <div *ngIf="!draftField.config.dataSourceEntityId" class="d-flex align-items-center gap-2">
                                <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap; width: 60px;">Catálogo:</label>
                                <select class="form-select form-select-sm border shadow-none px-1 py-0" 
                                        style="font-size: 0.65rem; height: 22px; flex: 1;"
                                        [(ngModel)]="col.parametricTableId"
                                        (ngModelChange)="updateSelectedColumns(draftField)">
                                  <option [ngValue]="undefined">-- Ninguno --</option>
                                  <option *ngFor="let pt of parametricTables" [ngValue]="pt.id">{{ pt.name }}</option>
                                </select>
                              </div>
                            </div>
                            <div *ngIf="col.parametricTableId && col.visible" class="d-flex align-items-center gap-2 px-2 pb-2 ps-5">
                              <label class="text-muted mb-0" style="font-size: 0.65rem; white-space: nowrap;">Campo a mostrar:</label>
                              <select *ngIf="getParametricColumnsForDisplay(col.parametricTableId).length > 0"
                                      class="form-select form-select-sm border shadow-none px-1 py-0" 
                                      style="font-size: 0.65rem; height: 22px; min-width: 120px; padding-right: 1.5rem;" 
                                      [(ngModel)]="col.displayField" 
                                      (ngModelChange)="updateSelectedColumns(draftField)">
                                <option [ngValue]="undefined">Automático (defecto)</option>
                                <option *ngFor="let opt of getParametricColumnsForDisplay(col.parametricTableId)" [value]="opt.name">
                                  {{ opt.label || opt.name }}
                                </option>
                              </select>
                              <input *ngIf="getParametricColumnsForDisplay(col.parametricTableId).length === 0"
                                     type="text" class="form-control form-control-sm border shadow-none px-1 py-0" 
                                     style="font-size: 0.65rem; height: 22px; width: 100px;" 
                                     [(ngModel)]="col.displayField" 
                                     (ngModelChange)="updateSelectedColumns(draftField)" 
                                     placeholder="ej: descripcion">
                            </div>
                          </div>
                        </div>

                        <div *ngIf="getAvailableColumnsForField(draftField).length === 0 && !gridColumnsLoading"
                             class="text-muted small mt-1">Sin columnas disponibles. Seleccione una tabla de origen.</div>
                      </div>

                      <!-- Campos de mapeo de Combos -->
                      <div *ngIf="draftField.controlType === 'COMBO' && draftField.config.dataSourceEntityId" class="mt-2 mb-2">
                        <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">Campo a Desplegar (Display)</label>
                        <input type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="draftField.config.displayField" placeholder="ej: nombre">
                      </div>

                      <div *ngIf="draftField.controlType === 'COMBO' && draftField.config.dataSourceEntityId" class="mb-2">
                        <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">Campo de Valor (Key)</label>
                        <input type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="draftField.config.valueField" placeholder="ej: id">
                      </div>

                      <div *ngIf="!draftField.config.dataSourceEntityId" class="mt-2">
                        <span class="badge bg-warning-subtle text-warning-emphasis small text-wrap w-100">⚠️ Recomendación: Enlace este control a una tabla de BD.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 4. REGLAS DE CASCADA -->
                <div *ngIf="activeField.controlType === 'COMBO'" class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                  <h2 class="accordion-header" id="headingCascada">
                    <button class="accordion-button collapsed rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCascada" aria-expanded="false" aria-controls="collapseCascada" style="background:#f0fdf4;">
                      <i class="bi bi-lightning-charge-fill text-success me-2"></i>Reglas en Cascada
                    </button>
                  </h2>
                  <div id="collapseCascada" class="accordion-collapse collapse" aria-labelledby="headingCascada" data-bs-parent="#propiedadesAccordion">
                    <div class="accordion-body bg-white border border-top-0 border-success-subtle rounded-bottom-3 p-3">
                      <p class="text-muted mb-2" style="font-size:0.68rem;">Al seleccionar, rellenar los siguientes campos destino con los valores del origen:</p>

                      <div class="d-flex px-1 mb-1" *ngIf="getCascadeRules(draftField).length > 0">
                        <div class="text-muted fw-bold text-center" style="font-size: 0.65rem; width: 42%;">Origen</div>
                        <div style="width: 8%;"></div>
                        <div class="text-muted fw-bold text-center" style="font-size: 0.65rem; width: 42%;">Destino</div>
                        <div style="width: 8%;"></div>
                      </div>

                      <div *ngFor="let rule of getCascadeRules(draftField); let rIdx = index" class="d-flex align-items-center mb-2 p-1 bg-light rounded border border-success-subtle shadow-sm">
                        <div style="width: 42%;">
                            <select class="form-select form-select-xs border-0 bg-transparent text-center fw-bold text-dark shadow-none w-100"
                                   style="font-size:0.72rem; text-overflow: ellipsis;"
                                   [(ngModel)]="rule.sourceColumn" title="{{ rule.sourceColumn || 'Seleccionar' }}">
                               <option value="">-- Seleccionar --</option>
                               <option *ngFor="let col of getAvailableSourceColumns(draftField)" [value]="col.name">{{ col.label }}</option>
                            </select>
                        </div>
                        <div class="text-center text-success" style="width: 8%;">
                          <i class="bi bi-arrow-right fw-bold"></i>
                        </div>
                        <div style="width: 42%;">
                            <select class="form-select form-select-xs border-0 bg-transparent text-center fw-bold text-indigo shadow-none w-100"
                                   style="font-size:0.72rem; text-overflow: ellipsis;"
                                   [(ngModel)]="rule.targetField" title="{{ rule.targetField || 'Seleccionar' }}">
                               <option value="">-- Seleccionar --</option>
                               <option *ngFor="let lf of getAllLayoutFields()" [value]="lf.name">{{ lf.label || lf.name }}</option>
                            </select>
                        </div>
                        <div class="text-end pe-1" style="width: 8%;">
                          <button class="btn btn-sm btn-link text-danger p-0 shadow-none" (click)="removeCascadeRule(draftField, rIdx)" title="Eliminar regla">
                            <i class="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </div>

                      <button class="btn btn-sm btn-outline-success w-100 rounded-pill mt-1" (click)="addCascadeRule(draftField)">
                        <i class="bi bi-plus-circle me-1"></i>Añadir Mapeo
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 5. CONFIGURACIÓN DE BOTONES -->
                <div *ngIf="activeField.controlType === 'BUTTON'" class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                  <h2 class="accordion-header" id="headingBoton">
                    <button class="accordion-button rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBoton" aria-expanded="true" aria-controls="collapseBoton" style="background:#fff1f2;">
                      <i class="bi bi-play-btn-fill text-rose me-2"></i>Acción del Botón
                    </button>
                  </h2>
                  <div id="collapseBoton" class="accordion-collapse collapse show" aria-labelledby="headingBoton" data-bs-parent="#propiedadesAccordion">
                    <div class="accordion-body bg-white border border-top-0 border-danger-subtle rounded-bottom-3 p-3">
                      <div class="mb-2">
                        <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">Operación BPMN</label>
                        <select class="form-select form-select-sm shadow-none custom-select" [(ngModel)]="draftField.config.buttonAction">
                          <option value="SAVE">💾 Guardar Datos</option>
                          <option value="NEXT_TASK">➡️ Avanzar Tarea</option>
                          <option value="CANCEL">❌ Cancelar</option>
                          <option value="CUSTOM">⚡ Ejecutar Regla/API</option>
                          <option value="GENERATE_DOCUMENT">📄 Generar Documento</option>
                        </select>
                      </div>

                      <div class="mb-2" *ngIf="draftField.config.buttonAction === 'GENERATE_DOCUMENT'">
                        <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">Plantilla de Documento</label>
                        <select class="form-select form-select-sm shadow-none custom-select border-primary-subtle" [(ngModel)]="draftField.config.documentDefinitionId">
                          <option [ngValue]="undefined" disabled>-- Seleccionar Plantilla --</option>
                          <option *ngFor="let doc of documentDefinitions" [value]="doc.id">{{ doc.name }}</option>
                        </select>
                      </div>

                      <div class="mb-2" *ngIf="draftField.config.buttonAction === 'CUSTOM'">
                        <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">API a Ejecutar</label>
                        <select class="form-select form-select-sm shadow-none custom-select border-primary-subtle" [(ngModel)]="draftField.config.apiToExecute">
                          <option [ngValue]="undefined" disabled>-- Seleccionar API --</option>
                          <option *ngFor="let api of apisConfiguradas" [value]="api.name">{{ api.name }} ({{ api.method }})</option>
                        </select>
                        <div class="form-check mt-2" *ngIf="draftField.config.apiToExecute">
                          <input class="form-check-input" type="checkbox" id="enableSectionOnApiFail" [(ngModel)]="draftField.config.enableSectionOnApiFail">
                          <label class="form-check-label small fw-bold text-secondary" for="enableSectionOnApiFail" style="font-size: 0.7rem;">Habilitar edición si API no encuentra datos</label>
                        </div>
                      </div>

                      <div class="mb-0">
                        <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">Estilo Visual</label>
                        <select class="form-select form-select-sm shadow-none custom-select" [(ngModel)]="draftField.config.buttonStyle">
                          <option value="btn-primary">Azul (Principal)</option>
                          <option value="btn-secondary">Gris (Secundario)</option>
                          <option value="btn-success">Verde (Aprobaciones)</option>
                          <option value="btn-danger">Rojo (Rechazos)</option>
                          <option value="btn-warning">Amarillo (Alertas)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                  <!-- 6. CONFIGURACION DE ARCHIVOS -->
                  <div *ngIf="draftField.controlType === 'FILEUPLOAD' || draftField.controlType === 'FILE'" class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                    <h2 class="accordion-header" id="headingArchivo">
                      <button class="accordion-button rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseArchivo" aria-expanded="true" aria-controls="collapseArchivo" style="background:#e0f2fe;">
                        <i class="bi bi-cloud-upload-fill text-info me-2"></i>Carga de Archivos
                      </button>
                    </h2>
                    <div id="collapseArchivo" class="accordion-collapse collapse show" aria-labelledby="headingArchivo" data-bs-parent="#propiedadesAccordion">
                      <div class="accordion-body bg-white border border-top-0 border-info-subtle rounded-bottom-3 p-3">
                        <div class="mb-2">
                          <label class="form-label small text-muted mb-1" style="font-size: 0.75rem;">API Externa de Subida</label>
                          <select class="form-select form-select-sm shadow-none custom-select border-info-subtle" [(ngModel)]="draftField.config.apiToExecute">
                            <option [ngValue]="undefined">-- Base de datos interna --</option>
                            <option *ngFor="let api of apisConfiguradas" [value]="api.name">{{ api.name }}</option>
                          </select>
                          <div class="form-text text-muted" style="font-size: 0.65rem;">Selecciona el Gestor Documental (ej. Alfresco o SharePoint).</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            <div class="p-3 bg-white border-top shadow-sm mt-auto d-flex gap-2">
              <button class="btn btn-outline-secondary w-50 fw-bold shadow-sm" (click)="cancelarPropiedades()">
                <i class="bi bi-x-circle me-1"></i>Cancelar
              </button>
              <button class="btn btn-primary-premium w-50 fw-bold shadow-sm" (click)="guardarPropiedades()">
                <i class="bi bi-save me-1"></i>Guardar
              </button>
              </div>
            </div>
          </div>

          <!-- PROPIEDADES SECCION -->
          <div class="card border-0 shadow-sm card-premium h-100 d-flex flex-column" *ngIf="activeSection && draftSection">
            <div class="card-header bg-white text-dark shadow-xs py-3 border-0">
              <h5 class="offcanvas-title fw-bold d-flex align-items-center gap-2 mb-0" style="font-size: 1rem;"><i class="bi bi-layout-split"></i>Propiedades Sección</h5>
              <button type="button" class="btn-close" (click)="cancelarPropiedades()" aria-label="Close"></button>
            </div>
            <div class="card-body p-0 d-flex flex-column" style="background-color: #f8fafc;">
              <div class="card-body p-2 flex-grow-1 overflow-auto">
                <div class="accordion" id="propiedadesSeccionAccordion">
                  
                  <!-- GENERAL -->
                  <div class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                    <h2 class="accordion-header" id="headingSecGeneral">
                      <button class="accordion-button rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSecGeneral" aria-expanded="true" aria-controls="collapseSecGeneral">
                        <i class="bi bi-info-circle text-primary me-2"></i>General
                      </button>
                    </h2>
                    <div id="collapseSecGeneral" class="accordion-collapse collapse show" aria-labelledby="headingSecGeneral" data-bs-parent="#propiedadesSeccionAccordion">
                      <div class="accordion-body bg-white border border-top-0 rounded-bottom-3 p-3">
                        <div class="mb-3">
                          <label class="form-label small fw-bold mb-1">Título de la Sección</label>
                          <input type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="draftSection.title">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- REGLAS -->
                  <div class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                    <h2 class="accordion-header" id="headingSecReglas">
                      <button class="accordion-button rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSecReglas" aria-expanded="true" aria-controls="collapseSecReglas">
                        <i class="bi bi-shield-check text-success me-2"></i>Reglas de Visibilidad
                      </button>
                    </h2>
                    <div id="collapseSecReglas" class="accordion-collapse collapse show" aria-labelledby="headingSecReglas" data-bs-parent="#propiedadesSeccionAccordion">
                      <div class="accordion-body bg-white border border-top-0 rounded-bottom-3 p-3">
                        <div class="mb-0">
                          <label class="form-label small fw-bold mb-1">Mostrar solo si (Opcional)</label>
                          <input type="text" class="form-control form-control-sm shadow-none custom-input font-monospace text-primary" placeholder="ej: requiere_codeudor === true" [(ngModel)]="draftSection.visibleIf">
                          <div class="form-text text-muted" style="font-size: 0.65rem;">Expresión lógica en JavaScript basada en las variables del modelo. Si se deja vacío, siempre se mostrará.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PIE DE PROPIEDADES -->
              <div class="card-footer bg-white border-top border-primary-subtle py-3 px-4 d-flex gap-2">
                <button class="btn btn-outline-secondary w-50 fw-bold shadow-sm" (click)="cancelarPropiedades()">
                  <i class="bi bi-x-circle me-1"></i>Cancelar
                </button>
                <button class="btn btn-primary-premium w-50 fw-bold shadow-sm" (click)="guardarPropiedades()">
                  <i class="bi bi-save me-1"></i>Guardar
                </button>
              </div>
            </div>
          </div>
          
          <!-- PROPIEDADES PESTAÑA -->
          <div class="card border-0 shadow-sm card-premium h-100 d-flex flex-column" *ngIf="activeTabObj && draftTab">
            <div class="card-header bg-white text-dark shadow-xs py-3 border-0">
              <h5 class="offcanvas-title fw-bold d-flex align-items-center gap-2 mb-0" style="font-size: 1rem;"><i class="bi bi-folder-fill"></i>Propiedades Pestaña</h5>
              <button type="button" class="btn-close" (click)="cancelarPropiedades()" aria-label="Close"></button>
            </div>
            <div class="card-body p-0 d-flex flex-column" style="background-color: #f8fafc;">
              <div class="card-body p-2 flex-grow-1 overflow-auto">
                <div class="accordion" id="propiedadesTabAccordion">
                  
                  <!-- GENERAL -->
                  <div class="accordion-item border-0 mb-2 shadow-xs bg-transparent">
                    <h2 class="accordion-header" id="headingTabGeneral">
                      <button class="accordion-button rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTabGeneral" aria-expanded="true" aria-controls="collapseTabGeneral">
                        <i class="bi bi-info-circle text-primary me-2"></i>General
                      </button>
                    </h2>
                    <div id="collapseTabGeneral" class="accordion-collapse collapse show" aria-labelledby="headingTabGeneral" data-bs-parent="#propiedadesTabAccordion">
                      <div class="accordion-body bg-white border border-top-0 rounded-bottom-3 p-3">
                        <div class="mb-3">
                          <label class="form-label small fw-bold mb-1">Título de la Pestaña</label>
                          <input type="text" class="form-control form-control-sm shadow-none custom-input" [(ngModel)]="draftTab.title">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- REGLAS DE VISUALIZACIÓN / EDICIÓN -->
                  <div class="accordion-item border-0 shadow-xs bg-transparent">
                    <h2 class="accordion-header" id="headingTabReglas">
                      <button class="accordion-button collapsed rounded-3 py-2 px-3 fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTabReglas" aria-expanded="false" aria-controls="collapseTabReglas">
                        <i class="bi bi-sliders text-warning me-2"></i>Reglas de Estado
                      </button>
                    </h2>
                    <div id="collapseTabReglas" class="accordion-collapse collapse" aria-labelledby="headingTabReglas" data-bs-parent="#propiedadesTabAccordion">
                      <div class="accordion-body bg-white border border-top-0 rounded-bottom-3 p-3">
                        <div class="mb-3">
                          <label class="form-label small fw-bold mb-1">Visibilidad de la Pestaña</label>
                          <select class="form-select form-select-sm shadow-none custom-input mb-1" [(ngModel)]="draftTab.visibility">
                            <option [ngValue]="undefined">Visible (Por Defecto)</option>
                            <option value="hidden">Oculto</option>
                            <option value="expression">Por Expresión...</option>
                          </select>
                          <input *ngIf="draftTab.visibility === 'expression'" type="text" class="form-control form-control-sm font-monospace text-primary custom-input" [(ngModel)]="draftTab.visibilityCondition" placeholder="Ej: estado === 'APROBADO'">
                        </div>
                        <div class="mb-3">
                          <label class="form-label small fw-bold mb-1">Modo Edición</label>
                          <select class="form-select form-select-sm shadow-none custom-input mb-1" [(ngModel)]="draftTab.editability">
                            <option [ngValue]="undefined">Editable (Por Defecto)</option>
                            <option value="readonly">Solo Lectura</option>
                            <option value="expression">Por Expresión...</option>
                          </select>
                          <input *ngIf="draftTab.editability === 'expression'" type="text" class="form-control form-control-sm font-monospace text-success custom-input" [(ngModel)]="draftTab.editabilityCondition" placeholder="Ej: rol === 'ADMIN'">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PIE DE PROPIEDADES -->
              <div class="card-footer bg-white border-top border-primary-subtle py-3 px-4 d-flex gap-2">
                <button class="btn btn-outline-secondary w-50 fw-bold shadow-sm" (click)="cancelarPropiedades()">
                  <i class="bi bi-x-circle me-1"></i>Cancelar
                </button>
                <button class="btn btn-primary-premium w-50 fw-bold shadow-sm" (click)="guardarPropiedades()">
                  <i class="bi bi-save me-1"></i>Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    

    <!-- =============================================================================
         SIMULACIÓN COMPLETA DE FORMULARIO (MODO EJECUCIÓN REAL)
         ============================================================================= -->
    <div *ngIf="mostrarPreview" class="sim-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,15,40,0.72);backdrop-filter:blur(6px);z-index:1050;overflow-y:auto;display:flex;align-items:flex-start;justify-content:center;padding:24px 0;">
      <div style="width:100%;max-width:1100px;">

        <!-- BARRA SUPERIOR SIMULACION -->
        <div class="d-flex justify-content-between align-items-center mb-3 px-2">
          <div class="d-flex align-items-center gap-3">
            <span class="badge rounded-pill px-3 py-2" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);font-size:0.8rem;">
              <i class="bi bi-play-circle-fill me-1"></i>MODO SIMULACIÓN
            </span>
            <span class="text-white-50 small">Formulario: <strong class="text-white">{{ currentScreen.name }}</strong></span>
            <span *ngIf="simLoadingData" class="spinner-border spinner-border-sm text-white" role="status"></span>
          </div>
          <button class="btn btn-sm btn-outline-light rounded-pill px-3" (click)="mostrarPreview = false">
            <i class="bi bi-x-lg me-1"></i>Cerrar Simulación
          </button>
        </div>

        <!-- NOTIFICACION FLASH -->
        <div *ngIf="simNotification" class="alert border-0 shadow mb-3 rounded-3 d-flex align-items-center gap-2"
             [ngClass]="simNotificationType === 'success' ? 'alert-success' : simNotificationType === 'warning' ? 'alert-warning' : 'alert-info'">
          <i class="bi fs-5" [ngClass]="simNotificationType === 'success' ? 'bi-check-circle-fill text-success' : simNotificationType === 'warning' ? 'bi-exclamation-triangle-fill text-warning' : 'bi-info-circle-fill text-info'"></i>
          <span class="fw-semibold">{{ simNotification }}</span>
        </div>

        <div class="row g-3">

          <!-- PANEL PRINCIPAL DEL FORMULARIO -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
              <!-- CABECERA DEL FORMULARIO -->
              <div class="card-header py-3 px-4 d-flex justify-content-between align-items-center" style="background:linear-gradient(135deg,#1e1b4b,#312e81);">
                <div>
                  <h5 class="mb-0 text-white fw-bold d-flex align-items-center gap-2">
                    <i class="bi bi-clipboard-check"></i>{{ currentScreen.name }}
                  </h5>
                  <small class="text-white-50">Proceso: <span class="text-white">{{ selectedProcessKey }}</span></small>
                </div>
                <div class="d-flex gap-2">
                  <span *ngFor="let tab of layout.tabs; let ti = index"
                        class="badge cursor-pointer px-3 py-2"
                        [style.background]="previewTabIdx === ti ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'"
                        [style.border]="previewTabIdx === ti ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.12)'"
                        [style.color]="'white'"
                        [style.cursor]="'pointer'"
                        (click)="previewTabIdx = ti">{{ tab.title }}</span>
                </div>
              </div>

              <!-- CUERPO DEL FORMULARIO -->
              <div class="card-body p-4" style="background:#fafbff;">
                <div *ngIf="layout.tabs.length > 0 && layout.tabs[previewTabIdx]">
                  <ng-container *ngFor="let section of layout.tabs[previewTabIdx].sections">
                    <div *ngIf="previewVisible(section)" class="mb-4">
                      <div class="d-flex align-items-center gap-2 mb-3">
                        <div style="width:4px;height:20px;border-radius:2px;background:linear-gradient(135deg,#4f46e5,#7c3aed);"></div>
                        <h6 class="mb-0 fw-bold text-dark">{{ section.title }}</h6>
                      </div>
                      <div class="row g-3 ps-1">
                      <ng-container *ngFor="let field of section.fields">
                        <div *ngIf="previewVisible(field)" [class]="'col-md-' + (field.cols || 6)">

                          <!-- LABEL -->
                          <div *ngIf="field.controlType === 'LABEL'"
                               class="p-3 rounded-3 border-start border-4 border-warning bg-warning-subtle text-warning-emphasis d-flex align-items-center gap-2"
                               style="font-size:0.85rem;">
                            <i class="bi bi-info-circle-fill"></i>{{ field.label }}
                          </div>

                          <!-- BUTTON -->
                          <div *ngIf="field.controlType === 'BUTTON'" class="pt-4">
                            <button type="button" class="btn w-100 py-2 fw-semibold shadow-sm"
                                    [ngClass]="field.config?.buttonStyle || 'btn-primary'"
                                    (click)="simButtonAction(field)">
                              <i class="bi bi-play-circle me-2"></i>{{ field.label || 'Acción' }}
                            </button>
                          </div>

                          <!-- OTROS CONTROLES -->
                          <div *ngIf="field.controlType !== 'LABEL' && field.controlType !== 'BUTTON'">
                            <label class="form-label fw-semibold text-dark mb-1" style="font-size:0.85rem;">
                              {{ field.label }}
                              <span class="text-danger" *ngIf="field.required">*</span>
                              <span class="badge bg-light text-muted ms-1 border" style="font-size:0.6rem;font-weight:400;">{{ field.controlType }}</span>
                            </label>

                            <!-- TEXTBOX -->
                            <input *ngIf="field.controlType === 'TEXTBOX'"
                                   type="text"
                                   [(ngModel)]="previewModel[field.name]"
                                   [disabled]="isFieldDisabled(field)"
                                   [placeholder]="field.defaultValue || 'Ingresa ' + field.label"
                                   class="form-control shadow-none"
                                   [class.border-danger]="field.required && !previewModel[field.name]"
                                   style="border-radius:10px;">

                            <!-- TEXTAREA -->
                            <textarea *ngIf="field.controlType === 'TEXTAREA'"
                                      [(ngModel)]="previewModel[field.name]"
                                      [disabled]="isFieldDisabled(field)"
                                      [placeholder]="field.defaultValue || 'Ingresa ' + field.label"
                                      class="form-control shadow-none"
                                      rows="3"
                                      [class.border-danger]="field.required && !previewModel[field.name]"
                                      style="border-radius:10px;"></textarea>

                            <!-- NUMBER -->
                            <div *ngIf="field.controlType === 'NUMBER'" class="input-group">
                              <input type="number"
                                     [(ngModel)]="previewModel[field.name]"
                                     [disabled]="isFieldDisabled(field)"
                                     [placeholder]="field.defaultValue || '0'"
                                     class="form-control shadow-none"
                                     [class.border-danger]="field.required && !previewModel[field.name]"
                                     style="border-radius:10px 0 0 10px;">
                              <span class="input-group-text bg-light"><i class="bi bi-hash text-muted"></i></span>
                            </div>

                            <!-- MONEY -->
                            <div *ngIf="field.controlType === 'MONEY'" class="input-group">
                              <span class="input-group-text bg-success-subtle text-success fw-bold">$</span>
                              <input type="number"
                                     [(ngModel)]="previewModel[field.name]"
                                     [disabled]="isFieldDisabled(field)"
                                     [placeholder]="field.defaultValue || '0.00'"
                                     class="form-control shadow-none"
                                     [class.border-danger]="field.required && !previewModel[field.name]"
                                     style="border-radius:0 10px 10px 0;">
                            </div>

                            <!-- DATE -->
                            <input *ngIf="field.controlType === 'DATE'"
                                   type="date"
                                   [(ngModel)]="previewModel[field.name]"
                                   [disabled]="isFieldDisabled(field)"
                                   class="form-control shadow-none"
                                   [class.border-danger]="field.required && !previewModel[field.name]"
                                   style="border-radius:10px;">

                            <!-- YESNO -->
                            <div *ngIf="field.controlType === 'YESNO'" class="form-check form-switch mt-2">
                              <input class="form-check-input" type="checkbox"
                                     [(ngModel)]="previewModel[field.name]"
                                     [disabled]="isFieldDisabled(field)"
                                     style="width:2.5em;height:1.3em;">
                              <label class="form-check-label text-muted ms-2">{{ previewModel[field.name] ? 'Sí' : 'No' }}</label>
                            </div>

                            <!-- COMBO con datos reales -->
                            <select *ngIf="field.controlType === 'COMBO'"
                                    [(ngModel)]="previewModel[field.name]"
                                    (change)="onSimComboChange(field)"
                                    [disabled]="isFieldDisabled(field)"
                                    class="form-select shadow-none"
                                    [class.border-danger]="field.required && !previewModel[field.name]"
                                    style="border-radius:10px;">
                              <option value="">-- Seleccionar {{ field.label }} --</option>
                              <ng-container *ngIf="getSimOptions(field.name).length > 0">
                                <option *ngFor="let opt of getSimOptions(field.name)"
                                        [value]="opt[field.config?.valueField || 'codigo'] || opt.codigo || opt.id || opt.code">
                                  {{ opt[field.config?.displayField || 'descripcion'] || opt.descripcion || opt.nombre || opt.name || opt.label }}
                                </option>
                              </ng-container>
                              <ng-container *ngIf="getSimOptions(field.name).length === 0">
                                <option disabled>Cargando opciones...</option>
                              </ng-container>
                            </select>

                            <!-- FILEUPLOAD -->
                            <div *ngIf="field.controlType === 'FILEUPLOAD'"
                                 class="border rounded-3 p-3 text-center"
                                 style="border-style:dashed !important;border-color:#6366f1 !important;background:#f5f3ff;">
                              <i class="bi bi-cloud-arrow-up-fill fs-2 text-indigo mb-2 d-block"></i>
                              <span class="d-block text-muted small mb-2">Archivo para: <strong>{{ field.label }}</strong></span>
                              <button type="button" class="btn btn-sm btn-outline-primary rounded-pill" (click)="uploadMock(field.name)">
                                <i class="bi bi-upload me-1"></i>Seleccionar Archivo
                              </button>
                              <div *ngIf="uploadedMockFiles[field.name]" class="mt-2 text-success small fw-semibold">
                                <i class="bi bi-check-circle-fill me-1"></i>{{ uploadedMockFiles[field.name] }}
                              </div>
                            </div>

                            <!-- IMAGE -->
                            <div *ngIf="field.controlType === 'IMAGE'" class="border rounded-3 p-3 text-center bg-light">
                              <i class="bi bi-image text-muted fs-2 mb-1 d-block"></i>
                              <span class="text-muted small">{{ field.label }}</span>
                            </div>

                            <!-- GRID con columnas reales -->
                            <div *ngIf="field.controlType === 'GRID'" class="border rounded-3 overflow-hidden">
                              <div class="d-flex justify-content-between align-items-center p-2 border-bottom" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);">
                                <span class="small fw-bold text-white"><i class="bi bi-table me-1"></i>{{ field.label }}</span>
                                <button type="button" class="btn btn-sm btn-light py-1 px-2 fw-semibold" style="font-size:0.75rem;" (click)="openGridModal(field)">
                                  <i class="bi bi-plus-lg me-1"></i>+ Agregar
                                </button>
                              </div>
                              <table class="table table-sm table-hover mb-0" style="font-size:0.8rem;">
                                <thead class="table-light text-muted small text-uppercase">
                                  <tr>
                                    <ng-container *ngIf="getGridColumns(field).length > 0; else simGenericCols">
                                      <th *ngFor="let col of getGridColumns(field)">{{ col.label || col.name }}</th>
                                    </ng-container>
                                    <ng-template #simGenericCols>
                                      <th>Campo 1</th><th>Campo 2</th><th>Campo 3</th>
                                    </ng-template>
                                    <th class="text-center" style="width:50px;"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr *ngFor="let row of getGridRows(field.name); let ri = index">
                                    <td *ngFor="let col of getGridColumns(field)">
                                      <ng-container *ngIf="col.type === 'RADIO' || col.type === 'radio'">
                                        <div class="form-check d-flex justify-content-center m-0 p-0">
                                          <input class="form-check-input" type="radio" [name]="field.name + '_radio'" [value]="ri" [(ngModel)]="previewModel[field.name + '_seleccion']">
                                        </div>
                                      </ng-container>
                                      <ng-container *ngIf="col.type === 'CHECKBOX' || col.type === 'checkbox'">
                                        <div class="form-check d-flex justify-content-center m-0 p-0">
                                          <input class="form-check-input" type="checkbox" [(ngModel)]="row[col.name]">
                                        </div>
                                      </ng-container>
                                      <ng-container *ngIf="col.type === 'BOOLEAN' || col.type === 'boolean'">
                                        <div class="form-check d-flex justify-content-center m-0 p-0">
                                          <input class="form-check-input" type="checkbox" [(ngModel)]="row[col.name]" [disabled]="true">
                                        </div>
                                      </ng-container>
                                      <ng-container *ngIf="col.type !== 'RADIO' && col.type !== 'radio' && col.type !== 'CHECKBOX' && col.type !== 'checkbox' && col.type !== 'BOOLEAN' && col.type !== 'boolean'">
                                        {{ getSimGridDisplayValue(col, row[col.name]) }}
                                      </ng-container>
                                    </td>
                                    <td class="text-center">
                                      <button class="btn btn-sm btn-link text-danger p-0" (click)="removeGridRow(field.name, ri)"><i class="bi bi-trash3-fill"></i></button>
                                    </td>
                                  </tr>
                                  <tr *ngIf="getGridRows(field.name).length === 0">
                                    <td [attr.colspan]="getGridColumns(field).length + 1" class="text-center text-muted py-3 small">
                                      <i class="bi bi-inbox d-block mb-1"></i>Sin registros — haz clic en "+ Agregar"
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <!-- Error requerido -->
                            <div *ngIf="field.required && !previewModel[field.name] && simSubmitted"
                                 class="text-danger small mt-1">
                              <i class="bi bi-exclamation-circle me-1"></i>{{ field.label }} es obligatorio
                            </div>
                      </div>
                    </div>
                  </ng-container>
                </div>

                <!-- SIN DISEÑO -->
                <div *ngIf="layout.tabs.length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-plus-square fs-1 d-block mb-3"></i>
                  <h6>No hay controles diseñados</h6>
                  <p class="small">Agrega pestañas y campos al lienzo de diseño primero.</p>
                </div>
              </div>

              <!-- PIE DEL FORMULARIO -->
              <div class="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                <button class="btn btn-outline-secondary rounded-pill px-4" (click)="simReset()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Limpiar
                </button>
                <button class="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" (click)="simSubmit()">
                  <i class="bi bi-check-circle me-2"></i>Simular Envío
                </button>
              </div>
          <!-- PANEL LATERAL: INSPECTOR EN TIEMPO REAL -->
          <div class="col-lg-4">

            <!-- Variables en vivo -->
            <div class="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
              <div class="card-header py-2 px-3 d-flex align-items-center gap-2"
                   style="background:linear-gradient(135deg,#0f172a,#1e293b);">
                <i class="bi bi-braces text-cyan" style="color:#38bdf8;"></i>
                <span class="text-white fw-bold small">Inspector de Variables</span>
                <span class="badge rounded-pill ms-auto" style="background:#38bdf8;color:#0f172a;">VIVO</span>
              </div>
              <div class="card-body p-0" style="background:#0f172a;max-height:260px;overflow-y:auto;">
                <pre class="mb-0 p-3" style="color:#7dd3fc;font-size:0.72rem;font-family:'Courier New',monospace;white-space:pre-wrap;">{{ getPreviewModelJson() }}</pre>
              </div>
            </div>

            <!-- Reglas de visibilidad activas -->
            <div class="card border-0 shadow-sm rounded-4 mb-3">
              <div class="card-header py-2 px-3 d-flex align-items-center gap-2 bg-white border-bottom">
                <i class="bi bi-eye text-indigo"></i>
                <span class="fw-bold small">Visibilidad de Campos</span>
              </div>
              <div class="card-body p-2" style="max-height:200px;overflow-y:auto;">
                <ng-container *ngFor="let tab of layout.tabs">
                  <ng-container *ngFor="let sec of tab.sections">
                    <ng-container *ngFor="let f of sec.fields">
                      <div class="d-flex justify-content-between align-items-center py-1 px-2 rounded mb-1"
                           [style.background]="previewVisible(f) ? '#f0fdf4' : '#fff7ed'">
                        <span class="small text-truncate" style="max-width:160px;" [title]="f.name">{{ f.label || f.name }}</span>
                        <span class="badge rounded-pill" [class.bg-success]="previewVisible(f)" [class.bg-warning]="!previewVisible(f)">
                          {{ previewVisible(f) ? 'Visible' : 'Oculto' }}
                        </span>
                      </div>
                    </ng-container>
                  </ng-container>
                </ng-container>
              </div>
            </div>

            <!-- Campos requeridos faltantes -->
            <div class="card border-0 shadow-sm rounded-4 mb-3">
              <div class="card-header py-2 px-3 d-flex align-items-center gap-2 bg-white border-bottom">
                <i class="bi bi-shield-exclamation text-warning"></i>
                <span class="fw-bold small">Validación</span>
              </div>
              <div class="card-body p-2">
                <ng-container *ngFor="let err of simGetValidationErrors()">
                  <div class="d-flex align-items-center gap-2 py-1 px-2 rounded mb-1 bg-danger-subtle">
                    <i class="bi bi-exclamation-circle-fill text-danger small"></i>
                    <span class="small text-danger">{{ err }}</span>
                  </div>
                </ng-container>
                <div *ngIf="simGetValidationErrors().length === 0" class="text-success small d-flex align-items-center gap-2 py-2 px-2">
                  <i class="bi bi-check-circle-fill"></i>Formulario válido
                </div>
              </div>
            </div>

            <!-- Información del layout -->
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-header py-2 px-3 d-flex align-items-center gap-2 bg-white border-bottom">
                <i class="bi bi-info-circle text-indigo"></i>
                <span class="fw-bold small">Info del Diseño</span>
              </div>
              <div class="card-body p-3">
                <div class="row g-2 text-center">
                  <div class="col-6">
                    <div class="p-2 rounded-3 bg-indigo-soft">
                      <div class="fw-bold text-indigo" style="font-size:1.4rem;">{{ layout.tabs.length }}</div>
                      <div class="text-muted" style="font-size:0.7rem;">Pestañas</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="p-2 rounded-3 bg-indigo-soft">
                      <div class="fw-bold text-indigo" style="font-size:1.4rem;">{{ simTotalFields() }}</div>
                      <div class="text-muted" style="font-size:0.7rem;">Controles</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          
        
      

      <!-- MODAL AGREGAR FILA GRID (Nivel Raíz de Simulación) -->
      <div *ngIf="gridModalField" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.55);" (click)="closeGridModal()">
        <div class="modal-dialog modal-dialog-centered modal-xl" (click)="$event.stopPropagation()">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header py-3 bg-light border-bottom">
              <h6 class="modal-title text-muted fw-bold">Agregar registro</h6>
              <button class="btn-close" (click)="closeGridModal()"></button>
            </div>
            <div class="modal-body p-4 bg-white">
                <div class="row g-3 align-items-center">
                  <div class="col d-flex align-items-center gap-2" *ngFor="let col of getGridColumns(gridModalField)">
                    <label class="form-label small fw-bold text-muted mb-0 text-nowrap" style="font-size: 0.75rem;">
                      <span class="text-danger me-1">*</span>{{ col.label || col.name }}
                    </label>
                    <div class="flex-grow-1">
                <input *ngIf="getColInputType(col) !== 'date' && getColInputType(col) !== 'boolean' && getColInputType(col) !== 'combo'"
                       [type]="getColInputType(col)"
                       class="form-control bg-light"
                       [(ngModel)]="gridNewRow[col.name]"
                       [placeholder]="'Ingresa ' + (col.label || col.name)">
                <input *ngIf="getColInputType(col) === 'date'"
                       type="date" class="form-control bg-light"
                       [(ngModel)]="gridNewRow[col.name]">
                <div *ngIf="getColInputType(col) === 'boolean'" class="form-check form-switch mt-1">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="gridNewRow[col.name]">
                  <label class="form-check-label text-muted small">{{ gridNewRow[col.name] ? 'Sí' : 'No' }}</label>
                </div>
                <select *ngIf="getColInputType(col) === 'combo'"
                        class="form-select bg-light"
                        [(ngModel)]="gridNewRow[col.name]">
                  <option value="">-- Seleccionar {{ col.label || col.name }} --</option>
                  <option *ngFor="let opt of getSimOptions(col.name)"
                          [value]="opt.codigo || opt.id || opt.code">
                    {{ col.displayField && opt[col.displayField] !== undefined ? opt[col.displayField] : (opt.descripcion || opt.nombre || opt.label) }}
                  </option>
                </select>
                    </div>
                  </div>
                </div>
                <div *ngIf="getGridColumns(gridModalField).length === 0" class="text-muted text-center small py-2">
                Cargando columnas...
              </div>
            </div>
            <div class="modal-footer border-0">
              <button class="btn btn-outline-secondary px-4 fw-semibold me-2" style="border-radius: 4px;" (click)="closeGridModal()">Cancelar</button>
              <button class="btn px-4 fw-semibold text-white" style="background-color: #0f172a; border-radius: 4px;" (click)="confirmGridRow(gridModalField)" [disabled]="getGridColumns(gridModalField).length === 0">Aceptar</button>
            </div>
          </div>
        </div>
      </div>
  `,
  styles: [`
    /* Design Tokens Integration & Premium Styles */
    :host {
      --primary-color: #e30613;
      --primary-hover: #b30000;
      --indigo-gradient: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      --glass-bg: rgba(255, 255, 255, 0.08);
      --glass-border: rgba(255, 255, 255, 0.15);
    }

    .premium-container {
      background-color: #f8fafc;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .header-gradient {
      background: var(--indigo-gradient);
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: .85; transform: scale(1.03); }
    }

    .btn-primary-premium {
      background: #ffffff;
      color: #e30613;
      border: none;
      border-radius: 12px;
      transition: all 0.25s ease;
    }
    .btn-primary-premium:hover {
      background: #f1f5f9;
      color: #b30000;
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    }

    .btn-glass {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      color: white;
      backdrop-filter: blur(10px);
      transition: all 0.25s ease;
      border-radius: 12px;
    }
    .btn-glass:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .card-premium {
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      background: white;
    }

    .sidebar-tab {
      color: #64748b;
      border-radius: 8px !important;
      transition: all 0.2s ease;
    }
    .sidebar-tab.active {
      background: var(--indigo-gradient) !important;
      color: white !important;
      box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
    }

    .custom-select, .custom-input {
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      padding: 0.5rem 0.75rem;
      transition: all 0.2s ease;
    }
    .custom-select:focus, .custom-input:focus {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .list-custom::-webkit-scrollbar {
      width: 6px;
    }
    .list-custom::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .item-screen {
      transition: all 0.2s ease;
    }
    .item-screen:hover {
      background-color: #f1f5f9;
    }
    .active-screen {
      background-color: #f8d7da !important;
      color: #b30000 !important;
      border-left: 4px solid #e30613 !important;
    }

    .btn-delete-item {
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .btn-delete-item:hover {
      opacity: 1;
    }

    .entity-header {
      transition: color 0.2s;
    }
    .entity-header:hover {
      color: #4f46e5;
    }

    .hover-scale {
      transition: transform 0.15s ease;
    }
    .hover-scale:hover {
      transform: scale(1.15);
    }

    .btn-control {
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: white;
      transition: all 0.2s ease;
    }
    .btn-control:hover {
      border-color: #818cf8;
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .lbl-ctrl {
      font-size: 0.7rem;
      font-weight: 600;
      color: #475569;
    }

    .custom-tabs .nav-link {
      border: none;
      color: #64748b;
      font-weight: bold;
      border-radius: 10px 10px 0 0;
      transition: all 0.25s ease;
    }
    .custom-tabs .nav-link.active {
      color: #4f46e5 !important;
      border-bottom: 3px solid #4f46e5;
      background: transparent;
    }

    .section-card {
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .section-title-input {
      background-color: transparent;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    .section-title-input:hover {
      background-color: #f1f5f9;
    }
    .section-title-input:focus {
      background-color: white;
      border: 1px solid #cbd5e1 !important;
    }

    .field-card {
      border-style: dashed !important;
      border-width: 1.5px !important;
      border-color: #cbd5e1 !important;
      transition: all 0.2s ease;
    }
    .field-card:hover {
      border-color: #818cf8 !important;
      background-color: #fafbfd !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .active-card {
      border-color: #4f46e5 !important;
      border-style: solid !important;
      border-width: 2px !important;
      background-color: #f5f7ff !important;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.08);
    }

    .field-toolbar {
      position: absolute;
      top: -32px;
      left: 10px;
      z-index: 100;
    }

    .grip-handle {
      opacity: 0.3;
      transition: opacity 0.15s ease;
    }
    .field-card:hover .grip-handle {
      opacity: 1;
    }
    .grip-handle:hover i {
      color: #4f46e5 !important;
    }
    .dragging-card {
      opacity: 0.35 !important;
      transform: scale(0.97);
      border-style: dashed !important;
      border-color: #4f46e5 !important;
      box-shadow: none !important;
    }
    [draggable="true"] {
      user-select: none;
    }
    [draggable="true"]:active .field-card {
      cursor: grabbing;
      border-color: #6366f1 !important;
    }
    .grip-handle:active {
      cursor: grabbing !important;
    }

    .btn-xxs {
      padding: 0.15rem 0.35rem;
      font-size: 0.65rem;
      font-weight: bold;
      border-radius: 4px;
    }

    .badge-indigo {
      background-color: #e0e7ff;
      color: #3730a3;
    }
    .badge-indigo-soft {
      background-color: #e0e7ff;
      color: #4f46e5;
    }
    .badge-emerald {
      background-color: #d1fae5;
      color: #065f46;
    }

    .font-small-tab {
      font-size: 0.85rem;
    }

    .btn-indigo {
      background: var(--indigo-gradient);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      transition: all 0.25s ease;
    }
    .btn-indigo:hover {
      background: var(--primary-hover);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    .custom-tabs-preview .nav-link {
      border: none;
      color: #64748b;
      border-radius: 12px;
      transition: all 0.2s;
    }
    .custom-tabs-preview .nav-link.active {
      background: var(--indigo-gradient) !important;
      color: white !important;
      box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
    }

    .text-indigo {
      color: #4f46e5;
    }
    .text-purple {
      color: #7c3aed;
    }
    .text-emerald {
      color: #059669;
    }
    .text-rose {
      color: #e11d48;
    }

    .tab-close-btn {
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    .tab-close-btn:hover {
      opacity: 1;
    }

    .fade-in {
      animation: fadeIn 0.25s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hover-row {
      transition: background-color 0.12s;
    }
    .hover-row:hover {
      background-color: #f0f4ff !important;
    }

    .btn-outline-indigo {
      border: 1px solid #818cf8;
      color: #4f46e5;
      background: white;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .btn-outline-indigo:hover {
      background: #e0e7ff;
      color: #3730a3;
    }

    .bg-indigo-soft {
      background-color: #e0e7ff !important;
    }

    .form-control-xs {
      padding: 0;
      height: auto;
      font-size: 0.78rem;
    }
  `]
})
export class DisenadorPantallasComponent implements OnInit, DoCheck, OnDestroy {
  private readonly _emptyArray: any[] = [];

  private differs = inject(KeyValueDiffers);
  private modelDiffer: any;
  dynamicFieldStates: { [key: string]: any } = {};

  ngDoCheck() {
    if (!this.modelDiffer) {
      this.modelDiffer = this.differs.find(this.previewModel).create();
    }
    const changes = this.modelDiffer.diff(this.previewModel);
    if (changes) {
      this.evaluateActions();
    }
  }

  evaluateActions() {
    if (!this.layout || !this.layout.actions || this.layout.actions.length === 0) return;
    this.dynamicFieldStates = {};
    this.layout.actions.forEach((act: any) => {
      if (!act.condition) return;
      let isTrue = false;
      try {
        const check = new Function('data', 'with(data) { return ' + act.condition + '; }');
        isTrue = !!check(this.previewModel);
      } catch (e) { isTrue = false; }
      const effects = isTrue ? act.thenEffects : act.elseEffects;
      if (effects && Array.isArray(effects)) {
        effects.forEach((eff: any) => {
          if (!eff.target) return;
          if (!this.dynamicFieldStates[eff.target]) this.dynamicFieldStates[eff.target] = {};
          if (eff.type === 'visibility') this.dynamicFieldStates[eff.target].visibility = eff.value;
          else if (eff.type === 'requirement') this.dynamicFieldStates[eff.target].requirement = eff.value;
          else if (eff.type === 'editability') this.dynamicFieldStates[eff.target].editability = eff.value;
          else if (eff.type === 'setValue' && this.previewModel[eff.target] != eff.value) this.previewModel[eff.target] = eff.value;
        });
      }
    });
  }
  private screenService = inject(ScreenService);
  private processService = inject(ProcessService);
  private metaService = inject(MetaService);
  private parametricService = inject(ParametricService);
  private apiManagerService = inject(ApiManagerService);
  private documentService = inject(DocumentService);
  private cdr = inject(ChangeDetectorRef);
  
  apisConfiguradas: ApiDefinition[] = [];
  documentDefinitions: DocumentDefinition[] = [];

  processes: ProcessDefinition[] = [];
  processesLoading = false;
  processesError = false;
  selectedProcessKey: string = '';
  userTasks: { id: string, name: string }[] = [];
  selectedTaskKey: string = '';
  availableAttributes: MetaAttribute[] = [];
  entities: MetaEntity[] = [];
  parametricTables: any[] = [];
  savedScreens: ScreenDefinition[]= [];
  
  // Bizagi Navigation Tabs for left sidebar
  activeSidebarTab: string = 'data';

  // System Entities fields exploration map
  expandedEntities: { [id: number]: boolean } = {};
  entityAttributesMap: { [id: number]: MetaAttribute[] } = {};
  expandedParamTables: { [id: number]: boolean } = {};

  // GRID columns cache: entityId -> MetaAttribute[]
  gridColumnsMap: { [entityId: number]: MetaAttribute[] } = {};
  gridColumnsLoading = false;
  // Physical DB columns cache (primary source): entityId -> column definitions
  physicalColumnsMap: { [entityId: number]: {name: string; type: string; label?: string; parametricTableId?: number}[] } = {};
  // GRID simulation state
  gridModalField: any = null;
  gridNewRow: any = {};
  gridRowsMap: { [fieldName: string]: any[] } = {};

  // Drag & Drop state
  dragSectionIdx: number = -1;
  dragFieldIdx: number = -1;
  dragOverSectionIdx: number = -1;
  dragOverFieldIdx: number = -1;
  dragHoverId: string | null = null;

  currentScreen: ScreenDefinition = { name: 'Pantalla Nueva', processKey: '', layoutJson: '', isDefault: true };
  layout: any = { tabs: [], validations: [], actions: [] };
  activeTabIdx = 0;
  activeField: any = null;
  draftField: any = null;
  activeSection: any = null;
  draftSection: any = null;
  activeTabObj: any = null;
  draftTab: any = null;

  // --- PREVIEW / SIMULATION VARIABLES ---
  mostrarPreview = false;
  previewTabIdx = 0;
  previewModel: any = {};
  uploadedMockFiles: { [key: string]: string } = {};
  mockGridData: { [key: string]: any[] } = {};

  // Simulation-specific
  simOptions: { [fieldName: string]: any[] } = {};
  simLoadingData = false;
  simNotification: string = '';
  simNotificationType: 'success' | 'warning' | 'info' = 'info';
  simSubmitted = false;
  private simNotifTimer: any = null;

  private _lastLayoutStr = '';
  private _cachedLayoutFields: any[] = [];

  getAllLayoutFields(): any[] {
    const currentStr = JSON.stringify(this.layout?.tabs?.map((t:any) => t.sections?.map((s:any) => s.fields?.length)));
    if (this._lastLayoutStr !== currentStr) {
      this._lastLayoutStr = currentStr;
      const fields: any[] = [];
      if (this.layout && this.layout.tabs) {
        this.layout.tabs.forEach((tab: any) => {
          tab.sections.forEach((sec: any) => {
            sec.fields.forEach((f: any) => {
              if (f.name) fields.push(f);
            });
          });
        });
      }
      this._cachedLayoutFields = fields;
    }
    return this._cachedLayoutFields;
  }

  private _lastSourceStr = '';
  private _cachedSourceCols: any[] = [];

  getAvailableSourceColumns(field: any): {name: string, label: string}[] {
    if (!field || !field.config) return this._emptyArray;
    const simOpts = this.simOptions[field.name];
    const currentStr = String(field.config.dataSourceEntityId) + '_' + (field.config.options ? field.config.options.length : 0) + '_' + (simOpts ? simOpts.length : 0);
    if (this._lastSourceStr !== currentStr) {
      this._lastSourceStr = currentStr;
      const colsMap = new Map<string, string>();

      // 1. Load actual data keys if available
      if (simOpts && simOpts.length > 0) {
        Object.keys(simOpts[0]).forEach(k => colsMap.set(k, k));
      }

      // 2. Load metadata columns
      if (field.config.dataSourceEntityId) {
        const pt = this.parametricTables.find(p => p.id == field.config.dataSourceEntityId);
        if (pt && pt.columns) {
          pt.columns.forEach((c: any) => colsMap.set(c.name, c.label || c.name));
        }
      } else if (field.config.options && field.config.options.length > 0) {
        Object.keys(field.config.options[0]).forEach(k => colsMap.set(k, k));
      }

      this._cachedSourceCols = Array.from(colsMap.entries()).map(([name, label]) => ({ name, label }));
    }
    return this._cachedSourceCols;
  }

  private _emptyCascade: any[] = [];

  getCascadeRules(field: any): any[] {
    if (!field) return this._emptyCascade;
    if (!field.config) {
      field.config = {};
    }
    if (!field.config.cascadeRules) {
      field.config.cascadeRules = [];
    }
    return field.config.cascadeRules;
  }

  // Load physical table columns when a table is selected in the properties panel
  onGridTableChange(field: any, entityId: any) {
    if (!entityId) return;
    const id = Number(entityId);
    if (isNaN(id) || id <= 0) return;
    // Always normalize the stored value to a real number (not string)
    if (field && field.config) field.config.dataSourceEntityId = id;
    // Reset selectedColumns so they will be re-initialized from physical cols
    if (field && field.config) field.config.selectedColumns = [];
    // Delete stale cache so a fresh load always happens
    delete this.physicalColumnsMap[id];
    // Load physical columns
    this.gridColumnsLoading = true;
    this.loadColumnsForField(id, field, () => { this.gridColumnsLoading = false; });
  }

  // Central helper: loads columns for an entity, prefers physical table cols,
  // falls back to meta attributes when physical cols are empty or unavailable.
  private loadColumnsForField(id: number, field: any, done?: () => void) {
    this.metaService.getPhysicalTableColumns(id).subscribe({
      next: cols => {
        if (cols && cols.length > 0) {
          // Fetch meta attributes to enrich physical columns with labels and parametricTableId
          this.metaService.listarAtributos(id).subscribe({
            next: attrs => {
              const enrichedCols = cols.map(c => {
                const attr = attrs.find(a => a.name === c.name || a.name + '_id' === c.name || c.name === a.name + '_id');
                return {
                  name: c.name,
                  type: c.type,
                  label: attr ? attr.label : c.name,
                  parametricTableId: attr ? attr.parametricTableId : undefined
                };
              });
              this.physicalColumnsMap[id] = enrichedCols;
              if (field) this.initSelectedColumns(field, enrichedCols);
              if (done) done();
            },
            error: () => {
              this.physicalColumnsMap[id] = cols;
              if (field) this.initSelectedColumns(field, cols);
              if (done) done();
            }
          });
        } else {
          // Physical table exists but has no cols (or returned empty) — use meta attributes
          this.metaService.listarAtributos(id).subscribe({
            next: attrs => {
              const mapped = attrs.map(a => ({ name: a.name, type: a.type, label: a.label, parametricTableId: a.parametricTableId }));
              this.physicalColumnsMap[id] = mapped.length > 0 ? mapped : null as any;
              if (field && mapped.length > 0) this.initSelectedColumns(field, mapped);
              if (done) done();
            },
            error: () => { if (done) done(); }
          });
        }
      },
      error: () => {
        // HTTP error — use meta attributes
        this.metaService.listarAtributos(id).subscribe({
          next: attrs => {
            const mapped = attrs.map(a => ({ name: a.name, type: a.type, label: a.label, parametricTableId: a.parametricTableId }));
            this.physicalColumnsMap[id] = mapped.length > 0 ? mapped : null as any;
            if (field && mapped.length > 0) this.initSelectedColumns(field, mapped);
            if (done) done();
          },
          error: () => { if (done) done(); }
        });
      }
    });
  }

  // Initialize selectedColumns from raw physical cols (all visible by default)
  initSelectedColumns(field: any, cols: {name: string; type: string; label?: string; parametricTableId?: number}[]) {
    if (!field || !field.config) return;
    // Preserve user customizations if any column already exists
    const existing: any[] = field.config.selectedColumns || this._emptyArray;
    field.config.selectedColumns = cols.map(c => {
      const prev = existing.find((e: any) => e.name === c.name);
      return prev ? { ...prev, type: c.type, parametricTableId: c.parametricTableId } : { name: c.name, type: c.type, label: c.label || c.name, visible: true, parametricTableId: c.parametricTableId, displayField: c.parametricTableId ? 'descripcion' : undefined };
    });
  }

  // Force reload columns from server and rebuild selectedColumns
  syncGridColumns(field: any) {
    if (!field?.config?.dataSourceEntityId) return;
    const id = Number(field.config.dataSourceEntityId);
    // Clear cache to force fresh load
    delete this.physicalColumnsMap[id];
    field.config.selectedColumns = [];
    this.gridColumnsLoading = true;
    this.loadColumnsForField(id, field, () => { this.gridColumnsLoading = false; });
  }

  addVirtualColumn(field: any) {
    if (!field.config.selectedColumns) {
      field.config.selectedColumns = [];
    }
    const idx = field.config.selectedColumns.length + 1;
    field.config.selectedColumns.push({
      name: 'columna_' + idx,
      label: 'Columna ' + idx,
      type: 'string',
      visible: true
    });
    this.updateSelectedColumns(field);
  }

  deleteVirtualColumn(field: any, index: number) {
    if (field.config.selectedColumns && field.config.selectedColumns.length > index) {
      field.config.selectedColumns.splice(index, 1);
      this.updateSelectedColumns(field);
    }
  }

  // Returns the full list of available columns for the field (for the inspector panel)
  getAvailableColumnsForField(field: any): {name: string; type: string; label: string; visible: boolean; parametricTableId?: number; displayField?: string; visibilityRule?: string}[] {
    if (!field?.config) return this._emptyArray;
    const entityId = field.config.dataSourceEntityId;
    if (!entityId) return field.config.selectedColumns || this._emptyArray;
    const id = Number(entityId);
    // If selectedColumns already initialized with content, return them
    if (field.config.selectedColumns && field.config.selectedColumns.length > 0) {
      // Auto-enrich existing columns with parametricTableId from physical definitions if missing
      const cached = this.physicalColumnsMap[id];
      if (cached && cached.length > 0) {
        field.config.selectedColumns.forEach((c: any) => {
          if (c.parametricTableId === undefined) {
            const pcol = cached.find((pc: any) => pc.name === c.name);
            if (pcol && pcol.parametricTableId) {
              c.parametricTableId = pcol.parametricTableId;
            }
          }
        });
      }
      return field.config.selectedColumns;
    }
    // Check physicalColumnsMap — treat null/undefined/[] the same (trigger load)
    const cached = this.physicalColumnsMap[id];
    if (cached && cached.length > 0) {
      this.initSelectedColumns(field, cached);
      return field.config.selectedColumns || this._emptyArray;
    }
    // Not cached or cached empty — trigger a load (only if not already in progress)
    if (cached === undefined) {
      // Mark as loading (use null as sentinel so we don't make duplicate requests)
      this.physicalColumnsMap[id] = null as any;
      this.loadColumnsForField(id, field);
    }
    return this._emptyArray;
  }

  // Gets the columns available in a parametric table or entity for the display field dropdown
  getParametricColumnsForDisplay(parametricTableId: number | undefined): any[] {
    if (!parametricTableId) return this._emptyArray;
    
    if (this.parametricTables) {
      const pt = this.parametricTables.find(t => t.id === parametricTableId);
      if (pt && pt.columns) {
        return pt.columns;
      }
    }

    const physical = this.physicalColumnsMap[parametricTableId];
    if (physical && physical.length > 0) {
      return physical;
    }

    const attrs = this.entityAttributesMap[parametricTableId];
    if (attrs && attrs.length > 0) {
      return attrs;
    }

    return this._emptyArray;
  }

  // Called when user changes visibility or label of a column in inspector
  updateSelectedColumns(field: any) {
    // selectedColumns is already updated by ngModel binding — just trigger change detection
    if (!field?.config?.selectedColumns) return;
    // Removed array cloning to prevent NG0103 Infinite change detection in *ngFor
    // field.config.selectedColumns = [...field.config.selectedColumns];
  }

  // Returns columns for a GRID field: respects selectedColumns config, falls back to physical/meta cols
  getGridColumns(field: any): {name: string; type: string; label?: string; parametricTableId?: number; displayField?: string; visibilityRule?: string}[] {
    if (!field) return this._emptyArray;
    
    // Normalize selected columns
    let selected: any[] = field?.config?.selectedColumns;
    
    // Fallback: load physical columns if no selectedColumns
    if (!selected || selected.length === 0) {
      const entityId = field?.config?.dataSourceEntityId;
      if (!entityId && entityId !== 0) return this._emptyArray;
      const id = Number(entityId);
      if (isNaN(id) || id <= 0) return this._emptyArray;
      
      const cols = this.physicalColumnsMap[id];
      if (cols === undefined || cols === null) {
        if (cols === undefined) {
          this.physicalColumnsMap[id] = null as any;
          this.loadColumnsForField(id, field);
        }
        return this._emptyArray;
      }
      
      if (cols.length > 0) {
        if (!field.config) field.config = {};
        if (!field.config.selectedColumns || field.config.selectedColumns.length === 0) {
          this.initSelectedColumns(field, cols);
        }
        selected = field.config.selectedColumns || [];
      } else {
        return this._emptyArray;
      }
    }

    if (!selected || selected.length === 0) return this._emptyArray;

    // We have selected columns. Obtain physical columns for enrichment.
    const entityId = field?.config?.dataSourceEntityId;
    const id = Number(entityId);
    const physicalCols = (!isNaN(id) && id > 0 && this.physicalColumnsMap[id]) ? this.physicalColumnsMap[id] : [];
    const physicalState = physicalCols ? physicalCols.length : 0;

    // Cache the baseline enriched columns
    const currentSelectedStr = JSON.stringify(selected) + "_" + physicalState;
    if (field._cachedSelectedStr !== currentSelectedStr) {
      field._cachedSelectedStr = currentSelectedStr;
      field._cachedColumns = selected.filter((c: any) => c.visible !== false).map((c: any) => {
        const pcol = physicalCols.find((pc: any) => pc.name === c.name);
        return {
          name: c.name,
          type: pcol ? pcol.type : c.type,
          label: c.label || c.name,
          parametricTableId: pcol ? pcol.parametricTableId : c.parametricTableId,
          displayField: c.displayField,
          visibilityRule: c.visibilityRule
        };
      });
    }
    
    const allColumns = field._cachedColumns || this._emptyArray;
    
    // In preview mode, apply visibility rules dynamically
    if (this.mostrarPreview) {
      let visibilityHash = '';
      try {
        visibilityHash = allColumns.map((c: any) => c.visibilityRule ? (this.evaluateVisibilityRule(c.visibilityRule) ? '1' : '0') : '1').join('-');
      } catch (e) {
        visibilityHash = 'error';
      }
      
      if (field._cachedVisibilityHash !== visibilityHash) {
        field._cachedVisibilityHash = visibilityHash;
        field._cachedVisibleColumns = allColumns.filter((c: any) => !c.visibilityRule || this.evaluateVisibilityRule(c.visibilityRule));
      }
      return field._cachedVisibleColumns || this._emptyArray;
    }
    
    return allColumns;
  }

  
  isFieldDisabled(field: any): boolean {
    if (this.dynamicFieldStates && this.dynamicFieldStates[field.name]) {
      if (this.dynamicFieldStates[field.name].editability !== undefined) {
        return !this.dynamicFieldStates[field.name].editability; // if editable is true, disabled is false
      }
    }
    if (field.config?.editableIf) {
      return !this.evaluateVisibilityRule(field.config.editableIf);
    }
    return !!field.readOnly;
  }

  // Map PostgreSQL udt_name to Angular input type
  getColInputType(col: {name: string; type: string; parametricTableId?: number}): string {
    const t = (col.type || '').toLowerCase();
    if (t.includes('parametrica') || col.parametricTableId) return 'combo';
    if (t.includes('int') || t.includes('numeric') || t.includes('float')) return 'number';
    if (t.includes('date') || t.includes('timestamp')) return 'date';
    if (t.includes('bool')) return 'boolean';
    return 'text';
  }

  // ---- GRID simulation rows ----
  getGridRows(fieldName: string): any[] {
    if (!this.gridRowsMap[fieldName]) {
      this.gridRowsMap[fieldName] = [];
    }
    return this.gridRowsMap[fieldName];
  }

  getSimGridDisplayValue(col: any, value: any): any {
    if (value === null || value === undefined || value === '') return '-';
    if (this.getColInputType(col) === 'combo') {
      const options = this.getSimOptions(col.name);
      if (options && options.length > 0) {
        const opt = options.find((o: any) => String(o.codigo || o.id || o.code) === String(value));
        if (opt) {
          if (col.displayField && opt[col.displayField] !== undefined) {
            return opt[col.displayField];
          }
          return opt.descripcion || opt.nombre || opt.label || value;
        }
      }
    }
    if (this.getColInputType(col) === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return value;
  }

  openGridModal(field: any) {
    this.gridModalField = field;
    this.gridNewRow = {};
    // Pre-initialize booleans to false
    this.getGridColumns(field).forEach(col => {
      if (col.type === 'BOOLEAN' || col.type === 'boolean') {
        this.gridNewRow[col.name] = false;
      }
    });
  }

  closeGridModal() {
    this.gridModalField = null;
    this.gridNewRow = {};
  }

  confirmGridRow(field: any) {
    if (!this.gridRowsMap[field.name]) {
      this.gridRowsMap[field.name] = [];
    }
    this.gridRowsMap[field.name].push({ ...this.gridNewRow });
    this.closeGridModal();
  }

  removeGridRow(fieldName: string, idx: number) {
    if (this.gridRowsMap[fieldName]) {
      this.gridRowsMap[fieldName].splice(idx, 1);
    }
  }

  addCascadeRule(field: any) {
    if (!field) return;
    if (!field.config) {
      field.config = {};
    }
    if (!field.config.cascadeRules) {
      field.config.cascadeRules = [];
    }
    field.config.cascadeRules.push({ sourceColumn: '', targetField: '' });
  }

  removeCascadeRule(field: any, index: number) {
    if (!field || !field.config || !field.config.cascadeRules) return;
    field.config.cascadeRules.splice(index, 1);
  }

  onSimComboChange(field: any) {
    const selectedValue = this.previewModel[field.name];
    if (!selectedValue) return;

    const rules = this.getCascadeRules(field);
    if (rules.length === 0) return;

    const options = this.simOptions[field.name] || this._emptyArray;
    const valField = field.config?.valueField;
    const selectedRecord = options.find(opt => {
      const optVal = valField ? opt[valField] : (opt.codigo || opt.id || opt.code);
      return String(optVal) === String(selectedValue);
    });

    if (!selectedRecord) return;

    let modelChanged = false;
    rules.forEach(rule => {
      if (rule.sourceColumn && rule.targetField) {
        const sourceVal = selectedRecord[rule.sourceColumn];
        if (sourceVal !== undefined) {
          this.previewModel[rule.targetField] = String(sourceVal);
          modelChanged = true;
        }
      }
    });

    if (modelChanged) {
      this.previewModel = { ...this.previewModel };
    }
  }

  ngOnInit() {
    this.processesLoading = true;
    this.processesError = false;
    this.processService.getProcesses().pipe(
      catchError(err => {
        console.error('[DisenadorPantallas] Error cargando procesos:', err);
        this.processesError = true;
        return of([]);
      })
    ).subscribe(data => {
      this.processes = data;
      this.processesLoading = false;
    });
    this.apiManagerService.getDefinitions().pipe(catchError(() => of([]))).subscribe(data => this.apisConfiguradas = data);
    this.metaService.listarEntidades().pipe(catchError(() => of([]))).subscribe(data => {
      this.entities = data;
      // Pre-load columns for every entity using the central helper (handles empty physical cols)
      data.forEach(ent => {
        const id = Number(ent.id);
        if (id > 0) {
          this.loadColumnsForField(id, null);
        }
      });
    });
    this.parametricService.getTables().pipe(catchError(() => of([]))).subscribe(data => {
      this.parametricTables = data;
    });
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  recargarProcesos() {
    this.processesLoading = true;
    this.processesError = false;
    this.processService.getProcesses().pipe(
      catchError(err => {
        console.error('[DisenadorPantallas] Error cargando procesos:', err);
        this.processesError = true;
        return of([]);
      })
    ).subscribe(data => {
      this.processes = data;
      this.processesLoading = false;
    });
  }

  onProcessChange() {
    this.savedScreens = [];
    this.nuevoLayout();
    this.userTasks = [];
    this.selectedTaskKey = '';
    
    const process = this.processes.find(p => p.key === this.selectedProcessKey);
    if (process) {
      this.cargarPantallasGuardadas();
      
      this.documentService.getDefinitions(this.selectedProcessKey).pipe(catchError(() => of([]))).subscribe(data => this.documentDefinitions = data);
      
      if (process.metaEntityId) {
        this.metaService.listarAtributos(process.metaEntityId).subscribe(attrs => {
          this.availableAttributes = attrs;
        });
      } else {
        this.availableAttributes = [];
      }
      
      // Obtener y parsear las tareas del XML del proceso
      if (process.bpmnXml) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(process.bpmnXml, 'application/xml');
          const tasks = xmlDoc.getElementsByTagName('bpmn:userTask');
          const tempTasks: { id: string, name: string }[] = [];
          for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const id = task.getAttribute('id') || '';
            const name = task.getAttribute('name') || id;
            if (id) {
              tempTasks.push({ id, name });
            }
          }
          this.userTasks = tempTasks;
        } catch (e) {
          console.error('Error parsing BPMN XML', e);
        }
      }
    }
  }

  cargarPantallasGuardadas() {
    if (this.selectedProcessKey) {
      this.screenService.getScreensByProcess(this.selectedProcessKey).subscribe(screens => {
        this.savedScreens = screens;
      });
    }
  }

  cargarPantalla(screen: ScreenDefinition) {
    this.currentScreen = { ...screen };
    this.selectedTaskKey = screen.taskKey || '';
    if (screen.layoutJson) {
      try {
        this.layout = JSON.parse(screen.layoutJson); if(!this.layout.validations) this.layout.validations = []; if(!this.layout.actions) this.layout.actions = [];
        // Sanitizar y asegurar retrocompatibilidad de campos
        this.layout.tabs.forEach((tab: any) => {
          tab.sections.forEach((sec: any) => {
            sec.fields.forEach((f: any) => {
              if (!f.controlType) {
                f.controlType = 'TEXTBOX';
              }
              if (f.controlType === 'INPUT') f.controlType = 'TEXTBOX';

              if (!f.config) {
                f.config = {
                  dataSourceEntityId: null,
                  displayField: 'nombre',
                  valueField: 'id',
                  buttonAction: 'SAVE',
                  buttonStyle: 'btn-primary'
                };
              }
              if (f.required === undefined) f.required = false;
              if (f.readOnly === undefined) f.readOnly = false;
              if (f.defaultValue === undefined) f.defaultValue = '';
              // Normalize dataSourceEntityId to Number so [ngValue] and gridColumnsMap match
              if (f.config && f.config.dataSourceEntityId != null) {
                const eid = Number(f.config.dataSourceEntityId);
                f.config.dataSourceEntityId = isNaN(eid) ? null : eid;
              }
              // For GRID fields: auto-initialize selectedColumns from cached physical cols
              if (f.controlType === 'GRID' && f.config?.dataSourceEntityId &&
                  (!f.config.selectedColumns || f.config.selectedColumns.length === 0)) {
                const eid = Number(f.config.dataSourceEntityId);
                const cached = this.physicalColumnsMap[eid];
                if (cached && cached.length > 0) {
                  this.initSelectedColumns(f, cached);
                } else {
                  // Cols not yet cached — load them
                  this.metaService.getPhysicalTableColumns(eid).subscribe({
                    next: cols => {
                      this.physicalColumnsMap[eid] = cols;
                      this.initSelectedColumns(f, cols);
                    },
                    error: () => {
                      this.metaService.listarAtributos(eid).subscribe(attrs => {
                        const mapped = attrs.map(a => ({ name: a.name, type: a.type, label: a.label, parametricTableId: a.parametricTableId }));
                        this.physicalColumnsMap[eid] = mapped;
                        this.initSelectedColumns(f, mapped);
                      });
                    }
                  });
                }
              }
            });
          });
        });
      } catch (e) {
        console.error('Error parsing layout JSON', e);
        this.layout = { tabs: [], validations: [], actions: [] };
      }
    } else {
      this.layout = { tabs: [], validations: [], actions: [] };
    }
    this.activeField = null;
    this.activeTabIdx = 0;
  }

  eliminarPantalla(id: number) {
    if (confirm('¿Estás seguro de eliminar esta pantalla?')) {
      this.screenService.deleteScreen(id).subscribe(() => {
        this.cargarPantallasGuardadas();
        if (this.currentScreen.id === id) {
          this.nuevoLayout();
        }
      });
    }
  }

  nuevoLayout() {
    this.layout = { tabs: [], validations: [], actions: [] };
    this.activeTabIdx = 0;
    this.activeField = null;
    this.selectedTaskKey = '';
    this.currentScreen = { name: 'Pantalla Nueva', processKey: this.selectedProcessKey, layoutJson: '', isDefault: true };
  }

  
  
  addAction() {
    if (!this.layout.actions) this.layout.actions = [];
    this.layout.actions.push({
      name: 'Nueva Acción',
      condition: '',
      thenEffects: [],
      elseEffects: []
    });
  }

  removeAction(index: number) {
    if (this.layout.actions) {
      this.layout.actions.splice(index, 1);
    }
  }

  addEffect(action: any, branch: 'then' | 'else') {
    const arr = branch === 'then' ? action.thenEffects : action.elseEffects;
    arr.push({ type: 'visibility', target: '', value: true });
  }

  _cachedFieldsList: {name: string, label: string}[] = [];
  _lastLayoutHash: string = '';

  getAllFieldsList(): {name: string, label: string}[] {
    const currentHash = JSON.stringify(this.layout.tabs || this._emptyArray);
    if (this._lastLayoutHash === currentHash) {
      return this._cachedFieldsList;
    }

    const list: {name: string, label: string}[] = [];
    if (this.layout && this.layout.tabs) {
      for (let i = 0; i < this.layout.tabs.length; i++) {
        const t = this.layout.tabs[i];
        if (t && t.sections) {
          for (let j = 0; j < t.sections.length; j++) {
            const s = t.sections[j];
            if (s && s.fields) {
              for (let k = 0; k < s.fields.length; k++) {
                const f = s.fields[k];
                if (f && f.name) {
                  list.push({ name: f.name, label: f.label || f.name });
                }
              }
            }
          }
        }
      }
    }
    if (list.length === 0) {
       list.push({name: 'NINGUNO', label: 'No hay campos definidos'});
    }
    this._cachedFieldsList = list;
    this._lastLayoutHash = currentHash;
    return list;
  }

  addValidation() {
    if (!this.layout.validations) this.layout.validations = [];
    this.layout.validations.push({
      name: 'Nueva Validación',
      condition: '',
      message: 'Mensaje de error'
    });
  }

  removeValidation(index: number) {
    if (this.layout.validations) {
      this.layout.validations.splice(index, 1);
    }
  }

  addTab() {
    this.layout.tabs.push({ title: 'Nueva Pestaña', sections: [] });
    this.activeTabIdx = this.layout.tabs.length - 1;
  }

  removeTab(idx: number) {
    this.layout.tabs.splice(idx, 1);
    this.activeTabIdx = 0;
    this.activeField = null;
    this.activeTabObj = null;
    this.draftTab = null;
  }

  addSection() {
    if (this.layout.tabs.length === 0) this.addTab();
    this.layout.tabs[this.activeTabIdx].sections.push({ title: 'Nueva Sección', fields: [] });
  }

  removeSection(idx: number) {
    this.layout.tabs[this.activeTabIdx].sections.splice(idx, 1);
    this.activeField = null;
    this.activeSection = null;
    this.draftSection = null;
  }

  cancelarPropiedades() {
    this.activeField = null;
    this.draftField = null;
    this.activeSection = null;
    this.draftSection = null;
    this.activeTabObj = null;
    this.draftTab = null;
  }

  addFieldToLayout(attr: MetaAttribute) {
    if (this.layout.tabs.length === 0) this.addTab();
    if (this.layout.tabs[this.activeTabIdx].sections.length === 0) this.addSection();
    
    const currentTab = this.layout.tabs[this.activeTabIdx];
    const lastSection = currentTab.sections[currentTab.sections.length - 1];
    
    let controlType = 'TEXTBOX';
    if (attr.type === 'NUMBER') {
      controlType = 'NUMBER';
    } else if (attr.type === 'BOOLEAN') {
      controlType = 'YESNO';
    } else if (attr.type === 'DATE') {
      controlType = 'DATE';
    } else if (attr.type === 'PARAMETRICA') {
      controlType = 'COMBO';
    }

    const newField = {
      name: attr.name,
      label: attr.label,
      type: attr.type,
      controlType: controlType,
      cols: 6,
      required: false,
      readOnly: false,
      defaultValue: '',
      config: {
        dataSourceEntityId: attr.parametricTableId || null,
        displayField: 'nombre',
        valueField: 'id',
        buttonAction: null,
        buttonStyle: null
      }
    };

    lastSection.fields.push(newField);
    this.activeField = newField;
  }

  toggleEntity(entity: MetaEntity) {
    const id = entity.id!;
    this.expandedEntities[id] = !this.expandedEntities[id];
    if (this.expandedEntities[id] && !this.entityAttributesMap[id]) {
      this.metaService.listarAtributos(id).subscribe(attrs => {
        this.entityAttributesMap[id] = attrs;
      });
    }
  }

  addFieldForEntityAttribute(entity: MetaEntity, attr: MetaAttribute) {
    if (this.layout.tabs.length === 0) this.addTab();
    if (this.layout.tabs[this.activeTabIdx].sections.length === 0) this.addSection();
    
    const currentTab = this.layout.tabs[this.activeTabIdx];
    const lastSection = currentTab.sections[currentTab.sections.length - 1];
    
    let controlType = 'TEXTBOX';
    if (attr.type === 'NUMBER') {
      controlType = 'NUMBER';
    } else if (attr.type === 'BOOLEAN') {
      controlType = 'YESNO';
    } else if (attr.type === 'DATE') {
      controlType = 'DATE';
    } else if (attr.type === 'PARAMETRICA') {
      controlType = 'COMBO';
    }
    
    const newField = {
      name: `${entity.name.toLowerCase()}_${attr.name}`,
      label: `${entity.label} - ${attr.label}`,
      type: attr.type,
      controlType: controlType,
      cols: 6,
      required: false,
      readOnly: false,
      defaultValue: '',
      config: {
        dataSourceEntityId: entity.id,
        displayField: attr.name,
        valueField: 'id',
        buttonAction: null,
        buttonStyle: null
      }
    };
    
    lastSection.fields.push(newField);
    this.activeField = newField;
  }

  addGenericControl(controlType: string) {
    if (this.layout.tabs.length === 0) this.addTab();
    
    const currentTab = this.layout.tabs[this.activeTabIdx];
    if (currentTab.sections.length === 0) this.addSection();
    
    const lastSection = currentTab.sections[currentTab.sections.length - 1];
    
    const count = this.getControlCount(controlType) + 1;
    const name = `${controlType.toLowerCase()}_${count}`;
    let label = '';
    let type = 'STRING';
    
    switch(controlType) {
      case 'TEXTBOX':
        label = `Caja de Texto ${count}`;
        type = 'STRING';
        break;
      case 'NUMBER':
        label = `Número ${count}`;
        type = 'NUMBER';
        break;
      case 'MONEY':
        label = `Moneda ${count}`;
        type = 'NUMBER';
        break;
      case 'DATE':
        label = `Fecha ${count}`;
        type = 'DATE';
        break;
      case 'YESNO':
        label = `Sí/No ${count}`;
        type = 'BOOLEAN';
        break;
      case 'FILEUPLOAD':
        label = `Subir Archivo ${count}`;
        type = 'FILE';
        break;
      case 'COMBO':
        label = `Selección ${count}`;
        type = 'PARAMETRICA';
        break;
      case 'GRID':
        label = `Grilla de Datos ${count}`;
        type = 'JSON';
        break;
      case 'IMAGE':
        label = `Imagen ${count}`;
        type = 'STRING';
        break;
      case 'BUTTON':
        label = `Acción ${count}`;
        type = 'BUTTON';
        break;
      case 'LABEL':
        label = `Separador/Texto ${count}`;
        type = 'LABEL';
        break;
      case 'LINK':
        label = `Enlace ${count}`;
        type = 'LINK';
        break;
      case 'SIMULADOR':
        label = `Simulador ${count}`;
        type = 'SIMULADOR';
        break;
      case 'RESUMEN_CASO':
        label = `Info General ${count}`;
        type = 'RESUMEN_CASO';
        break;
      default:
        label = `Control ${count}`;
        type = 'STRING';
    }
    
    const newField = {
      name,
      label,
      type,
      controlType,
      cols: 6,
      required: false,
      readOnly: false,
      defaultValue: '',
      config: {
        dataSourceEntityId: null,
        displayField: 'nombre',
        valueField: 'id',
        buttonAction: controlType === 'BUTTON' ? 'SAVE' : null,
        buttonStyle: controlType === 'BUTTON' ? 'btn-primary' : null
      }
    };
    
    lastSection.fields.push(newField);
    this.activeField = newField;
  }

  addGridForEntity(entity: MetaEntity) {
    this.addGenericControl('GRID');
    if (this.activeField) {
      this.activeField.label = `Grilla de ${entity.label}`;
      this.activeField.config.dataSourceEntityId = entity.id;
    }
  }

  addComboForEntity(entity: MetaEntity) {
    this.addGenericControl('COMBO');
    if (this.activeField) {
      this.activeField.label = `Seleccionar ${entity.label}`;
      this.activeField.config.dataSourceEntityId = entity.id;
    }
  }

  addComboForParamTable(pt: any) {
    this.addGenericControl('COMBO');
    if (this.activeField) {
      this.activeField.label = `Seleccionar ${pt.label}`;
      this.activeField.name = `param_${pt.name}_${this.getControlCount('COMBO')}`;
      this.activeField.config.dataSourceEntityId = pt.id;
      this.activeField.config.displayField = 'descripcion';
      this.activeField.config.valueField = 'codigo';
    }
  }

  addComboForParamTableField(pt: any, col: any) {
    this.addGenericControl('COMBO');
    if (this.activeField) {
      this.activeField.label = pt.label;
      this.activeField.name = `${pt.name}_${col.name}`;
      this.activeField.config.dataSourceEntityId = pt.id;
      this.activeField.config.displayField = col.name;
      this.activeField.config.valueField = col.name;
    }
  }

  getControlCount(controlType: string): number {
    let count = 0;
    if (this.layout && this.layout.tabs) {
      this.layout.tabs.forEach((tab: any) => {
        tab.sections.forEach((sec: any) => {
          sec.fields.forEach((f: any) => {
            if (f.controlType === controlType) count++;
          });
        });
      });
    }
    return count;
  }

  getEntityLabel(id: any): string {
    if (!id) return '';
    const ent = this.entities.find(e => e.id === Number(id));
    return ent ? ent.label : '';
  }

  selectField(field: any) {
    this.activeSection = null;
    this.draftSection = null;
    this.activeTabObj = null;
    this.draftTab = null;
    this.activeField = field;
    this.draftField = JSON.parse(JSON.stringify(field));
  }

  selectSection(section: any, event?: Event) {
    if (event) event.stopPropagation();
    this.activeField = null;
    this.draftField = null;
    this.activeTabObj = null;
    this.draftTab = null;
    this.activeSection = section;
    this.draftSection = JSON.parse(JSON.stringify(section));
  }

  selectTab(tab: any, tIdx: number, event: Event) {
    if (event) event.stopPropagation();
    this.activeTabIdx = tIdx;
    this.activeField = null;
    this.draftField = null;
    this.activeSection = null;
    this.draftSection = null;
    this.activeTabObj = tab;
    this.draftTab = JSON.parse(JSON.stringify(tab));
  }

  guardarPropiedades() {
    try {
      if (this.activeField && this.draftField) {
        // Find the field in the layout and replace it completely
        let found = false;
        if (this.layout && this.layout.tabs) {
          for (const tab of this.layout.tabs) {
            for (const section of tab.sections) {
              const idx = section.fields.findIndex((f: any) => f === this.activeField || f.name === this.activeField.name);
              if (idx !== -1) {
                section.fields[idx] = this.draftField;
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
        
        // Force angular change detection by recreating the layout
        this.layout = JSON.parse(JSON.stringify(this.layout));
        this.activeField = null;
        this.draftField = null;
        this.cdr.detectChanges();
        
      } else if (this.activeSection && this.draftSection) {
        let found = false;
        if (this.layout && this.layout.tabs) {
          for (const tab of this.layout.tabs) {
            const idx = tab.sections.findIndex((s: any) => s === this.activeSection || s.title === this.activeSection.title);
            if (idx !== -1) {
              tab.sections[idx] = this.draftSection;
              found = true;
              break;
            }
          }
        }
        
        // Force angular change detection by recreating the layout
        this.layout = JSON.parse(JSON.stringify(this.layout));
        this.activeSection = null;
        this.draftSection = null;
        this.cdr.detectChanges();
      }

    } catch (e) {
      console.error('Error al guardar:', e);
      alert('Error interno al guardar: ' + e);
    }
  }

  removeField(sIdx: number, fIdx: number) {
    this.layout.tabs[this.activeTabIdx].sections[sIdx].fields.splice(fIdx, 1);
    this.activeField = null;
  }

  // --- REORDERING METHODS ---
  moveFieldUp(sIdx: number, fIdx: number) {
    if (fIdx === 0) return;
    const fields = this.layout.tabs[this.activeTabIdx].sections[sIdx].fields;
    const temp = fields[fIdx];
    fields[fIdx] = fields[fIdx - 1];
    fields[fIdx - 1] = temp;
  }

  moveFieldDown(sIdx: number, fIdx: number) {
    const fields = this.layout.tabs[this.activeTabIdx].sections[sIdx].fields;
    if (fIdx === fields.length - 1) return;
    const temp = fields[fIdx];
    fields[fIdx] = fields[fIdx + 1];
    fields[fIdx + 1] = temp;
  }

  moveSectionUp(sIdx: number) {
    if (sIdx === 0) return;
    const sections = this.layout.tabs[this.activeTabIdx].sections;
    const temp = sections[sIdx];
    sections[sIdx] = sections[sIdx - 1];
    sections[sIdx - 1] = temp;
  }

  moveSectionDown(sIdx: number) {
    const sections = this.layout.tabs[this.activeTabIdx].sections;
    if (sIdx === sections.length - 1) return;
    const temp = sections[sIdx];
    sections[sIdx] = sections[sIdx + 1];
    sections[sIdx + 1] = temp;
  }

  changeFieldWidth(field: any, width: number) {
    field.cols = width;
  }

  // --- DRAG & DROP METHODS ---

  onFieldDragStart(event: DragEvent, sIdx: number, fIdx: number) {
    if (this.dragHoverId !== sIdx + '_' + fIdx) {
      event.preventDefault();
      return;
    }
    this.dragSectionIdx = sIdx;
    this.dragFieldIdx = fIdx;
    this.dragOverSectionIdx = sIdx;
    this.dragOverFieldIdx = fIdx;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${sIdx}:${fIdx}`);
    }
  }

  onFieldDragEnter(event: DragEvent, sIdx: number, fIdx: number) {
    event.preventDefault();
    if (this.dragSectionIdx < 0) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertBefore = event.clientY < midY;
    this.dragOverSectionIdx = sIdx;
    this.dragOverFieldIdx = insertBefore ? fIdx : fIdx + 1;
  }

  onFieldDragOver(event: DragEvent, sIdx: number, fIdx: number) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.dragSectionIdx < 0) return;
    // Recalculate insert position based on vertical midpoint
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertBefore = event.clientY < midY;
    this.dragOverSectionIdx = sIdx;
    this.dragOverFieldIdx = insertBefore ? fIdx : fIdx + 1;
  }

  onFieldDrop(event: DragEvent, sIdx: number, fIdx: number) {
    event.preventDefault();
    event.stopPropagation();

    const fromSIdx = this.dragSectionIdx;
    const fromFIdx = this.dragFieldIdx;

    if (fromSIdx < 0 || fromFIdx < 0) {
      this.onFieldDragEnd();
      return;
    }

    const sections = this.layout.tabs[this.activeTabIdx].sections;
    const fromSection = sections[fromSIdx];
    const toSection = sections[sIdx];

    if (!fromSection || !toSection) {
      this.onFieldDragEnd();
      return;
    }

    const field = fromSection.fields[fromFIdx];
    if (!field) {
      this.onFieldDragEnd();
      return;
    }

    // Remove from source
    fromSection.fields.splice(fromFIdx, 1);

    // Adjust target index if same section and source was before target
    let targetIdx = this.dragOverFieldIdx >= 0 ? this.dragOverFieldIdx : toSection.fields.length;
    if (fromSIdx === sIdx && fromFIdx < targetIdx) {
      targetIdx = Math.max(0, targetIdx - 1);
    }

    // Clamp target index
    targetIdx = Math.max(0, Math.min(targetIdx, toSection.fields.length));

    // Insert at target
    toSection.fields.splice(targetIdx, 0, field);

    // Force reference update for change detection
    toSection.fields = [...toSection.fields];

    this.onFieldDragEnd();
  }

  onFieldDragEnd() {
    this.dragSectionIdx = -1;
    this.dragFieldIdx = -1;
    this.dragOverSectionIdx = -1;
    this.dragOverFieldIdx = -1;
    this.dragHoverId = null;
  }

  // --- PREVIEW METHODS ---
  activarPreview() {
    this.previewTabIdx = 0;
    this.previewModel = {};
    this.uploadedMockFiles = {};
    this.mockGridData = {};
    this.gridRowsMap = {};
    this.gridModalField = null;
    this.gridNewRow = {};
    this.simSubmitted = false;
    this.simNotification = '';
    this.simOptions = {};

    // Fill defaults
    if (this.layout && this.layout.tabs) {
      this.layout.tabs.forEach((tab: any) => {
        tab.sections.forEach((sec: any) => {
          sec.fields.forEach((f: any) => {
            if (f.name && f.defaultValue) {
              const defVal = String(f.defaultValue).trim().toUpperCase();
              if (defVal === 'HOY' || defVal === '{HOY}' || defVal === 'TODAY' || defVal === '{TODAY}') {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                this.previewModel[f.name] = `${yyyy}-${mm}-${dd}`;
              } else if (defVal === '{SEQ}' || defVal === '{SECUENCIAL}') {
                let prefix = 'SEQ';
                if (this.selectedProcessKey) {
                  prefix = this.selectedProcessKey.split(/[-_]/).map(w => w.charAt(0).toUpperCase()).join('').substring(0, 3);
                }
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const yy = String(today.getFullYear());
                const h = String(today.getHours()).padStart(2, '0');
                const m = String(today.getMinutes()).padStart(2, '0');
                const s = String(today.getSeconds()).padStart(2, '0');
                this.previewModel[f.name] = `${prefix}${dd}${mm}${yy}${h}${m}${s}`;
              } else {
                this.previewModel[f.name] = f.defaultValue;
              }
            }
          });
        });
      });
    }

    // Load real parametric data for COMBO fields
    this.simLoadingData = true;
    const comboFields: {name: string, entityId: any}[] = [];
    if (this.layout && this.layout.tabs) {
      this.layout.tabs.forEach((tab: any) => {
        tab.sections.forEach((sec: any) => {
          sec.fields.forEach((f: any) => {
            if (f.controlType === 'COMBO') {
              if (f.config && f.config.options) {
                this.simOptions[f.name] = f.config.options;
              } else {
                comboFields.push({ name: f.name, entityId: f.config?.dataSourceEntityId });
              }
            } else if (f.controlType === 'GRID') {
              const cols = this.getGridColumns(f);
              cols.forEach((col: any) => {
                if (this.getColInputType(col) === 'combo') {
                  if (col.options) {
                    this.simOptions[col.name] = col.options;
                  } else if (col.parametricTableId) {
                    comboFields.push({ name: col.name, entityId: col.parametricTableId });
                  }
                }
              });
            }
          });
        });
      });
    }

    let pending = comboFields.length;
    if (pending === 0) {
      this.simLoadingData = false;
    } else {
      comboFields.forEach(info => {
        const entityId = info.entityId;
        const fieldName = info.name;
        if (entityId) {
          // Try as parametric table first
          this.parametricService.getTableData(Number(entityId)).subscribe({
            next: (data) => {
              this.simOptions[fieldName] = data;
              pending--;
              if (pending === 0) this.simLoadingData = false;
            },
            error: () => {
              // Fallback: try as entity data
              this.metaService.getEntityData(Number(entityId)).subscribe({
                next: (data) => { this.simOptions[fieldName] = data; },
                error: () => { this.simOptions[fieldName] = []; }
              });
              pending--;
              if (pending === 0) this.simLoadingData = false;
            }
          });
        } else {
          pending--;
          if (pending === 0) this.simLoadingData = false;
        }
      });
    }

    this.mostrarPreview = true;
  }

  evaluateVisibilityRule(rule: string | undefined): boolean {
    if (!rule || rule.trim() === '') return true;
    try {
      const check = new Function('data', 'with(data) { return ' + rule + '; }');
      // Shallow clone to prevent accidental mutations from triggering change detection loops
      const clone = { ...this.previewModel };
      return !!check(clone);
    } catch (e) {
      return false;
    }
  }

  previewVisible(field: any): boolean {
    if (this.dynamicFieldStates && this.dynamicFieldStates[field.name]) {
      if (this.dynamicFieldStates[field.name].visibility !== undefined) {
        return this.dynamicFieldStates[field.name].visibility;
      }
    }
    return this.evaluateVisibilityRule(field.visibleIf);
  }


  mockOptionsForField(field: any): any[] {
    const label = this.getEntityLabel(field.config?.dataSourceEntityId) || 'Opción';
    return [
      { id: 1, nombre: `${label} - Registro de Prueba A` },
      { id: 2, nombre: `${label} - Registro de Prueba B` },
      { id: 3, nombre: `${label} - Registro de Prueba C` }
    ];
  }

  uploadMock(fieldName: string) {
    const mockNames = ['contrato_firmado.pdf', 'identificacion_cliente.png', 'solicitud_analisis.pdf', 'balance_general.xlsx'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    this.uploadedMockFiles[fieldName] = randomName;
    alert(`[PREVIEW] Mock subida de archivo '${randomName}' exitosa.`);
  }

  addMockGridRow(fieldName: string) {
    if (!this.mockGridData[fieldName]) {
      this.mockGridData[fieldName] = [];
    }
    const idx = this.mockGridData[fieldName].length + 1;
    this.mockGridData[fieldName].push({
      col1: `Fila ${idx} - Campo A`,
      col2: `Fila ${idx} - Campo B`,
      col3: `Fila ${idx} - Campo C`
    });
  }

  removeMockGridRow(fieldName: string, idx: number) {
    if (this.mockGridData[fieldName]) {
      this.mockGridData[fieldName].splice(idx, 1);
    }
  }

  previewButtonAction(field: any) {
    this.simButtonAction(field);
  }

  simButtonAction(field: any) {
    const action = field.config?.buttonAction;
    const label = field.label || 'Acción';
    if (action === 'SAVE') {
      this.simFlashNotification(`💾 [${label}] Datos guardados correctamente (simulación).`, 'success');
    } else if (action === 'NEXT_TASK') {
      this.simFlashNotification(`🚀 [${label}] Avanzando a la siguiente tarea (simulación)...`, 'info');
    } else if (action === 'CANCEL') {
      this.simReset();
      this.simFlashNotification(`🗑️ [${label}] Formulario cancelado y limpiado.`, 'warning');
    } else if (action === 'CUSTOM') {
      const apiToExecute = field.config?.apiToExecute;

      if (apiToExecute && apiToExecute.includes('CALCULAR')) {
         const findValue = (keywords: string[], secondaryKeywords: string[] = []): number => {
            for (const key of Object.keys(this.previewModel)) {
                const k = key.toLowerCase();
                if (keywords.some(kw => k.includes(kw))) {
                    if (secondaryKeywords.length > 0) {
                        if (secondaryKeywords.some(sk => k.includes(sk))) return Number(this.previewModel[key]) || 0;
                    } else return Number(this.previewModel[key]) || 0;
                }
            }
            return 0;
         };

         let monto = findValue(['monto'], ['aprobado']) || findValue(['monto'], ['solicitado']) || findValue(['monto']);
         let tasa = findValue(['tasa', 'interes']);
         let plazo = findValue(['plazo'], ['aprobado']) || findValue(['plazo'], ['solicitado']) || findValue(['plazo'], ['meses']) || findValue(['plazo']);
         
         const r = tasa / 100 / 12;
         const cuota = (monto === 0 || r === 0 || plazo === 0) ? (monto / (plazo || 1)) : (monto * r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1);
         const cuotaStr = cuota.toFixed(2);

         let updated = false;
         for (const key of Object.keys(this.previewModel)) {
             const k = key.toLowerCase();
             if (k.includes('cuota') && (k.includes('estimada') || k.includes('mensual') || k.includes('calculada'))) {
                 this.previewModel[key] = cuotaStr;
                 updated = true;
             }
         }
         if (!updated) {
             this.previewModel['cuota_estimada_analisis'] = cuotaStr;
             this.previewModel['cuota_estimada'] = cuotaStr;
         }
         this.previewModel = { ...this.previewModel };

         this.simFlashNotification(`🧮 [${label}] Calculado: M=${monto}, P=${plazo}, T=${tasa}% -> ${cuotaStr}`, 'success');
         return;
      }

      if (apiToExecute) {
        this.simFlashNotification(`⚡ [${label}] Ejecutando API: ${apiToExecute}...`, 'info');
        this.apiManagerService.testApi(apiToExecute, this.previewModel).subscribe({
          next: (res) => {
            this.simFlashNotification(`✅ [${label}] API ejecutada exitosamente.`, 'success');

            if (res && res.documentBase64 && res.fileName) {
              const link = document.createElement('a');
              link.href = 'data:application/pdf;base64,' + res.documentBase64;
              link.download = res.fileName;
              link.click();
              this.simFlashNotification(`📄 [${label}] Descargando documento: ${res.fileName}`, 'success');
              return;
            }

            // Populate previewModel with response data
            Object.assign(this.previewModel, res);
            
            // Map arrays to gridRowsMap for GRID simulation
            for (const key in res) {
                if (Array.isArray(res[key])) {
                    this.gridRowsMap[key] = [...res[key]];
                }
            }

            // LOGICA PARA HABILITAR SECCION SI NO HAY DATOS
            if (field.config?.enableSectionOnApiFail && res.mensaje && res.mensaje.includes('no encontrado')) {
              if (this.layout && this.layout.tabs) {
                for (const tab of this.layout.tabs) {
                  for (const section of tab.sections) {
                    if (section.fields.includes(field)) {
                      section.fields.forEach((f: any) => f.readOnly = false);
                      this.simFlashNotification(`ℹ️ [${label}] API no encontró datos. Se habilitó la edición de los campos.`, 'info');
                    }
                  }
                }
              }
            }
          },
          error: (err) => {
            this.simFlashNotification(`❌ [${label}] Error ejecutando API: ${err.message || 'Error desconocido'}`, 'warning');
          }
        });
      } else {
        this.simFlashNotification(`⚡ [${label}] Acción personalizada ejecutada (sin API vinculada).`, 'info');
      }
    } else if (action === 'GENERATE_DOCUMENT') {
      const docDefId = field.config?.documentDefinitionId;
      if (!docDefId) {
        this.simFlashNotification(`⚠️ [${label}] Botón Generar Documento clicado (Sin plantilla configurada)`, 'warning');
        return;
      }
      this.simFlashNotification(`📄 [${label}] Generando documento...`, 'info');
      
      this.documentService.generate(docDefId, 'sim-instance', this.previewModel, 'sim-user').subscribe({
        next: (res: any) => {
           if (res && res.documentBase64) {
              const fileName = res.fileName || 'Documento.pdf';
              let mimeType = 'application/pdf';
              if (fileName.endsWith('.docx')) {
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              } else if (fileName.endsWith('.xlsx')) {
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              }
              const link = document.createElement('a');
              link.href = `data:${mimeType};base64,` + res.documentBase64;
              link.download = fileName;
              link.click();
              this.simFlashNotification(`✅ [${label}] Documento descargado`, 'success');
           } else {
              this.simFlashNotification(`✅ [${label}] Documento generado en el servidor`, 'success');
           }
        },
        error: (err) => {
           this.simFlashNotification(`❌ [${label}] Error generando documento: ${err.message}`, 'warning');
        }
      });
    } else {
      this.simFlashNotification(`❌ Acción desconocida: ${action}`, 'warning');
    }
  }

  simFlashNotification(msg: string, type: 'success' | 'warning' | 'info') {
    this.simNotification = msg;
    this.simNotificationType = type;
    if (this.simNotifTimer) clearTimeout(this.simNotifTimer);
    this.simNotifTimer = setTimeout(() => { this.simNotification = ''; }, 4000);
  }

  simSubmit() {
    this.simSubmitted = true;
    const errors = this.simGetValidationErrors();
    if (errors.length > 0) {
      this.simFlashNotification(`⚠️ Hay ${errors.length} campo(s) obligatorio(s) sin completar.`, 'warning');
      return;
    }
    this.simFlashNotification(`✅ Formulario enviado exitosamente. Variables capturadas: ${Object.keys(this.previewModel).length} campo(s).`, 'success');
  }

  simReset() {
    this.previewModel = {};
    this.uploadedMockFiles = {};
    this.mockGridData = {};
    this.simSubmitted = false;
    this.simNotification = '';
    // Re-fill defaults
    if (this.layout && this.layout.tabs) {
      this.layout.tabs.forEach((tab: any) => {
        tab.sections.forEach((sec: any) => {
          sec.fields.forEach((f: any) => {
            if (f.name && f.defaultValue) {
              const defVal = String(f.defaultValue).trim().toUpperCase();
              if (defVal === 'HOY' || defVal === '{HOY}' || defVal === 'TODAY' || defVal === '{TODAY}') {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                this.previewModel[f.name] = `${yyyy}-${mm}-${dd}`;
              } else if (defVal === '{SEQ}' || defVal === '{SECUENCIAL}') {
                let prefix = 'SEQ';
                if (this.selectedProcessKey) {
                  prefix = this.selectedProcessKey.split(/[-_]/).map(w => w.charAt(0).toUpperCase()).join('').substring(0, 3);
                }
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const yy = String(today.getFullYear());
                const h = String(today.getHours()).padStart(2, '0');
                const m = String(today.getMinutes()).padStart(2, '0');
                const s = String(today.getSeconds()).padStart(2, '0');
                this.previewModel[f.name] = `${prefix}${dd}${mm}${yy}${h}${m}${s}`;
              } else {
                this.previewModel[f.name] = f.defaultValue;
              }
            }
          });
        });
      });
    }
  }

  // _cachedErrors for simGetValidationErrors
  _cachedErrorsStr: string = '';
  _cachedErrors: string[] = [];

  simGetValidationErrors(): string[] {
    const errors: string[] = [];
    if (!this.layout || !this.layout.tabs) {
      return this._cachedErrors; // Return empty cached array
    }
    
    // Validaciones personalizadas estilo Bizagi
    if (this.layout.validations && Array.isArray(this.layout.validations)) {
      this.layout.validations.forEach((val: any) => {
        if (val.condition && val.condition.trim() !== '') {
          try {
            const check = new Function('data', 'with(data) { return ' + val.condition + '; }');
            const isInvalid = check(this.previewModel);
            if (isInvalid) {
              errors.push(val.message || 'Error en validación: ' + val.name);
            }
          } catch (e) {
            console.error('Error evaluando validación:', val.name, e);
          }
        }
      });
    }

    this.layout.tabs.forEach((tab: any) => {
      tab.sections.forEach((sec: any) => {
        sec.fields.forEach((f: any) => {
          if (f.required && this.previewVisible(f) && f.controlType !== 'BUTTON' && f.controlType !== 'LABEL') {
            const val = this.previewModel[f.name];
            if (val === null || val === undefined || val === '') {
              errors.push(`${f.label || f.name} es obligatorio`);
            }
          }
        });
      });
    });
    
    // Cache array reference to prevent infinite loops in Angular Change Detection
    const str = JSON.stringify(errors);
    if (this._cachedErrorsStr !== str) {
      this._cachedErrorsStr = str;
      this._cachedErrors = errors;
    }
    return this._cachedErrors;
  }

  getSimOptions(fieldName: string): any[] {
    if (!this.simOptions[fieldName]) {
      this.simOptions[fieldName] = [];
    }
    return this.simOptions[fieldName];
  }

  simTotalFields(): number {
    let count = 0;
    if (!this.layout || !this.layout.tabs) return 0;
    this.layout.tabs.forEach((tab: any) => {
      tab.sections.forEach((sec: any) => { count += sec.fields.length; });
    });
    return count;
  }

  getPreviewModelJson(): string {
    return JSON.stringify(this.previewModel, null, 2);
  }

  guardar() {
    if (!this.selectedProcessKey) {
      alert('Debes seleccionar un proceso primero.');
      return;
    }
    this.currentScreen.processKey = this.selectedProcessKey;
    this.currentScreen.taskKey = this.selectedTaskKey || undefined;
    this.currentScreen.layoutJson = JSON.stringify(this.layout);
    
    this.screenService.saveScreen(this.currentScreen).subscribe({
      next: (saved) => {
        this.currentScreen = saved;
        this.cargarPantallasGuardadas();
        alert('Diseño de pantalla guardado con éxito');
      },
      error: (err) => {
        console.error('Error al guardar diseño de pantalla:', err);
        alert('Error al guardar el diseño de la pantalla. Revisa la consola para más detalles.');
      }
    });
  }
}
