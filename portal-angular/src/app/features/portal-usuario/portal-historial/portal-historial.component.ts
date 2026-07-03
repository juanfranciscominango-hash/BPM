import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstanceService } from '../../../core/services/instance.service';

@Component({
  selector: 'app-portal-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-historial.component.html'
})
export class PortalHistorialComponent implements OnInit {
  private instanceService = inject(InstanceService);
  historial: any[] = [];

  ngOnInit() {
    this.instanceService.getHistoryInstances().subscribe({
      next: (data) => {
        this.historial = data.map(item => ({
          id: item.id,
          proceso: item.processDefinitionName || item.processDefinitionKey,
          fecha: item.startTime ? new Date(item.startTime) : new Date(),
          estado: item.status === 'COMPLETED' ? 'Aprobado' : 'Rechazado'
        }));
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
      }
    });
  }
}
