import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiManagerService, ApiDefinition, ExternalProcess, TramaField } from '../../../core/services/api-manager.service';

@Component({
  selector: 'app-api-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4 notranslate" translate="no">
      
      <!-- ENCABEZADO PRINCIPAL -->
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold">
            <i class="bi bi-cpu me-2"></i>Gestión de APIs y Procesos Externos
          </h2>
          <p class="text-muted mb-0">Configura servicios externos, mapeo de tramas y orquestación de mensajes corporativos.</p>
        </div>
        <div class="d-flex gap-2" *ngIf="vistaActiva === 'procesos'">
          <button class="btn btn-primary shadow-sm" (click)="abrirModalProceso()">
            <i class="bi bi-plus-circle me-1"></i>Nuevo Proceso Externo
          </button>
        </div>
        <div class="d-flex gap-2" *ngIf="vistaActiva === 'conectores'">
          <button class="btn btn-primary shadow-sm" (click)="abrirModalConector()">
            <i class="bi bi-plus-circle me-1"></i>Nuevo Conector REST
          </button>
        </div>
        <div class="d-flex gap-2" *ngIf="vistaActiva === 'tramas'">
          <button class="btn btn-outline-secondary" (click)="regresarAProcesos()">
            <i class="bi bi-arrow-left me-1"></i>Regresar a Procesos
          </button>
        </div>
      </div>

      <!-- TABS DE NAVEGACIÓN PRINCIPAL (Si no estamos editando tramas) -->
      <ul class="nav nav-pills mb-4 bg-light p-1 rounded-3" *ngIf="vistaActiva !== 'tramas'" style="max-width: fit-content;">
        <li class="nav-item">
          <button class="nav-link px-4 py-2 fw-semibold" [class.active]="vistaActiva === 'procesos'" (click)="vistaActiva = 'procesos'">
            <i class="bi bi-share me-1"></i>Procesos Sistemas Externos
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link px-4 py-2 fw-semibold" [class.active]="vistaActiva === 'conectores'" (click)="vistaActiva = 'conectores'">
            <i class="bi bi-plug me-1"></i>Conectores REST Simples
          </button>
        </li>
      </ul>

      <!-- ========================================== -->
      <!-- VISTA 1: PROCESOS SISTEMAS EXTERNOS       -->
      <!-- ========================================== -->
      <div *ngIf="vistaActiva === 'procesos'" class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-4">Código</th>
                  <th>Descripción</th>
                  <th>Tipo Referencia</th>
                  <th>Tipo Proceso</th>
                  <th>Tipos Trama</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of procesos" class="hover-row">
                  <td class="ps-4 fw-bold text-dark">
                    <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-3">{{ p.code }}</span>
                  </td>
                  <td>
                    <div class="fw-bold text-dark">{{ p.description }}</div>
                    <small class="text-muted" *ngIf="p.systemName">Sistema: {{ p.systemName }}</small>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border px-2 py-1.5">{{ p.referenceType }}</span>
                  </td>
                  <td>
                    <span class="badge bg-info-subtle text-info border border-info-subtle px-2.5 py-1.5 rounded-3">{{ p.processType }}</span>
                  </td>
                  <td>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1.5 rounded-3">{{ p.tramaTypes }}</span>
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-2 px-3 rounded-pill" (click)="configurarTramas(p)" title="Configurar Tramas">
                      <i class="bi bi-code-slash me-1"></i>Tramas
                    </button>
                    <button class="btn btn-sm btn-link text-primary p-0 me-2" (click)="editarProceso(p)" title="Editar Proceso">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-danger p-0" (click)="eliminarProceso(p)" title="Eliminar Proceso">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="procesos.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-folder-x display-6 text-muted mb-2"></i>
                    <p class="mb-0">No hay procesos de sistemas externos registrados.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- VISTA 2: CONECTORES REST SIMPLES          -->
      <!-- ========================================== -->
      <div *ngIf="vistaActiva === 'conectores'" class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-4">Nombre / Clave</th>
                  <th>Método</th>
                  <th>URL Endpoint</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let api of apis">
                  <td class="ps-4">
                    <div class="fw-bold text-dark">{{ api.name }}</div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getMethodClass(api.method)">{{ api.method }}</span>
                  </td>
                  <td><code class="small text-muted">{{ api.url }}</code></td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-info me-2 rounded-pill px-3" (click)="probarApi(api)">
                      <i class="bi bi-play-fill me-1"></i>Test
                    </button>
                    <button class="btn btn-sm btn-link text-primary p-0 me-2" (click)="editarApi(api)">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="apis.length === 0">
                  <td colspan="4" class="text-center py-5 text-muted">No hay APIs registradas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- VISTA 3: CONFIGURACIÓN DE TRAMAS          -->
      <!-- ========================================== -->
      <div *ngIf="vistaActiva === 'tramas'" class="row g-4">
        
        <!-- COLUMNA IZQUIERDA: ÁRBOL DE CAMPOS -->
        <div class="col-md-5">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100" style="min-height: 550px;">
            <div class="card-header bg-white border-0 pt-3 pb-2 px-3 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold text-dark mb-0"><i class="bi bi-diagram-3 me-2 text-primary"></i>Campos de la Trama</h5>
              <button class="btn btn-sm btn-outline-success rounded-pill" (click)="agregarCampoRaiz()">
                <i class="bi bi-plus-lg me-1"></i>Campo Raíz
              </button>
            </div>
            
            <div class="card-body p-3 overflow-auto" style="max-height: 480px;">
              <div class="border rounded-3 overflow-hidden bg-light-subtle">
                <div *ngFor="let item of ArbolAplanado" 
                     [style.padding-left.px]="item.level * 24" 
                     class="d-flex align-items-center justify-content-between p-2.5 border-bottom hover-bg transition-all"
                     [class.bg-primary-subtle]="selectedField?.id === item.node.id"
                     [class.border-start]="selectedField?.id === item.node.id"
                     [class.border-primary]="selectedField?.id === item.node.id"
                     [style.border-left-width.px]="selectedField?.id === item.node.id ? 4 : 0">
                  
                  <span (click)="seleccionarField(item.node)" class="cursor-pointer flex-grow-1 select-none">
                    <i class="bi" [ngClass]="item.level === 0 ? 'bi-folder2-open text-warning me-2 fs-5' : 'bi-file-earmark-code text-info me-2 fs-5'"></i>
                    <span [class.fw-bold]="item.level === 0">{{ item.node.name }}</span>
                  </span>
                  
                  <div class="btn-group opacity-hover">
                    <button class="btn btn-xs btn-outline-success p-1 px-2.5 rounded-3" (click)="agregarHijo(item.node)" title="Añadir campo hijo">
                      <i class="bi bi-plus-lg fs-7"></i>
                    </button>
                    <button class="btn btn-xs btn-outline-danger p-1 px-2.5 rounded-3 ms-1" (click)="eliminarField(item.node)" title="Eliminar campo">
                      <i class="bi bi-trash fs-7"></i>
                    </button>
                  </div>
                </div>
                
                <div *ngIf="tramas.length === 0" class="text-center py-5 text-muted">
                  No hay campos definidos en esta trama. Comienza creando un Campo Raíz.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: CONFIGURACIÓN DETALLADA + CRITERIOS -->
        <div class="col-md-7">
          <div class="d-flex flex-column gap-4">
            
            <!-- PANEL CRITERIOS DE SELECCIÓN (Trama / Sistemas) -->
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-3">
                <div class="row g-3 align-items-center">
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-muted mb-1">Proceso Seleccionado</label>
                    <div class="form-control-plaintext fw-bold text-primary py-1">{{ selectedProcess?.description }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-muted mb-1">Sistema Externo</label>
                    <select class="form-select" [(ngModel)]="sistemaSeleccionado" (change)="guardarCambiosProcesoRapido()">
                      <option value="LYNKO">LYNKO</option>
                      <option value="SRI">SRI - SERVICIO DE RENTAS INTERNAS</option>
                      <option value="REGISTRO CIVIL">REGISTRO CIVIL</option>
                      <option value="CORRESPONSAL">CORRESPONSAL SOLIDARIO</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-muted mb-1">Tipo Trama</label>
                    <select class="form-select bg-primary-subtle text-primary border-primary-subtle fw-semibold" [(ngModel)]="tipoTramaSeleccionada" (change)="onCambiarTipoTrama()">
                      <option value="INPUT">INPUT (TRAMA ENTRADA)</option>
                      <option value="OUTPUT">OUTPUT (TRAMA RESPUESTA)</option>
                    </select>
                  </div>
                </div>

                <!-- SIMULADOR Y ACCIONES RÁPIDAS -->
                <div class="d-flex gap-2 mt-3 pt-3 border-top justify-content-end">
                  <button class="btn btn-sm btn-outline-info rounded-pill" (click)="verJsonTrama()">
                    <i class="bi bi-filetype-json me-1"></i>Ver JSON Ejemplo
                  </button>
                  <button class="btn btn-sm btn-outline-warning rounded-pill" (click)="verXmlTrama()">
                    <i class="bi bi-filetype-xml me-1"></i>Ver XML Ejemplo
                  </button>
                </div>
              </div>
            </div>

            <!-- FORMULARIO DETALLE DE CONFIGURACIÓN DEL CAMPO SELECCIONADO -->
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden" *ngIf="selectedField">
              <div class="card-header bg-light border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold text-dark mb-0"><i class="bi bi-gear-fill text-secondary me-2"></i>Configuración del Campo: <code>{{ selectedField.name }}</code></h5>
                <button class="btn btn-sm btn-primary px-3 rounded-pill" (click)="guardarCambiosField()">
                  <i class="bi bi-check-lg me-1"></i>Guardar Campo
                </button>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <!-- Nombre del campo -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Nombre Técnico del Campo</label>
                    <input type="text" class="form-control" [(ngModel)]="selectedField.name">
                  </div>
                  <!-- Criterio Asignación default -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Criterio Asignación Default</label>
                    <select class="form-select" [(ngModel)]="selectedField.defaultAssignment">
                      <option value="ASIGNAR SIEMPRE">ASIGNAR SIEMPRE</option>
                      <option value="ASIGNAR SI TIENE VALOR">ASIGNAR SI TIENE VALOR</option>
                      <option value="NO ASIGNAR">NO ASIGNAR</option>
                    </select>
                  </div>

                  <!-- Valor default -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Valor Default</label>
                    <input type="text" class="form-control" [(ngModel)]="selectedField.defaultValue" placeholder="ej: M o F">
                  </div>
                  <!-- Select / Consulta -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Select / Consulta Origen</label>
                    <input type="text" class="form-control" [(ngModel)]="selectedField.selectQuery" placeholder="SELECT valor FROM tabla WHERE ...">
                  </div>

                  <!-- Ocurrencia Máxima -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Ocurrencia Máxima</label>
                    <div class="input-group">
                      <select class="form-select" style="max-width: 140px;" [(ngModel)]="selectedField.maxOccurrenceAction">
                        <option value="NO NECESITA">NO NECESITA</option>
                        <option value="OPCIONAL">OPCIONAL</option>
                        <option value="REQUERIDO">REQUERIDO</option>
                      </select>
                      <input type="number" class="form-control" [(ngModel)]="selectedField.maxOccurrenceNumber" placeholder="Número">
                    </div>
                  </div>

                  <!-- Ocurrencia Mínima -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Ocurrencia Mínima</label>
                    <div class="input-group">
                      <select class="form-select" style="max-width: 140px;" [(ngModel)]="selectedField.minOccurrenceAction">
                        <option value="NO NECESITA">NO NECESITA</option>
                        <option value="OPCIONAL">OPCIONAL</option>
                        <option value="REQUERIDO">REQUERIDO</option>
                      </select>
                      <input type="number" class="form-control" [(ngModel)]="selectedField.minOccurrenceNumber" placeholder="Número">
                    </div>
                  </div>

                  <!-- Checkboxes Adicionales (Configuración avanzada del campo) -->
                  <div class="col-12 border-top mt-3 pt-3">
                    <h6 class="fw-bold mb-3 text-muted">Configuraciones Especiales</h6>
                    <div class="row g-2">
                      <div class="col-md-6">
                        <div class="form-check form-switch py-1">
                          <input class="form-check-input" type="checkbox" id="checkSpecial" [(ngModel)]="selectedField.encodeSpecialChars">
                          <label class="form-check-label fw-semibold" for="checkSpecial">¿Codificar caracteres especiales en valor? (&, <, >, ", ')</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check form-switch py-1">
                          <input class="form-check-input" type="checkbox" id="checkCdata" [(ngModel)]="selectedField.includeCdata">
                          <label class="form-check-label fw-semibold" for="checkCdata">¿Incluir CDATA?</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check form-switch py-1">
                          <input class="form-check-input" type="checkbox" id="checkBase64" [(ngModel)]="selectedField.transformBase64">
                          <label class="form-check-label fw-semibold" for="checkBase64">¿Transformar archivo a bytes base 64?</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check form-switch py-1">
                          <input class="form-check-input" type="checkbox" id="checkOmitNull" [(ngModel)]="selectedField.omitIfNull">
                          <label class="form-check-label fw-semibold" for="checkOmitNull">¿Omitir en la trama si campo tiene valor nulo o vacío?</label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Si no hay campo seleccionado -->
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted" *ngIf="!selectedField">
              <i class="bi bi-arrow-left-circle display-4 mb-2 text-muted"></i>
              <h5>Ningún Campo Seleccionado</h5>
              <p class="mb-0">Haz clic en cualquier nodo del árbol de tramas de la izquierda para configurar su asignación y propiedades avanzadas.</p>
            </div>

          </div>
        </div>

      </div>

      <!-- ========================================== -->
      <!-- MODAL EDICIÓN PROCESO SISTEMAS EXTERNOS    -->
      <!-- ========================================== -->
      <div class="modal fade show d-block" *ngIf="mostrarModalProceso && selectedProcess" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-primary text-white py-3">
              <h5 class="modal-title fw-bold"><i class="bi bi-share me-2"></i>Proceso Sistema Externos</h5>
              <button type="button" class="btn-close btn-close-white" (click)="mostrarModalProceso = false"></button>
            </div>
            
            <div class="modal-body p-4">
              <!-- NAV TABS MODAL (Información general / Configuración avanzada) -->
              <ul class="nav nav-tabs mb-4" id="modalProcessTabs" role="tablist">
                <li class="nav-item">
                  <button class="nav-link active fw-bold" id="info-tab" data-bs-toggle="tab" type="button" role="tab" aria-selected="true">
                    Información general
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link fw-bold text-muted" id="adv-tab" data-bs-toggle="tab" type="button" role="tab" aria-selected="false">
                    Configuración avanzada
                  </button>
                </li>
              </ul>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Código</label>
                  <input type="text" class="form-control" [(ngModel)]="selectedProcess.code" placeholder="ej: INB30">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Descripción</label>
                  <input type="text" class="form-control" [(ngModel)]="selectedProcess.description" placeholder="ej: INB_ACTUALIZAR CLIENTE">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tipo referencia</label>
                  <select class="form-select" [(ngModel)]="selectedProcess.referenceType">
                    <option value="CASO">CASO</option>
                    <option value="CI">CI - Cédula de Identidad</option>
                    <option value="RUC">RUC - Registro Único de Contribuyentes</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tipo proceso</label>
                  <select class="form-select" [(ngModel)]="selectedProcess.processType">
                    <option value="WEB API REST">WEB API REST</option>
                    <option value="GENERACION TRAMA XML/TABLAS">GENERACION TRAMA XML/TABLAS</option>
                    <option value="SERVICIO SOAP EXPLICITO">SERVICIO SOAP EXPLICITO</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label fw-semibold">Tipos trama</label>
                  <select class="form-select" [(ngModel)]="selectedProcess.tramaTypes">
                    <option value="INPUT, OUTPUT">INPUT, OUTPUT</option>
                    <option value="INPUT ONLY">INPUT ONLY</option>
                    <option value="OUTPUT ONLY">OUTPUT ONLY</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-outline-secondary px-4 rounded-pill" (click)="mostrarModalProceso = false">Cancelar</button>
              <button type="button" class="btn btn-primary px-4 rounded-pill" (click)="guardarProceso()">Guardar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL ANTERIOR EDICIÓN CONECTOR REST       -->
      <!-- ========================================== -->
      <div class="modal fade show d-block" *ngIf="mostrarModalConector" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title fw-bold">Configurar Conector REST</h5>
              <button type="button" class="btn-close btn-close-white" (click)="mostrarModalConector = false"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Nombre del Conector (Key)</label>
                  <input type="text" class="form-control" [(ngModel)]="selectedApi.name" placeholder="ej: consulta_sri">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Método HTTP</label>
                  <select class="form-select" [(ngModel)]="selectedApi.method">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold">URL del Endpoint (Soporta {{ '$' }}{{ '{' }}variable{{ '}' }})</label>
                  <input type="text" class="form-control" [(ngModel)]="selectedApi.url" placeholder="https://api.ejemplo.com/v1/recurso/ID">
                </div>
                <div class="col-12" *ngIf="selectedApi.method !== 'GET'">
                  <label class="form-label fw-bold">Cuerpo de la Petición (JSON Template)</label>
                  <textarea class="form-control font-monospace small" [(ngModel)]="selectedApi.bodyTemplate" rows="4" placeholder='{ "codigo": "VALOR" }'></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-outline-secondary px-4" (click)="mostrarModalConector = false">Cancelar</button>
              <button type="button" class="btn btn-primary px-4" (click)="guardarConector()">Guardar Cambios</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL DE SIMULACIÓN / VISTA TRAMA GENERADA -->
      <!-- ========================================== -->
      <div class="modal fade show d-block" *ngIf="mostrarModalSimulacion" tabindex="-1" style="background: rgba(0,0,0,0.65);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header" [ngClass]="modoSimulacion === 'JSON' ? 'bg-info text-dark' : 'bg-warning text-dark'">
              <h5 class="modal-title fw-bold">
                <i class="bi" [ngClass]="modoSimulacion === 'JSON' ? 'bi-filetype-json' : 'bi-filetype-xml'"></i>
                Trama Generada de Ejemplo (Simulada - {{ modoSimulacion }})
              </h5>
              <button type="button" class="btn-close" (click)="mostrarModalSimulacion = false"></button>
            </div>
            <div class="modal-body p-4 bg-dark">
              <pre class="text-light mb-0" style="max-height: 400px; overflow: auto; font-family: monospace;"><code>{{ codigoSimulado }}</code></pre>
            </div>
            <div class="modal-footer bg-light border-0">
              <button class="btn btn-outline-dark px-4 rounded-pill" (click)="mostrarModalSimulacion = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .fs-7 { font-size: 0.8rem; }
    .hover-bg:hover { background-color: rgba(13, 110, 253, 0.05); }
    .opacity-hover { opacity: 0.7; transition: opacity 0.2s; }
    .opacity-hover:hover { opacity: 1; }
    .transition-all { transition: all 0.2s ease-in-out; }
    .hover-row:hover { background-color: rgba(0,0,0,0.01); }
  `]
})
export class ApiManagerComponent implements OnInit {
  private apiService = inject(ApiManagerService);
  
  // Estados de vista
  vistaActiva: 'procesos' | 'conectores' | 'tramas' = 'procesos';
  
  // Colecciones
  apis: ApiDefinition[] = [];
  procesos: ExternalProcess[] = [];
  tramas: TramaField[] = [];
  
  // Selección e inputs
  selectedApi: ApiDefinition = { name: '', url: '', method: 'GET' };
  selectedProcess: ExternalProcess | null = null;
  selectedField: TramaField | null = null;
  
  // Control de Modales
  mostrarModalConector = false;
  mostrarModalProceso = false;
  mostrarModalSimulacion = false;
  
  // Filtros de Trama
  sistemaSeleccionado = 'LYNKO';
  tipoTramaSeleccionada = 'INPUT';
  
  // Simulación
  modoSimulacion = 'JSON';
  codigoSimulado = '';

  ngOnInit() {
    this.cargarApis();
    this.cargarProcesos();
  }

  cargarApis() {
    this.apiService.getDefinitions().subscribe(data => this.apis = data);
  }

  cargarProcesos() {
    this.apiService.getProcesses().subscribe(data => this.procesos = data);
  }

  // ==========================================
  // MÉTODOS CRUD CONECTORES REST
  // ==========================================
  abrirModalConector() {
    this.selectedApi = { name: '', url: '', method: 'GET' };
    this.mostrarModalConector = true;
  }

  editarApi(api: ApiDefinition) {
    this.selectedApi = { ...api };
    this.mostrarModalConector = true;
  }

  guardarConector() {
    this.apiService.saveDefinition(this.selectedApi).subscribe(() => {
      this.mostrarModalConector = false;
      this.cargarApis();
    });
  }

  probarApi(api: ApiDefinition) {
    const vars = prompt('Ingresa variables de prueba (JSON):', '{ "id": "123" }');
    if (vars) {
      try {
        const json = JSON.parse(vars);
        this.apiService.testApi(api.name, json).subscribe({
          next: (res) => alert('Respuesta: ' + JSON.stringify(res, null, 2)),
          error: (err) => alert('Error: ' + JSON.stringify(err.error || err.message))
        });
      } catch (e) { alert('JSON inválido'); }
    }
  }

  getMethodClass(method: string) {
    switch (method) {
      case 'GET': return 'bg-success-subtle text-success border border-success-subtle';
      case 'POST': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'PUT': return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'DELETE': return 'bg-danger-subtle text-danger border border-danger-subtle';
      default: return 'bg-light';
    }
  }

  // ==========================================
  // MÉTODOS CRUD PROCESOS EXTERNOS
  // ==========================================
  abrirModalProceso() {
    this.selectedProcess = { code: '', description: '', referenceType: 'CASO', processType: 'WEB API REST', tramaTypes: 'INPUT, OUTPUT', systemName: 'LYNKO' };
    this.mostrarModalProceso = true;
  }

  editarProceso(p: ExternalProcess) {
    this.selectedProcess = { ...p };
    this.mostrarModalProceso = true;
  }

  guardarProceso() {
    if (this.selectedProcess) {
      this.apiService.saveProcess(this.selectedProcess).subscribe(() => {
        this.mostrarModalProceso = false;
        this.cargarProcesos();
      });
    }
  }

  eliminarProceso(p: ExternalProcess) {
    if (p.id && confirm('¿Estás seguro de que deseas eliminar este proceso y todas sus tramas configuradas?')) {
      this.apiService.deleteProcess(p.id).subscribe(() => {
        this.cargarProcesos();
      });
    }
  }

  guardarCambiosProcesoRapido() {
    if (this.selectedProcess) {
      this.selectedProcess.systemName = this.sistemaSeleccionado;
      this.apiService.saveProcess(this.selectedProcess).subscribe();
    }
  }

  // ==========================================
  // CONFIGURACIÓN DE TRAMAS (VISTA TREEVIEW)
  // ==========================================
  configurarTramas(p: ExternalProcess) {
    this.selectedProcess = p;
    this.sistemaSeleccionado = p.systemName || 'LYNKO';
    this.tipoTramaSeleccionada = 'INPUT';
    this.selectedField = null;
    this.vistaActiva = 'tramas';
    this.cargarTramasActuales();
  }

  regresarAProcesos() {
    this.selectedProcess = null;
    this.selectedField = null;
    this.vistaActiva = 'procesos';
    this.cargarProcesos();
  }

  cargarTramasActuales() {
    if (this.selectedProcess && this.selectedProcess.id) {
      this.apiService.getTramas(this.selectedProcess.id, this.tipoTramaSeleccionada).subscribe(data => {
        this.tramas = data;
        if (this.tramas.length > 0) {
          this.selectedField = this.tramas[0];
        } else {
          this.selectedField = null;
        }
      });
    }
  }

  onCambiarTipoTrama() {
    this.selectedField = null;
    this.cargarTramasActuales();
  }

  seleccionarField(field: TramaField) {
    this.selectedField = { ...field };
  }

  guardarCambiosField() {
    if (this.selectedField) {
      this.apiService.saveTramaField(this.selectedField).subscribe(saved => {
        const index = this.tramas.findIndex(f => f.id === saved.id);
        if (index !== -1) {
          this.tramas[index] = saved;
        } else {
          this.tramas.push(saved);
        }
        this.selectedField = { ...saved };
        alert('Campo guardado con éxito');
      });
    }
  }

  // ÁRBOL COMPUTADO
  get ArbolAplanado(): { node: TramaField, level: number }[] {
    const list: { node: TramaField, level: number }[] = [];
    const nodes = this.tramas;
    
    const traverse = (parentId: number | null | undefined, level: number) => {
      const children = nodes.filter(n => n.parentId === parentId);
      children.forEach(c => {
        list.push({ node: c, level });
        traverse(c.id, level + 1);
      });
    };

    const ids = nodes.map(n => n.id);
    const roots = nodes.filter(n => !n.parentId || !ids.includes(n.parentId));
    
    roots.forEach(r => {
      list.push({ node: r, level: 0 });
      traverse(r.id, 1);
    });

    return list;
  }

  // ACCIONES EN EL ÁRBOL
  agregarCampoRaiz() {
    if (!this.selectedProcess || !this.selectedProcess.id) return;
    const name = prompt('Nombre del nuevo campo raíz:');
    if (name) {
      const field: TramaField = {
        processId: this.selectedProcess.id,
        tramaType: this.tipoTramaSeleccionada,
        name: name,
        parentId: null,
        defaultAssignment: 'ASIGNAR SIEMPRE',
        encodeSpecialChars: true,
        includeCdata: false,
        transformBase64: false,
        omitIfNull: false
      };
      this.apiService.saveTramaField(field).subscribe(saved => {
        this.tramas.push(saved);
        this.selectedField = saved;
      });
    }
  }

  agregarHijo(parent: TramaField) {
    if (!this.selectedProcess || !this.selectedProcess.id) return;
    const name = prompt(`Nombre del nuevo campo hijo de ${parent.name}:`);
    if (name) {
      const field: TramaField = {
        processId: this.selectedProcess.id,
        tramaType: this.tipoTramaSeleccionada,
        name: name,
        parentId: parent.id,
        defaultAssignment: 'ASIGNAR SIEMPRE',
        encodeSpecialChars: true,
        includeCdata: false,
        transformBase64: false,
        omitIfNull: false
      };
      this.apiService.saveTramaField(field).subscribe(saved => {
        this.tramas.push(saved);
        this.selectedField = saved;
      });
    }
  }

  eliminarField(field: TramaField) {
    if (field.id && confirm(`¿Estás seguro de que deseas eliminar el campo ${field.name} y todos sus campos descendientes?`)) {
      this.apiService.deleteTramaField(field.id).subscribe(() => {
        this.cargarTramasActuales();
      });
    }
  }

  // ==========================================
  // SIMULACIONES DE TRAMA GENERADA (JSON/XML)
  // ==========================================
  verJsonTrama() {
    this.modoSimulacion = 'JSON';
    this.codigoSimulado = this.generarJsonEjemplo();
    this.mostrarModalSimulacion = true;
  }

  verXmlTrama() {
    this.modoSimulacion = 'XML';
    this.codigoSimulado = this.generarXmlEjemplo();
    this.mostrarModalSimulacion = true;
  }

  generarJsonEjemplo(): string {
    if (!this.selectedProcess || this.tramas.length === 0) return '{}';
    const nodes = this.tramas;
    const ids = nodes.map(n => n.id);
    const roots = nodes.filter(n => !n.parentId || !ids.includes(n.parentId));
    
    const buildObj = (node: TramaField): any => {
      const children = nodes.filter(n => n.parentId === node.id);
      if (children.length === 0) {
        return node.defaultValue || `[${node.name}]`;
      }
      const obj: any = {};
      children.forEach(c => {
        obj[c.name] = buildObj(c);
      });
      return obj;
    };

    const rootObj: any = {};
    roots.forEach(rn => {
      rootObj[rn.name] = buildObj(rn);
    });

    return JSON.stringify(rootObj, null, 2);
  }

  generarXmlEjemplo(): string {
    if (!this.selectedProcess || this.tramas.length === 0) return '';
    const nodes = this.tramas;
    const ids = nodes.map(n => n.id);
    const roots = nodes.filter(n => !n.parentId || !ids.includes(n.parentId));

    const buildXml = (node: TramaField, indent: string): string => {
      const children = nodes.filter(n => n.parentId === node.id);
      if (children.length === 0) {
        const val = node.defaultValue || '';
        return `${indent}<${node.name}>${val}</${node.name}>\n`;
      }
      let xml = `${indent}<${node.name}>\n`;
      children.forEach(c => {
        xml += buildXml(c, indent + '  ');
      });
      xml += `${indent}</${node.name}>\n`;
      return xml;
    };

    let fullXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    roots.forEach(rn => {
      fullXml += buildXml(rn, '');
    });
    return fullXml;
  }
}
