import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

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

  currentUser: User | null = null;
  sidebarCollapsed = false;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
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
