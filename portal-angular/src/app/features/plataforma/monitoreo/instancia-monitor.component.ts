import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MonitoringService } from '../../../core/services/monitoring.service';
import { environment } from '../../../../environments/environment';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

@Component({
  selector: 'app-instancia-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-0 bg-light min-vh-100">
      <!-- Header -->
      <div class="bg-white border-bottom p-3 d-flex justify-content-between align-items-center shadow-sm">
        <div>
          <h2 class="h4 mb-0 fw-bold text-primary"><i class="bi bi-activity me-2"></i>Monitor de Instancia</h2>
          <small class="text-muted">ID: {{ instanceId }}</small>
        </div>
        <div>
          <button class="btn btn-outline-primary btn-sm me-2" (click)="exportTracking()">
            <i class="bi bi-file-earmark-excel me-1"></i>Exportar Historial
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="cargarTodo()">
            <i class="bi bi-arrow-clockwise me-1"></i>Refrescar
          </button>
        </div>
      </div>

      <div class="row g-0">
        <!-- Panel Izquierdo: Diagrama -->
        <div class="col-md-8 border-end bg-white" style="height: calc(100vh - 72px);">
          <div #canvas class="canvas-container w-100 h-100"></div>
        </div>

        <!-- Panel Derecho: Auditoría (Timeline) -->
        <div class="col-md-4 bg-white overflow-auto" style="height: calc(100vh - 72px);">
          <div class="p-4">
            <h5 class="fw-bold mb-4 border-bottom pb-2">Trazabilidad (Audit Trail)</h5>
            
            <div class="timeline">
              <div *ngFor="let step of auditTrail" class="timeline-item d-flex gap-3 mb-4">
                <div class="timeline-icon">
                  <div class="bg-primary rounded-circle" style="width: 12px; height: 12px; margin-top: 5px;"></div>
                  <div class="timeline-line bg-light mx-auto" style="width: 2px; height: 100%;"></div>
                </div>
                <div class="timeline-content pb-3 border-bottom w-100">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-dark">{{ step.activityName }}</span>
                    <small class="text-muted">{{ step.startTime | date:'shortTime' }}</small>
                  </div>
                  <div class="small text-muted mb-2">
                    <i class="bi bi-person me-1"></i>{{ step.assignee }} | 
                    <i class="bi bi-tag me-1"></i>{{ step.activityType }}
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="badge" [ngClass]="step.endTime === 'En progreso' ? 'bg-warning text-dark' : 'bg-success-subtle text-success'">
                      {{ step.endTime === 'En progreso' ? 'Activa' : 'Completada' }}
                    </span>
                    <small *ngIf="step.duration > 0" class="text-muted">{{ (step.duration / 1000).toFixed(1) }}s</small>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="auditTrail.length === 0" class="text-center py-5 text-muted">
              Cargando historial...
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container { background: #f8f9fa; }
    .timeline-item:last-child .timeline-line { display: none; }
    .timeline-icon { display: flex; flex-direction: column; align-items: center; }
    ::ng-highlight { background-color: rgba(66, 133, 244, 0.2) !important; border: 2px solid #4285f4 !important; border-radius: 5px; }
  `]
})
export class InstanciaMonitorComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef;
  
  private route = inject(ActivatedRoute);
  private monitoringService = inject(MonitoringService);
  
  instanceId: string = '';
  auditTrail: any[] = [];
  private viewer: any;

  ngOnInit() {
    this.instanceId = this.route.snapshot.params['id'];
    this.viewer = new BpmnViewer({
      container: this.canvasRef.nativeElement
    });
    this.cargarTodo();
  }

  cargarTodo() {
    this.monitoringService.getXml(this.instanceId).subscribe(xml => {
      this.viewer.importXML(xml).then(() => {
        this.viewer.get('canvas').zoom('fit-viewport');
        this.resaltarNodosActivos();
      });
    });

    this.monitoringService.getAuditTrail(this.instanceId).subscribe(data => {
      this.auditTrail = data;
    });
  }

  exportTracking() {
    // Generate endpoint URL and trigger download
    const baseUrl = environment.back_url || '';
    const url = `${baseUrl}/api/v1/instances/${this.instanceId}/export-tracking`;
    window.open(url, '_blank');
  }

  private resaltarnNodosActivos() {
    this.monitoringService.getActiveNodes(this.instanceId).subscribe(nodes => {
      const canvas = this.viewer.get('canvas');
      nodes.forEach(nodeId => {
        canvas.addMarker(nodeId, 'highlight-node');
        // También podemos añadir un overlay o clase CSS personalizada
      });
    });
  }

  // Corregir typo en el nombre del método llamado arriba
  private resaltarNodosActivos() { this.resaltarnNodosActivos(); }

  ngOnDestroy() {
    if (this.viewer) this.viewer.destroy();
  }
}
