import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurneroService, TuServicio, TuTurno } from '../../../core/services/turnero.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'innova-turnero-kiosco',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kiosco.component.html',
  styleUrl: './kiosco.component.scss'
})
export class TurneroKioscoComponent implements OnInit, OnDestroy {
  private turneroService = inject(TurneroService);
  public themeService = inject(ThemeService);

  servicios: TuServicio[] = [];
  loading = false;
  selectedServicio: TuServicio | null = null;

  // Formulario datos cliente
  identificacionCliente = '';
  nombreCliente = '';
  showClientModal = false;

  // Modal Ticket Emitido
  ticketEmitido: TuTurno | null = null;
  showTicketModal = false;
  ticketTimeout: any;

  // Reloj digital
  currentTime = new Date();
  clockInterval: any;

  get logoPath(): string {
    return this.themeService.logoPath();
  }

  get brandName(): string {
    return this.themeService.brandName();
  }

  ngOnInit(): void {
    this.loadServicios();
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.ticketTimeout) clearTimeout(this.ticketTimeout);
  }

  loadServicios(): void {
    this.loading = true;
    this.turneroService.getServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando servicios', err);
        this.loading = false;
      }
    });
  }

  seleccionarServicio(servicio: TuServicio): void {
    this.selectedServicio = servicio;
    this.identificacionCliente = '';
    this.nombreCliente = '';
    this.showClientModal = true;
  }

  emitirTurnoDirecto(servicio: TuServicio): void {
    this.selectedServicio = servicio;
    this.confirmarEmision();
  }

  confirmarEmision(): void {
    if (!this.selectedServicio) return;
    this.loading = true;

    this.turneroService.emitirTurno(
      this.selectedServicio.codigo,
      this.identificacionCliente,
      this.nombreCliente
    ).subscribe({
      next: (turno) => {
        this.loading = false;
        this.showClientModal = false;
        this.mostrarTicket(turno);
      },
      error: (err) => {
        this.loading = false;
        alert('Ocurrió un error al emitir el turno. Por favor reintente.');
      }
    });
  }

  mostrarTicket(turno: TuTurno): void {
    this.ticketEmitido = turno;
    this.showTicketModal = true;

    // Ocultar modal automáticamente después de 6 segundos
    if (this.ticketTimeout) clearTimeout(this.ticketTimeout);
    this.ticketTimeout = setTimeout(() => {
      this.cerrarTicketModal();
    }, 6000);
  }

  cerrarTicketModal(): void {
    this.showTicketModal = false;
    this.ticketEmitido = null;
    this.selectedServicio = null;
  }

  getIconForService(codigo: string): string {
    switch (codigo.toUpperCase()) {
      case 'PREFERENCIAL': return 'bi-heart-pulse-fill';
      case 'CAJAS': return 'bi-cash-coin';
      case 'ATENCION': return 'bi-person-badge-fill';
      case 'CREDITO': return 'bi-bank';
      default: return 'bi-ticket-perforated-fill';
    }
  }

  getGradientForService(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
      'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)'
    ];
    return gradients[index % gradients.length];
  }
}
