import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, UserTask } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProcessService } from '../../../core/services/process.service';
import { BpmnViewerModalComponent } from './bpmn-viewer-modal/bpmn-viewer-modal.component';
import { TimelineModalComponent } from './timeline-modal/timeline-modal.component';
import { TrackingModalComponent } from './tracking-modal/tracking-modal.component';

// Import bootstrap to use JS API
declare var bootstrap: any;

@Component({
  selector: 'app-portal-bandeja',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BpmnViewerModalComponent, TimelineModalComponent, TrackingModalComponent],
  templateUrl: './portal-bandeja.component.html',
  styles: [`
    .task-row .enter-icon {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      transform: translateX(-10px);
    }
    .task-row:hover .enter-icon {
      opacity: 1;
      transform: translateX(0);
    }
  `]
})
export class PortalBandejaComponent implements OnInit {
  private taskService = inject(TaskService);
  private processService = inject(ProcessService);
  private authService = inject(AuthService);
  private router = inject(Router);

  tasks: UserTask[] = [];
  loading = false;
  currentUser = this.authService.getCurrentUser();
  pageSize = 10;

  // Variables for the graphic query modal
  selectedInstanceId: string = '';
  selectedProcDefId: string = '';
  selectedProcessName: string = '';
  showGraphicQuery: boolean = false;
  
  // Variables for the timeline modal
  showTimeline: boolean = false;

  // Variables for the tracking modal
  showTracking: boolean = false;

  ngOnInit() {
    this.cargarTareas();
  }

  cargarTareas() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        // Ocultar las tareas de prueba 'Simulacion' para no ensuciar la bandeja
        this.tasks = (data || []).filter(t => t.name !== 'Simulacion');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  abrirTarea(task: UserTask) {
    this.router.navigate(['/portal/wizard', task.id]);
  }

  cancelarProceso(task: UserTask, event: Event) {
    event.stopPropagation(); // Evitar que se abra la tarea al hacer clic en cancelar
    if (confirm(`¿Estás seguro que deseas cancelar el proceso ${task.processDefinitionId.split(':')[0]}?`)) {
      this.processService.deleteInstance(task.processInstanceId, 'Cancelado por el usuario').subscribe({
        next: () => {
          alert('Proceso cancelado correctamente.');
          this.cargarTareas();
        },
        error: (err) => {
          console.error('Error al cancelar el proceso', err);
          alert('Ocurrió un error al intentar cancelar el proceso.');
        }
      });
    }
  }

  abrirConsultaGrafica(task: UserTask, event: Event) {
    event.stopPropagation();
    this.selectedInstanceId = task.processInstanceId;
    this.selectedProcDefId = task.processDefinitionId;
    this.selectedProcessName = task.processName || task.processDefinitionId.split(':')[0];
    this.showGraphicQuery = true;
    
    // Necesitamos esperar al ciclo de Angular para que se renderice el HTML del modal
    setTimeout(() => {
      const modalEl = document.getElementById('graphicQueryModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        // Cuando se cierre desde BS, actualizar la variable de Angular
        modalEl.addEventListener('hidden.bs.modal', () => {
          this.showGraphicQuery = false;
        }, { once: true });
      }
    }, 100);
  }

  abrirLineaDeTiempo(task: UserTask, event: Event) {
    event.stopPropagation();
    this.selectedInstanceId = task.processInstanceId;
    this.selectedProcessName = task.processName || task.processDefinitionId.split(':')[0];
    this.showTimeline = true;
    
    setTimeout(() => {
      const modalEl = document.getElementById('timelineModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        modalEl.addEventListener('hidden.bs.modal', () => {
          this.showTimeline = false;
        }, { once: true });
      }
    }, 100);
  }

  abrirTracking(task: UserTask, event: Event) {
    event.stopPropagation();
    this.selectedInstanceId = task.processInstanceId;
    this.selectedProcessName = task.processName || task.processDefinitionId.split(':')[0];
    this.showTracking = true;
    
    setTimeout(() => {
      const modalEl = document.getElementById('trackingModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        modalEl.addEventListener('hidden.bs.modal', () => {
          this.showTracking = false;
        }, { once: true });
      }
    }, 100);
  }
}
