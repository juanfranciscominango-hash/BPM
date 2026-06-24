import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MsalService } from '../../../core/services/msal.service';

@Component({
  selector: 'innova-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  user: any = null;
  msalUser: any = null;

  constructor(
    private authService: AuthService,
    private msalService: MsalService
  ) {}

  ngOnInit() {
    // Obtener usuario de autenticación tradicional
    this.user = this.authService.getCurrentUser();
    
    // Obtener usuario de MSAL si está disponible
    this.msalUser = this.msalService.getCurrentUser();
  }

  get userInfo() {
    if (this.msalUser) {
      return {
        firstName: this.extractFirstName(this.msalUser.name || this.msalUser.username),
        lastName: this.extractLastName(this.msalUser.name || ''),
        phone: '',
        birthDate: '',
        country: 'Ecuador',
        address: '',
        bio: 'Usuario autenticado con Entra ID',
        avatar: '',
        preferences: {
          language: 'Español',
          timezone: 'America/Guayaquil (GMT-5)',
          dateFormat: 'DD/MM/YYYY',
          notifications: true
        }
      };
    }
    
    return this.user?.profile || {};
  }

  get userEmail() {
    if (this.msalUser) {
      return this.msalUser.username || this.msalUser.preferred_username || '';
    }
    return this.user?.email || '';
  }

  get userRole() {
    if (this.msalUser) {
      return this.userRoleDetails.primaryRole;
    }
    return this.user?.role || 'Usuario';
  }

  get userRoleDetails() {
    if (this.msalUser) {
      return this.extractDetailedRoleInfo(this.msalUser);
    }
    return {
      primaryRole: this.user?.role || 'Usuario',
      allRoles: [this.user?.role || 'Usuario'],
      groups: [],
      permissions: []
    };
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

  get userFullName() {
    if (this.msalUser) {
      return this.msalUser.name || this.extractNameFromUsername(this.msalUser.username) || 'Usuario MSAL';
    }
    return this.userInfo.firstName && this.userInfo.lastName 
      ? `${this.userInfo.firstName} ${this.userInfo.lastName}` 
      : 'Usuario';
  }

  private extractFirstName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[0] || '';
  }

  private extractLastName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.slice(1).join(' ') || '';
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
}
