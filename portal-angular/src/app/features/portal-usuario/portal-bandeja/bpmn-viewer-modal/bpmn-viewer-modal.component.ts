import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessService } from '../../../../core/services/process.service';
import { forkJoin } from 'rxjs';

// @ts-ignore
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

@Component({
  selector: 'app-bpmn-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bpmn-viewer-modal.component.html',
  styleUrls: ['./bpmn-viewer-modal.component.css']
})
export class BpmnViewerModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() processInstanceId!: string;
  @Input() processDefinitionId!: string;
  @Input() processName!: string;

  @ViewChild('bpmnCanvas', { static: true }) bpmnCanvas!: ElementRef;

  private processService = inject(ProcessService);
  private viewer: any;
  
  loading = true;
  error = '';

  ngOnInit() {
    // Initialize the viewer
    this.viewer = new NavigatedViewer({
      container: this.bpmnCanvas.nativeElement
    });
  }

  ngAfterViewInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';

    // We need 3 things: The XML, the active activities, and the history activities
    forkJoin({
      processDef: this.processService.getProcessByProcDefId(this.processDefinitionId),
      activeIds: this.processService.getActiveActivities(this.processInstanceId),
      historyIds: this.processService.getHistoryActivities(this.processInstanceId)
    }).subscribe({
      next: async (results) => {
        try {
          const bpmnXml = results.processDef.bpmnXml;
          
          if (!bpmnXml) {
            this.error = 'No se encontró el XML del proceso.';
            this.loading = false;
            return;
          }

          // Import XML into viewer
          await this.viewer.importXML(bpmnXml);
          
          // Fit viewport
          const canvas = this.viewer.get('canvas');
          canvas.zoom('fit-viewport');

          // Highlight nodes
          this.highlightNodes(results.historyIds, results.activeIds);
          
          this.loading = false;
        } catch (err) {
          console.error('Error rendering BPMN', err);
          this.error = 'Ocurrió un error al renderizar el diagrama.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching data for BPMN Viewer', err);
        this.error = 'Error al cargar los datos del proceso.';
        this.loading = false;
      }
    });
  }

  private highlightNodes(historyIds: string[], activeIds: string[]) {
    const canvas = this.viewer.get('canvas');

    // Highlight historical/completed nodes
    for (const id of historyIds) {
      // Don't mark as completed if it's currently active
      if (!activeIds.includes(id)) {
        try {
          canvas.addMarker(id, 'highlight-completed');
        } catch (e) {
          // Ignore if node ID not found in XML
        }
      }
    }

    // Highlight active nodes
    for (const id of activeIds) {
      try {
        canvas.addMarker(id, 'highlight-active');
      } catch (e) {
        // Ignore
      }
    }
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }
}
