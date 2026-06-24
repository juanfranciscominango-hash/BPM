import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-resumen-credito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resumen-credito.component.html'
})
export class ResumenCreditoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  processInstanceId: string | null = null;
  resumen = {
    montoAprobado: 50000,
    plazo: 60,
    tasa: 8.5,
    estado: 'Desembolsado',
    fecha: new Date()
  };

  ngOnInit() {
    this.processInstanceId = this.route.snapshot.paramMap.get('id');
    // En el futuro, consultar al backend por las variables de esta instancia para llenar el resumen
  }

  descargarContrato() {
    alert('Descargando contrato generado PDF...');
  }
}
