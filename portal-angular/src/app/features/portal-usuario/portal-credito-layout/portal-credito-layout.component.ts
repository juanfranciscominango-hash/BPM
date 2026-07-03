import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { ProcessService, ProcessDefinition } from '../../../core/services/process.service';

@Component({
  selector: 'app-portal-credito-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './portal-credito-layout.component.html',
  styleUrl: './portal-credito-layout.component.scss'
})
export class PortalCreditoLayoutComponent implements OnInit {
  public authService = inject(AuthService);
  public router = inject(Router);
  private processService = inject(ProcessService);

  currentUser: User | null = null;
  sidebarCollapsed = false;
  processes: ProcessDefinition[] = [];

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.processService.getProcesses().subscribe(procs => {
      this.processes = procs.filter(p => p.status === 'DEPLOYED' || p.deploymentId);
      if (this.processes.length === 0) {
        this.processes = procs;
      }
    });
  }

  iniciarProcesoDirecto(key: string) {
    if (confirm(`¿Desea iniciar el trámite de ${key}?`)) {
      this.processService.startInstance(key, {}).subscribe({
        next: () => {
          alert('Trámite iniciado con éxito.');
          this.router.navigateByUrl('/portal/bandeja', { skipLocationChange: true }).then(() => {
             this.router.navigate(['/portal/bandeja']);
          });
        },
        error: (err) => {
          console.error(err);
          alert('Error al iniciar el trámite.');
        }
      });
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
