import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'innova-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  currentUser: User | null = null;
  stats: DashboardStats = {
    activeInstances: 0,
    completedInstances: 0,
    pendingTasks: 0,
    efficiency: 0
  };

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarStats();
  }

  cargarStats() {
    this.dashboardService.getStats().subscribe(data => this.stats = data);
  }
}
