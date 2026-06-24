import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
// @ts-ignore
import BpmnModeler from 'bpmn-js/lib/Modeler';

// BPMN Properties Panel
// @ts-ignore
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';
// @ts-ignore
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';

import { ProcessService, ProcessDefinition } from '../../../core/services/process.service';
import { MetaService, MetaEntity } from '../../../core/services/meta.service';
import { SecurityService, Role } from '../../../core/services/security.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-disenador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="designer-container-full">
      <div class="designer-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center shadow-sm">
        <div>
          <h2 class="h4 mb-0 text-primary fw-bold"><i class="bi bi-diagram-3-fill me-2"></i>Diseñador de Flujos BPMN 2.0</h2>
          <div class="d-flex align-items-center mt-1">
            <small class="text-muted me-3" *ngIf="currentProcessId">Editando: <span class="fw-bold">{{ formatName(currentProcessName) }}</span></small>
            <div class="input-group input-group-sm" style="width: 300px;">
              <span class="input-group-text bg-light text-muted"><i class="bi bi-table me-1"></i>Tabla Virtual:</span>
              <select class="form-select border-primary-subtle" [(ngModel)]="selectedMetaEntityId">
                <option [ngValue]="null">-- Sin vincular --</option>
                <option *ngFor="let ent of metaEntities" [ngValue]="ent.id">{{ ent.label }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="actions">
            <input type="file" #fileInput style="display: none;" accept=".bpmn,.xml" (change)="importFile($event)">
            <button class="btn btn-outline-secondary me-2" (click)="fileInput.click()">
              <i class="bi bi-upload me-1"></i>Importar BPMN
            </button>
            <button class="btn btn-outline-secondary me-2" (click)="exportXml()">
              <i class="bi bi-filetype-xml me-1"></i>Exportar BPMN
            </button>
            <button class="btn btn-primary shadow-sm px-4" (click)="saveProcess(true)">
            <i class="bi bi-cloud-upload me-1"></i>Guardar y Desplegar
          </button>
          <button class="btn btn-outline-primary shadow-sm px-4 ms-2" (click)="saveProcess(false)">
            <i class="bi bi-save me-1"></i>Solo Guardar
          </button>
        </div>
      </div>
      <div class="designer-main">
        <div #canvas class="canvas-container"></div>
        
        <!-- Panel de Asignación de Roles (Estilo Bizagi) -->
        <div class="role-assignment-panel shadow" *ngIf="selectedUserTask" [style.left.px]="panelLeft" [style.top.px]="panelTop">
          <div class="card border-0">
            <div class="card-header bg-primary text-white py-2 d-flex justify-content-between align-items-center" style="cursor: move; user-select: none;" (mousedown)="onDragStart($event)">
              <h6 class="mb-0 fw-bold"><i class="bi bi-person-fill-gear me-2"></i>Asignar Participante</h6>
              <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="selectedUserTask = null" style="font-size: 0.8rem; cursor: pointer;"></button>
            </div>
            <div class="card-body p-3">
              <label class="form-label small fw-bold text-muted">Asignar Rol a la Tarea:</label>
              <select class="form-select" [(ngModel)]="selectedRole" (change)="updateTaskRole()">
                <option value="">-- Sin Rol (Cualquiera) --</option>
                <option *ngFor="let r of systemRoles" [value]="r.name">{{ r.name }}</option>
              </select>
              <div class="form-text small mt-2">
                Los usuarios con este rol podrán ver y ejecutar esta tarea en su bandeja.
              </div>
            </div>
          </div>
        </div>

        <!-- Botón para colapsar panel de propiedades -->
        <button class="properties-toggle-btn shadow" 
                (click)="propertiesPanelCollapsed = !propertiesPanelCollapsed" 
                [class.collapsed]="propertiesPanelCollapsed"
                title="Mostrar/Ocultar Propiedades">
          <i class="bi" [class.bi-chevron-left]="!propertiesPanelCollapsed" [class.bi-chevron-right]="propertiesPanelCollapsed"></i>
        </button>

        <div class="properties-wrapper" [class.collapsed]="propertiesPanelCollapsed">
          <div #propertiesPanel class="properties-container"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
    }
    .designer-container-full {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
    }
    .designer-header {
      z-index: 100;
    }
    .designer-main {
      flex-grow: 1;
      display: flex;
      overflow: hidden;
      position: relative;
    }
    .canvas-container {
      flex-grow: 1;
      height: 100%;
    }
    .properties-wrapper {
      width: 350px;
      height: 100%;
      border-left: 1px solid #ddd;
      background: #fdfdfd;
      transition: width 0.3s ease;
      overflow: hidden;
      position: relative;
    }
    .properties-wrapper.collapsed {
      width: 0;
      border-left: none;
    }
    .properties-container {
      width: 350px;
      height: 100%;
      overflow-y: auto;
    }
    .properties-toggle-btn {
      position: absolute;
      right: 350px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 48px;
      background: white;
      border: 1px solid #ddd;
      border-right: none;
      border-radius: 8px 0 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1010;
      transition: right 0.3s ease;
    }
    .properties-toggle-btn.collapsed {
      right: 0;
    }
    .role-assignment-panel {
      position: absolute;
      width: 350px;
      z-index: 1000;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
    }
    :host ::ng-deep .bjs-powered-by {
      display: none;
    }
    :host ::ng-deep .djs-palette {
      left: 20px;
      top: 20px;
      border-radius: 8px;
    }
  `]
})
export class DisenadorComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef;
  @ViewChild('propertiesPanel', { static: true }) private propertiesPanelRef!: ElementRef;
  private bpmnModeler!: any;
  private processService = inject(ProcessService);
  private metaService = inject(MetaService);
  private securityService = inject(SecurityService);
  private route = inject(ActivatedRoute);

  currentProcessId: number | null = null;
  currentProcessName: string = '';
  propertiesPanelCollapsed: boolean = false;

  formatName(name: string | undefined): string {
    if (!name) return '';
    return name.replace(/\s*\(?Bizagi\)?/gi, '');
  }

  metaEntities: MetaEntity[] = [];
  selectedMetaEntityId: number | null = null;

  systemRoles: Role[] = [];
  selectedUserTask: any = null;
  selectedRole: string = '';

  // Propiedades para arrastrar (Drag & Drop)
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  panelLeft = window.innerWidth / 2 - 175;
  panelTop = 150;

  @HostListener('document:mousemove', ['$event'])
  onDragMove(event: MouseEvent) {
    if (this.isDragging) {
      this.panelLeft = event.clientX - this.dragStartX;
      this.panelTop = event.clientY - this.dragStartY;
    }
  }

  @HostListener('document:mouseup')
  onDragEnd() {
    this.isDragging = false;
  }

  onDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.panelLeft;
    this.dragStartY = event.clientY - this.panelTop;
    event.preventDefault();
  }

  private initialXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

  ngOnInit() {
    this.loadMetaEntities();
    this.bpmnModeler = new BpmnModeler({
      container: this.canvasRef.nativeElement,
      propertiesPanel: {
        parent: this.propertiesPanelRef.nativeElement
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      },
      keyboard: {
        bindTo: window
      }
    });

    this.bpmnModeler.on('selection.changed', (e: any) => {
      const selection = e.newSelection;
      if (selection && selection.length === 1 && selection[0].type === 'bpmn:UserTask') {
        this.selectedUserTask = selection[0];
        const bo = this.selectedUserTask.businessObject;
        // Check for either camunda:candidateGroups or flowable:candidateGroups
        this.selectedRole = bo.get('camunda:candidateGroups') || bo.get('flowable:candidateGroups') || '';
      } else {
        this.selectedUserTask = null;
        this.selectedRole = '';
      }
    });

    this.securityService.getRoles().subscribe(roles => this.systemRoles = roles);

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.currentProcessId = +params['id'];
        this.loadProcess(this.currentProcessId);
      } else {
        this.importDiagram(this.initialXml);
      }
    });
  }

  loadMetaEntities() {
    this.metaService.listarEntidades().subscribe(entities => {
      this.metaEntities = entities;
    });
  }

  loadProcess(id: number) {
    this.processService.getProcessById(id).subscribe({
      next: (process) => {
        this.currentProcessName = process.name;
        this.selectedMetaEntityId = process.metaEntityId || null;
        this.importDiagram(process.bpmnXml);
      },
      error: (err) => {
        alert('Error al cargar el proceso para editar.');
        this.importDiagram(this.initialXml);
      }
    });
  }

  ngOnDestroy() {
    if (this.bpmnModeler) {
      this.bpmnModeler.destroy();
    }
  }

  updateTaskRole() {
    if (this.selectedUserTask) {
      const modeling = this.bpmnModeler.get('modeling');
      
      if (!this.selectedRole) {
        // If empty, remove the properties
        modeling.updateProperties(this.selectedUserTask, {
          'camunda:candidateGroups': undefined
        });
      } else {
        // Update with camunda prefix only, to match the existing diagram schema
        modeling.updateProperties(this.selectedUserTask, {
          'camunda:candidateGroups': this.selectedRole
        });
      }
    }
  }

  private async importDiagram(xml: string) {
    try {
      this.bpmnModeler.clear(); // Limpiar el lienzo antes de importar para evitar bugs del panel de propiedades
      await this.bpmnModeler.importXML(xml);
      const canvas = this.bpmnModeler.get('canvas');
      canvas.zoom('fit-viewport');
    } catch (err: any) {
      console.error('Error al importar diagrama:', err);
      alert('Error al importar el archivo BPMN: ' + (err.message || err));
    }
  }

  async exportXml() {
    try {
      const result = await this.bpmnModeler.saveXML({ format: true });
      const blob = new Blob([result.xml!], { type: 'application/xml' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = (this.currentProcessName || 'proceso') + '.bpmn';
      link.click();
    } catch (err) {
      console.error('Error al exportar XML:', err);
    }
  }

  importFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.importDiagram(e.target.result);
      };
      reader.readAsText(file);
    }
  }

  async saveProcess(deploy: boolean) {
    try {
      const result = await this.bpmnModeler.saveXML({ format: true });
      const xml = result.xml;
      
      let processName = this.currentProcessName;
      if (!this.currentProcessId) {
        processName = prompt('Nombre del Proceso:', 'Nuevo Proceso de Negocio') || '';
        if (!processName) return;
      }

      const processKey = processName.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const processData: ProcessDefinition = {
        id: this.currentProcessId || undefined,
        key: processKey,
        name: processName,
        bpmnXml: xml!,
        metaEntityId: this.selectedMetaEntityId || undefined,
        status: this.currentProcessId ? undefined : 'DRAFT'
      };

      this.processService.saveProcess(processData).subscribe({
        next: (savedProcess) => {
          this.currentProcessId = savedProcess.id || null;
          this.currentProcessName = savedProcess.name;
          
          if (deploy && savedProcess.id) {
            this.processService.deployProcess(savedProcess.id).subscribe({
              next: () => alert('¡Proceso guardado y desplegado en Flowable con éxito!'),
              error: (err) => alert('Error al desplegar en Flowable: ' + (err.error?.message || 'Error desconocido'))
            });
          } else {
            alert('¡Proceso guardado correctamente!');
          }
        },
        error: (err) => {
          if (err.status === 500 && !this.currentProcessId) {
            alert('Error: Ya existe un proceso con ese nombre o clave. Por favor usa un nombre diferente.');
          } else {
            alert('Error al guardar proceso.');
          }
        }
      });
      
    } catch (err) {
      console.error('Error al guardar proceso:', err);
    }
  }
}
