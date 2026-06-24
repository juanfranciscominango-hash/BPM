import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top.component';
import { ConfigService } from '../../core/services/config.service';
import { AuthService, User } from '../../core/services/auth.service';
import { MsalService } from '../../core/services/msal.service';

import { MenuService, MenuItem } from '../../core/services/menu.service';

import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'innova-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ThemeToggleComponent, ScrollToTopComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit {
  private configService = inject(ConfigService);
  private authService = inject(AuthService);
  private menuService = inject(MenuService);
  private notificationService = inject(NotificationService);
  private msalService = inject(MsalService);
  public router = inject(Router);

  sidebarCollapsed = false;
  sidebarOpen = false;
  showThemeToggle = true;

  menuItems: MenuItem[] = [];
  submenuOpen: { [key: string]: boolean } = {};
  
  notifications: Notification[] = [];

  currentUser: User | null = null;
  msalUser: any = null;
  isLoggingOut = false;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.msalUser = this.msalService.getCurrentUser();
    this.cargarMenu();
    this.cargarNotificaciones();
  }

  cargarMenu() {
    this.menuService.getMenu().subscribe(items => {
      this.menuItems = items;
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          this.submenuOpen[item.title] = false;
        }
      });
    });
  }

  cargarNotificaciones() {
    if (this.currentUser) {
      this.notificationService.getByUser(this.currentUser.username, true).subscribe(data => {
        this.notifications = data;
      });
    }
  }

  leerNotificacion(n: Notification) {
    if (n.id) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        this.cargarNotificaciones();
      });
    }
  }

  get userInfo() {
    if (this.msalUser) {
      return {
        name: this.msalUser.name || this.extractNameFromUsername(this.msalUser.username) || 'Usuario MSAL',
        email: this.msalUser.username || this.msalUser.preferred_username || 'usuario@entra.id',
        role: 'MSAL User'
      };
    }
    
    if (this.currentUser) {
      return {
        name: this.currentUser.fullName,
        email: this.currentUser.username,
        role: this.currentUser.roles.join(', ')
      };
    }
    
    return {
      name: 'Invitado',
      email: 'visitante@innovacred.com',
      role: 'Invitado'
    };
  }

  hasPermission(perm: string): boolean {
    return this.authService.hasPermission(perm);
  }

  private extractNameFromUsername(username: string): string {
    if (!username) return 'Usuario';
    
    const namePart = username.split('@')[0];
    
    return namePart
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  get userRoleDetails() {
    if (!this.msalUser) {
      return {
        primaryRole: 'Usuario',
        allRoles: ['Usuario'],
        groups: [],
        permissions: []
      };
    }

    return this.extractDetailedRoleInfo(this.msalUser);
  }

  private extractDetailedRoleInfo(msalUser: any) {
    const roles: string[] = [];
    const groups: string[] = [];
    const permissions: string[] = [];

    if (msalUser.idTokenClaims) {
      const claims = msalUser.idTokenClaims;

      if (claims.roles && Array.isArray(claims.roles)) {
        roles.push(...claims.roles);
      }

      if (claims.groups && Array.isArray(claims.groups)) {
        groups.push(...claims.groups);
        claims.groups.forEach((groupId: string) => {
          if (groupId === 'admin-group-id') roles.push('Administrador');
          else if (groupId === 'user-group-id') roles.push('Usuario');
          else if (groupId === 'manager-group-id') roles.push('Gerente');
        });
      }

      if (claims.wids && Array.isArray(claims.wids)) {
        claims.wids.forEach((wid: string) => {
          switch (wid) {
            case 'b79fbf4d-3ef9-4689-8143-76b194e85509': roles.push('Usuario'); break;
            case '62e90394-69f5-4237-9190-012177145e10': roles.push('Administrador'); break;
            case 'fdd7a751-b60b-444a-984c-02652fe8fa1c': roles.push('Invitado'); break;
            case 'b605c87f-15ea-489f-80a8-9ce1b54dc4bc': roles.push('Gerente'); break;
            default: roles.push(`Rol ${wid.substring(0, 8)}...`);
          }
        });
      }

      if (claims.scp && typeof claims.scp === 'string') {
        permissions.push(...claims.scp.split(' '));
      }
    }

    let primaryRole = 'Usuario';
    if (roles.length > 0) {
      primaryRole = roles[0];
    } else {
      if (roles.includes('Administrador')) primaryRole = 'Administrador';
      else if (roles.includes('Gerente')) primaryRole = 'Gerente';
      else if (roles.includes('Invitado')) primaryRole = 'Invitado';
    }

    return {
      primaryRole,
      allRoles: [...new Set(roles)],
      groups,
      permissions
    };
  }

  get showProfileMenu(): boolean {
    return this.configService.isFeatureEnabled('showEmailPasswordLogin') && 
           (this.authService.isAuthenticated() || this.msalService.isAuthenticatedUser());
  }

  get sidebarClasses() {
    return {
      'sidebar-collapsed': this.sidebarCollapsed,
      'sidebar-open': this.sidebarOpen
    };
  }

  toggleSidebar() {
    if (window.innerWidth < 992) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleSubmenu(menu: string) {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.submenuOpen[menu] = !this.submenuOpen[menu];
  }

  async logout(event: Event) {
    event.preventDefault();
    
    if (this.isLoggingOut) {
      console.log('Logout already in progress');
      return;
    }

    this.isLoggingOut = true;
    console.log('Starting logout process...');

    try {
      if (this.msalService.isAuthenticatedUser()) {
        console.log('Performing MSAL logout...');
        await this.msalService.logout();
      } else {
        console.log('Performing traditional logout...');
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      try {
        this.router.navigate(['/login']);
      } catch (navError) {
        console.error('Error navigating to login:', navError);
        window.location.href = '/login';
      }
    } finally {
      this.isLoggingOut = false;
    }
  }
}
