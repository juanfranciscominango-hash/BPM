import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurneroService, TuTurno, TuVentanilla, TuServicio } from '../../../core/services/turnero.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'innova-turnero-consola-ventanilla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consola-ventanilla.component.html',
  styleUrl: './consola-ventanilla.component.scss'
})
export class TurneroConsolaVentanillaComponent implements OnInit, OnDestroy {
  private turneroService = inject(TurneroService);
  private authService = inject(AuthService);

  ventanillas: TuVentanilla[] = [];
  servicios: TuServicio[] = [];
  selectedVentanillaNum = 1;
  usuarioAsesor = 'Asesor';

  turnoActual: TuTurno | null = null;
  colaPendiente: TuTurno[] = [];
  
  loading = false;
  observaciones = '';
  
  // Modal Derivación
  showDerivarModal = false;
  nuevoCodigoServicio = '';

  pollingInterval: any;
  turnosAtendidosCount = 0;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioAsesor = user.fullName || user.username;
    }

    this.loadVentanillas();
    this.loadServicios();
    this.refreshCola();

    this.pollingInterval = setInterval(() => {
      this.refreshCola();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  loadVentanillas(): void {
    this.turneroService.getVentanillas().subscribe({
      next: (list) => {
        this.ventanillas = list;
        if (list.length > 0) {
          this.selectedVentanillaNum = list[0].numero;
        }
      },
      error: (err) => console.error('Error cargando ventanillas', err)
    });
  }

  loadServicios(): void {
    this.turneroService.getServicios().subscribe({
      next: (list) => {
        this.servicios = list;
      },
      error: (err) => console.error('Error cargando servicios', err)
    });
  }

  refreshCola(): void {
    this.turneroService.getColaPendiente().subscribe({
      next: (cola) => this.colaPendiente = cola || [],
      error: (err) => console.error('Error actualizando cola', err)
    });
  }

  llamarSiguiente(): void {
    this.loading = true;
    this.turneroService.llamarSiguiente(this.selectedVentanillaNum, this.usuarioAsesor).subscribe({
      next: (turno) => {
        this.loading = false;
        if (turno && turno.id) {
          this.turnoActual = turno;
          this.observaciones = '';
          this.refreshCola();
        } else {
          alert('No hay turnos pendientes en la cola para ser llamados.');
        }
      },
      error: (err) => {
        this.loading = false;
        alert('No hay turnos disponibles o se produjo un error.');
      }
    });
  }

  rellamar(): void {
    if (!this.turnoActual) return;
    this.loading = true;
    this.turneroService.rellamar(this.turnoActual.id).subscribe({
      next: (turno) => {
        this.loading = false;
        this.turnoActual = turno;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al rellamar', err);
      }
    });
  }

  iniciarAtencion(): void {
    if (!this.turnoActual) return;
    this.loading = true;
    this.turneroService.iniciarAtencion(this.turnoActual.id).subscribe({
      next: (turno) => {
        this.loading = false;
        this.turnoActual = turno;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al iniciar atención', err);
      }
    });
  }

  finalizarAtencion(): void {
    if (!this.turnoActual) return;
    this.loading = true;
    this.turneroService.finalizarAtencion(this.turnoActual.id, this.observaciones).subscribe({
      next: (turno) => {
        this.loading = false;
        this.turnosAtendidosCount++;
        this.turnoActual = null;
        this.observaciones = '';
        this.refreshCola();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al finalizar atención', err);
      }
    });
  }

  marcarAusente(): void {
    if (!this.turnoActual) return;
    if (!confirm('¿Desea marcar al cliente como AUSENTE?')) return;

    this.loading = true;
    this.turneroService.marcarAusente(this.turnoActual.id).subscribe({
      next: () => {
        this.loading = false;
        this.turnoActual = null;
        this.refreshCola();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al marcar ausente', err);
      }
    });
  }

  abrirDerivacion(): void {
    if (!this.turnoActual) return;
    this.nuevoCodigoServicio = '';
    this.showDerivarModal = true;
  }

  confirmarDerivacion(): void {
    if (!this.turnoActual || !this.nuevoCodigoServicio) return;
    this.loading = true;

    this.turneroService.derivarTurno(this.turnoActual.id, this.nuevoCodigoServicio).subscribe({
      next: () => {
        this.loading = false;
        this.showDerivarModal = false;
        this.turnoActual = null;
        this.refreshCola();
        alert('Turno derivado exitosamente.');
      },
      error: (err) => {
        this.loading = false;
        alert('Error al derivar turno.');
      }
    });
  }
}
