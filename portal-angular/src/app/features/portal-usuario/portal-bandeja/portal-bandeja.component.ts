import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TaskService, UserTask } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-portal-bandeja',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-bandeja.component.html'
})
export class PortalBandejaComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  tasks: UserTask[] = [];
  loading = false;
  currentUser = this.authService.getCurrentUser();

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
}
