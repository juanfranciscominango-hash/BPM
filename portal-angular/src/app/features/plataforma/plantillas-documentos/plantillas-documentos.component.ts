import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentDefinition } from '../../../core/services/document.service';
import { ProcessService, ProcessDefinition } from '../../../core/services/process.service';
import { ScreenService } from '../../../core/services/screen.service';
import { MetaService } from '../../../core/services/meta.service';

@Component({
  selector: 'app-plantillas-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4" style="max-width: 1400px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 text-primary fw-bold"><i class="bi bi-file-earmark-richtext me-2"></i>Gestión de Plantillas Maestras</h2>
          <p class="text-muted">Mapeo Estilo Bizagi: Carga plantillas (Word), detecta Tags dinámicos y mapea con datos del proceso.</p>
        </div>
        <button class="btn btn-primary shadow-sm" (click)="nuevaPlantilla()">
          <i class="bi bi-plus-lg me-1"></i>Nueva Plantilla / Requisito
        </button>
      </div>

      <div class="row">
        <!-- Panel Izquierdo: Lista de Documentos -->
        <div class="col-md-3">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-light fw-bold"><i class="bi bi-diagram-2 me-2"></i>Proceso</div>
            <div class="card-body">
              <select class="form-select" [(ngModel)]="selectedProcessKey" (change)="cargar()">
                <option *ngFor="let p of processes" [value]="p.key">{{ p.name }}</option>
              </select>
            </div>
          </div>

          <div class="list-group shadow-sm border-0 mb-4">
            <button *ngFor="let def of definitions" 
                    class="list-group-item list-group-item-action border-0 border-bottom"
                    [class.active]="selectedDef?.id === def.id"
                    (click)="seleccionar(def)">
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1 fw-bold">{{ def.name }}</h6>
                <span class="badge" [ngClass]="def.isTemplate ? 'bg-primary' : 'bg-secondary'">
                  {{ def.isTemplate ? 'Plantilla' : 'Subida' }}
                </span>
              </div>
              <small class="text-truncate d-block">{{ def.description || 'Sin descripción' }}</small>
            </button>
          </div>
        </div>

        <!-- Panel Derecho: Editor y Mapeo -->
        <div class="col-md-9" *ngIf="selectedDef">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <span class="fw-bold fs-5 text-dark">Configuración: {{ selectedDef.name }}</span>
              <button class="btn btn-success shadow-sm px-4 fw-semibold" (click)="guardar()">
                <i class="bi bi-save me-1"></i> Guardar Cambios
              </button>
            </div>
            <div class="card-body p-4">
              
              <!-- Datos Básicos -->
              <h6 class="fw-bold text-primary mb-3"><i class="bi bi-info-circle me-2"></i>Información General</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Nombre del Documento</label>
                  <input type="text" class="form-control bg-light" [(ngModel)]="selectedDef.name">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Tipo de Documento</label>
                  <select class="form-select bg-light" [(ngModel)]="selectedDef.isTemplate">
                    <option [ngValue]="false">Requisito de Subida (Físico)</option>
                    <option [ngValue]="true">Plantilla de Generación Mapeada</option>
                  </select>
                </div>
                <div class="col-md-4" *ngIf="selectedDef.isTemplate">
                  <label class="form-label small fw-bold text-muted">Formato de Exportación</label>
                  <select class="form-select bg-light" [(ngModel)]="selectedDef.exportFormat">
                    <option value="PDF">PDF (*.pdf)</option>
                    <option value="DOCX">Word (*.docx)</option>
                    <option value="XLSX">Excel (*.xlsx)</option>
                    <option value="HTML">HTML (*.html)</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">Descripción / Instrucciones</label>
                  <textarea class="form-control bg-light" [(ngModel)]="selectedDef.description" rows="2"></textarea>
                </div>
              </div>

              <!-- Sección de Mapeo (Solo si es plantilla) -->
              <ng-container *ngIf="selectedDef.isTemplate">
                <hr class="text-muted opacity-25 my-4">
                <div class="d-flex justify-content-between align-items-end mb-3">
                  <h6 class="fw-bold text-primary mb-0"><i class="bi bi-bezier2 me-2"></i>Configuración de Mapeo (Datos del Sistema)</h6>
                </div>

                <div class="row g-4">
                  <!-- Columna: Cargar Plantilla -->
                  <div class="col-md-12">
                    <div class="p-4 bg-light border rounded-4 border-primary border-opacity-25 border-2 border-dashed text-center position-relative">
                      <i class="bi bi-cloud-arrow-up text-primary" style="font-size: 2rem;"></i>
                      <h6 class="mt-2 fw-bold text-dark">Subir Archivo de Plantilla Maestro (Word / Excel)</h6>
                      <p class="small text-muted mb-3">Sube tu documento con etiquetas en formato &lt;NombreTag&gt; para extraerlas automáticamente.</p>
                      
                      <input type="file" class="form-control w-50 mx-auto" accept=".docx,.xlsx" (change)="onFileSelected($event)">
                      
                      <div class="mt-3" *ngIf="selectedDef.templatePath">
                        <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                          <i class="bi bi-check-circle-fill me-1"></i> Plantilla cargada: {{ selectedDef.templatePath }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Columna: Tabla de Mapeo (Bizagi Data <-> Tags) -->
                  <div class="col-md-12" *ngIf="extractedTags.length > 0 || (mappingData && objectKeys(mappingData).length > 0)">
                    <div class="card border-0 shadow-sm">
                      <div class="card-header bg-primary text-white py-2 d-flex justify-content-between align-items-center">
                        <span class="fw-semibold"><i class="bi bi-link-45deg me-1"></i> Vinculación de Tags Dinámicos</span>
                        <span class="badge bg-white text-primary">{{ objectKeys(mappingData).length }} Tags Detectados</span>
                      </div>
                      <div class="card-body p-0">
                        <table class="table table-hover mb-0 align-middle">
                          <thead class="table-light text-muted small text-uppercase">
                            <tr>
                              <th class="ps-4" style="width: 45%;">Tags de Plantilla (Documento)</th>
                              <th class="text-center" style="width: 10%;"><i class="bi bi-arrow-left-right text-primary"></i></th>
                              <th class="pe-4" style="width: 45%;">Datos del Sistema (Campo de Base de Datos)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let tag of objectKeys(mappingData)">
                              <td class="ps-4">
                                <div class="d-flex align-items-center">
                                  <div class="badge bg-light text-primary border border-primary rounded px-2 py-1 me-2 fw-bold font-monospace" style="font-size: 0.9em;">
                                    &lt;{{ tag }}&gt;
                                  </div>
                                </div>
                              </td>
                              <td class="text-center text-muted">
                                <i class="bi bi-link" [ngClass]="mappingData[tag] ? 'text-success fw-bold' : 'opacity-25'"></i>
                              </td>
                              <td class="pe-4">
                                <input [attr.list]="'fields-list'" 
                                       class="form-control form-select-sm" 
                                       [(ngModel)]="mappingData[tag]" 
                                       [ngClass]="{'border-success bg-success bg-opacity-10': mappingData[tag]}"
                                       placeholder="Buscar tabla o campo de base de datos...">
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <datalist id="fields-list">
                      <option *ngFor="let field of bizagiData" [value]="field.id">
                        {{ field.group }} > {{ field.label }} ({{ field.id }})
                      </option>
                    </datalist>
                  </div>

                  <!-- Fallback: si no hay tags -->
                  <div class="col-md-12" *ngIf="extractedTags.length === 0 && (!mappingData || objectKeys(mappingData).length === 0)">
                    <div class="alert alert-info border-0 d-flex align-items-center mb-0">
                      <i class="bi bi-info-circle-fill fs-4 me-3"></i>
                      <div>Sube una plantilla DOCX para detectar etiquetas dinámicas automáticamente.</div>
                    </div>
                  </div>

                </div>
              </ng-container>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlantillasDocumentosComponent implements OnInit {
  private documentService = inject(DocumentService);
  private processService = inject(ProcessService);
  private screenService = inject(ScreenService);
  private metaService = inject(MetaService);

  processes: ProcessDefinition[] = [];
  selectedProcessKey: string = '';
  definitions: DocumentDefinition[] = [];
  selectedDef: DocumentDefinition | null = null;

  // Variables for Bizagi-style mapping
  bizagiData: { id: string, label: string, group: string }[] = [];
  groupedBizagiData: Record<string, { id: string, label: string }[]> = {};
  
  extractedTags: string[] = [];
  mappingData: Record<string, string> = {};

  // Utility for template iteration
  objectKeys = Object.keys;

  ngOnInit() {
    this.processService.getProcesses().subscribe(data => {
      this.processes = data;
      if (data.length > 0) {
        this.selectedProcessKey = data[0].key;
        this.cargar();
      }
    });
  }

  cargar() {
    this.cargarCamposProceso();
    this.documentService.getDefinitions(this.selectedProcessKey).subscribe(data => {
      this.definitions = data;
      this.selectedDef = null;
    });
  }

  cargarCamposProceso() {
    this.metaService.listarEntidades().subscribe(entities => {
      this.bizagiData = [];
      this.groupedBizagiData = {};
      
      entities.forEach(entity => {
        const groupName = entity.label || entity.name;
        this.groupedBizagiData[groupName] = [];
        
        this.metaService.getPhysicalTableColumns(entity.id!).subscribe(cols => {
          cols.forEach(c => {
            const fieldId = entity.name + '.' + c.name;
            const field = {
              id: fieldId,
              label: c.name
            };
            this.bizagiData.push({
              id: fieldId,
              label: c.name,
              group: groupName
            });
            this.groupedBizagiData[groupName].push(field);
          });
        });
      });
    });
  }

  seleccionar(def: DocumentDefinition) {
    this.selectedDef = { ...def };
    this.mappingData = {};
    this.extractedTags = [];

    // Parse existing mapping
    if (this.selectedDef.mappingJson) {
      try {
        this.mappingData = JSON.parse(this.selectedDef.mappingJson);
        this.extractedTags = Object.keys(this.mappingData);
      } catch (e) {}
    }
  }

  nuevaPlantilla() {
    this.selectedDef = {
      name: 'Nueva Plantilla (Word/Excel)',
      description: '',
      processKey: this.selectedProcessKey,
      isTemplate: true,
      exportFormat: 'PDF',
      required: true
    };
    this.mappingData = {};
    this.extractedTags = [];
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Upload File to backend
    if (this.selectedDef) {
       this.documentService.uploadTemplate(file).subscribe({
         next: (path) => {
           if (this.selectedDef) {
             this.selectedDef.templatePath = path;
             console.log('Archivo subido a:', path);
           }
         },
         error: (err) => {
           console.error('Error al subir archivo', err);
           alert('Ocurrió un error al subir el archivo al servidor.');
         }
       });
    }

    if (file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // @ts-ignore
        const mammoth = await import('mammoth/mammoth.browser');
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        const text = result.value;
        
        this.processExtractedText(text);
      } catch (err) {
        console.error('Error procesando DOCX con Mammoth', err);
        alert('Ocurrió un error al leer el archivo DOCX.');
      }
    } else if (file.name.endsWith('.xlsx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // @ts-ignore
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        let allText = '';
        workbook.SheetNames.forEach((sheetName: string) => {
           const worksheet = workbook.Sheets[sheetName];
           const csv = XLSX.utils.sheet_to_csv(worksheet);
           allText += csv + '\n';
        });
        
        this.processExtractedText(allText);
      } catch (err) {
        console.error('Error procesando XLSX con SheetJS', err);
        alert('Ocurrió un error al leer el archivo XLSX.');
      }
    } else {
      alert('Solo se soporta la detección automática de tags en archivos .docx y .xlsx por ahora.');
    }
  }

  processExtractedText(text: string) {
    const regex = /<([^>]+)>/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      const tag = match[1].trim();
      if (tag.length > 0 && tag.length < 50) { // basic validation
         matches.add(tag);
      }
    }
    
    const newTags = Array.from(matches);
    this.extractedTags = newTags;
    
    // Preserve existing mapping if possible, add new ones
    const newMappingData: Record<string, string> = {};
    newTags.forEach(t => {
      newMappingData[t] = this.mappingData[t] || '';
    });
    this.mappingData = newMappingData;
  }

  guardar() {
    if (this.selectedDef) {
      // Serialize mapping
      this.selectedDef.mappingJson = JSON.stringify(this.mappingData);
      
      this.documentService.saveDefinition(this.selectedDef).subscribe(() => {
        alert('Configuración y mapeo guardados con éxito');
        this.cargar();
      });
    }
  }
}
