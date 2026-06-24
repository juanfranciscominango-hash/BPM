import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// @ts-ignore
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { ProcessService } from '../../../core/services/process.service';
import { InstanceService } from '../../../core/services/instance.service';

@Component({
  selector: 'app-visor-proceso',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visor-container border rounded bg-light">
      <div #canvas class="canvas-container"></div>
    </div>
  `,
  styles: [`
    .visor-container {
      width: 100%;
      height: 400px;
      position: relative;
    }
    .canvas-container {
      width: 100%;
      height: 100%;
    }
    :host ::ng-deep .highlight:not(.djs-connection) .djs-visual > :nth-child(1) {
      fill: rgba(0, 255, 0, 0.2) !important;
      stroke: #28a745 !important;
      stroke-width: 3px !important;
    }
  `]
})
export class VisorProcesoComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef;
  @Input() processDefinitionId!: string;
  @Input() instanceId?: string;

  private viewer!: any;
  private processService = inject(ProcessService);
  private instanceService = inject(InstanceService);

  ngOnInit() {
    this.viewer = new BpmnViewer({
      container: this.canvasRef.nativeElement
    });

    this.cargarDiagrama();
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  private cargarDiagrama() {
    // Extraer el ID interno de nuestra BD desde el processDefinitionId de Flowable
    // El ID de Flowable suele ser "key:version:id"
    // Pero nosotros necesitamos el ID de nuestra tabla ProcessDefinition para obtener el XML
    // Vamos a buscar por KEY
    const key = this.processDefinitionId.split(':')[0];
    
    this.processService.getProcesses().subscribe(processes => {
      const process = processes.find(p => p.key === key);
      if (process && process.bpmnXml) {
        this.render(process.bpmnXml);
      }
    });
  }

  private async render(xml: string) {
    try {
      await this.viewer.importXML(xml);
      const canvas = this.viewer.get('canvas');
      canvas.zoom('fit-viewport');

      if (this.instanceId) {
        this.resaltarActividades();
      }
    } catch (err) {
      console.error('Error renderizando BPMN:', err);
    }
  }

  private resaltarActividades() {
    this.instanceService.getActiveActivities(this.instanceId!).subscribe(activityIds => {
      const canvas = this.viewer.get('canvas');
      activityIds.forEach(id => {
        canvas.addMarker(id, 'highlight');
      });
    });
  }
}
