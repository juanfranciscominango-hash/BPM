import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TurneroService, TuTurno, DisplayTvData } from '../../../core/services/turnero.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'innova-turnero-display-tv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-tv.component.html',
  styleUrl: './display-tv.component.scss'
})
export class TurneroDisplayTvComponent implements OnInit, OnDestroy {
  private turneroService = inject(TurneroService);
  public themeService = inject(ThemeService);

  llamadoActual: TuTurno | null = null;
  ultimosLlamados: TuTurno[] = [];
  colaPendiente: TuTurno[] = [];

  pollingInterval: any;
  clockInterval: any;
  currentTime = new Date();
  
  // Animación de destello al cambiar de turno
  isNewCall = false;
  lastTurnoId: number | null = null;

  get logoPath(): string {
    return this.themeService.logoPath();
  }

  get brandName(): string {
    return this.themeService.brandName();
  }

  ngOnInit(): void {
    this.fetchData();
    this.pollingInterval = setInterval(() => this.fetchData(), 3000);
    this.clockInterval = setInterval(() => this.currentTime = new Date(), 1000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  fetchData(): void {
    this.turneroService.getDisplayTvData().subscribe({
      next: (data: DisplayTvData) => {
        if (data.llamadoActual && data.llamadoActual.id !== this.lastTurnoId) {
          this.triggerCallAlert();
          this.lastTurnoId = data.llamadoActual.id;
        }

        this.llamadoActual = data.llamadoActual;
        this.ultimosLlamados = data.ultimosLlamados || [];
        this.colaPendiente = data.colaPendiente || [];
      },
      error: (err) => console.error('Error actualizando pantalla TV', err)
    });
  }

  triggerCallAlert(): void {
    this.isNewCall = true;
    this.playChimeSound();
    setTimeout(() => {
      this.isNewCall = false;
    }, 4000);
  }

  playChimeSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio Autoplay prevented or not supported', e);
    }
  }
}
