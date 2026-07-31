import { Injectable, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ParametricService } from './parametric.service';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private authService = inject(AuthService);
  private parametricService = inject(ParametricService);
  private router = inject(Router);

  private timeoutId: any;
  private warningTimeoutId: any;
  private countdownIntervalId: any;

  private isWarningOpen = false;
  private lastActivityTime = Date.now();
  private inactivityLimitMs = 10 * 60 * 1000; // Default 10 minutes
  private warningBufferMs = 60 * 1000; // 60 seconds warning

  private eventListeners: { name: string; handler: any }[] = [];

  constructor() {
    // Listen to changes in the authenticated user
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadTimeoutAndStart();
      } else {
        this.stopMonitoring();
      }
    });
  }

  private loadTimeoutAndStart() {
    this.parametricService.getTables().subscribe({
      next: (tables) => {
        const table = tables.find(t => 
          (t.label && t.label.toLowerCase().includes('parametros generales')) || 
          (t.name && t.name.toLowerCase().includes('parametros_generales')) ||
          (t.name && t.name.toLowerCase().includes('parametros generales'))
        );
        if (table && table.id) {
          this.parametricService.getTableData(table.id).subscribe({
            next: (data) => {
              const param = data.find(r => 
                r.descripcion && r.descripcion.toLowerCase().includes('inactividad')
              );
              // Obtener valor en minutos (ej: 10), o usar 10 por defecto
              const minutes = param ? Number(param.valor) : 10;
              console.log(`[InactivityService] Session timeout set to ${minutes} minutes from DB`);
              this.inactivityLimitMs = minutes * 60 * 1000;
              this.startMonitoring();
            },
            error: () => this.startDefaultMonitoring()
          });
        } else {
          this.startDefaultMonitoring();
        }
      },
      error: () => this.startDefaultMonitoring()
    });
  }

  private startDefaultMonitoring() {
    console.log('[InactivityService] Setting default timeout of 10 minutes');
    this.inactivityLimitMs = 10 * 60 * 1000;
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.stopMonitoring();
    this.lastActivityTime = Date.now();

    // Event handler with throttling to prevent CPU load
    const handler = () => {
      const now = Date.now();
      if (now - this.lastActivityTime > 1000) {
        this.lastActivityTime = now;
        if (!this.isWarningOpen) {
          this.resetTimer();
        }
      }
    };

    // Attach DOM interaction listeners
    const events = ['mousemove', 'click', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => {
      window.addEventListener(e, handler, { passive: true });
      this.eventListeners.push({ name: e, handler });
    });

    this.resetTimer();
  }

  private stopMonitoring(): void {
    // Clear timeouts
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);

    // Remove event listeners
    this.eventListeners.forEach(el => {
      window.removeEventListener(el.name, el.handler);
    });
    this.eventListeners = [];
    this.isWarningOpen = false;
  }

  private resetTimer(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);

    const warningDelay = this.inactivityLimitMs - this.warningBufferMs;
    
    // Set warning timeout
    this.warningTimeoutId = setTimeout(() => {
      this.showWarningAlert();
    }, warningDelay > 0 ? warningDelay : this.inactivityLimitMs / 2);

    // Set absolute timeout as fallback
    this.timeoutId = setTimeout(() => {
      this.logoutUser();
    }, this.inactivityLimitMs);
  }

  private showWarningAlert(): void {
    this.isWarningOpen = true;
    let secondsLeft = Math.floor(this.warningBufferMs / 1000);

    Swal.fire({
      title: '¿Sigues ahí?',
      html: 'Tu sesión expirará por inactividad en <b>' + secondsLeft + '</b> segundos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Mantener sesión',
      cancelButtonText: 'Cerrar sesión',
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: this.warningBufferMs,
      timerProgressBar: true,
      didOpen: () => {
        const content = Swal.getHtmlContainer();
        if (content) {
          const b = content.querySelector('b');
          if (b) {
            this.countdownIntervalId = setInterval(() => {
              secondsLeft--;
              b.textContent = secondsLeft.toString();
              if (secondsLeft <= 0) {
                clearInterval(this.countdownIntervalId);
              }
            }, 1000);
          }
        }
      },
      willClose: () => {
        if (this.countdownIntervalId) {
          clearInterval(this.countdownIntervalId);
        }
      }
    }).then((result) => {
      this.isWarningOpen = false;
      if (result.isConfirmed) {
        // Keep session
        this.lastActivityTime = Date.now();
        this.resetTimer();
      } else {
        // Logout
        this.logoutUser();
      }
    });
  }

  private logoutUser(): void {
    this.stopMonitoring();
    Swal.close();
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { reason: 'inactivity' } });
  }
}
