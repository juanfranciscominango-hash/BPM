import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-portal-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-historial.component.html'
})
export class PortalHistorialComponent implements OnInit {
  historial: any[] = [
    { id: '1234', proceso: 'flujo_credito', fecha: new Date('2023-10-01'), estado: 'Aprobado' },
    { id: '1220', proceso: 'flujo_credito', fecha: new Date('2023-08-15'), estado: 'Rechazado' }
  ];

  ngOnInit() {
    // Aquí se llamará al InstanceService.getHistoryInstances()
  }
}
