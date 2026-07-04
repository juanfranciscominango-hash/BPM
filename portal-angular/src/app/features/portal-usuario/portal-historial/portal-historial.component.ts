import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InstanceService } from '../../../core/services/instance.service';

@Component({
  selector: 'app-portal-historial',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './portal-historial.component.html'
})
export class PortalHistorialComponent implements OnInit {
  private instanceService = inject(InstanceService);
  historial: any[] = [];
  searchText = '';

  ngOnInit() {
    this.instanceService.getHistoryInstances().subscribe({
      next: (data: any[]) => {
        this.historial = data.map(item => ({
          id: item.id,
          proceso: item.processDefinitionName || item.processDefinitionKey,
          fecha: item.startTime ? new Date(item.startTime) : new Date(),
          estado: item.status === 'COMPLETED' ? 'Completado' : (item.status === 'ACTIVE' ? 'Activo' : 'Cancelado'),
          usuarioIniciador: item.startUserId || 'Desconocido',
          actividadActual: item.currentActivity || 'Finalizado'
        }));
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
      }
    });
  }

  get filteredHistorial() {
    if (!this.searchText.trim()) {
      return this.historial;
    }
    const search = this.searchText.toLowerCase();
    return this.historial.filter(item => 
      item.id.toLowerCase().includes(search) ||
      item.proceso.toLowerCase().includes(search) ||
      item.usuarioIniciador.toLowerCase().includes(search) ||
      item.actividadActual.toLowerCase().includes(search)
    );
  }
}
