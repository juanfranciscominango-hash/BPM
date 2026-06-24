import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { MsalService } from '../../core/services/msal.service';
import { ConfigService } from '../../core/services/config.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'innova-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private configService = inject(ConfigService);
  private authService = inject(AuthService);

  username = '';
  dominio = 'InnovaConsulting.com';
  autenticarContraDominio = true;
  password = '';
  showPassword = false;
  currentEnvironment = 'Desarrollo';
  environmentClass = 'bg-warning';
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private msalService: MsalService
  ) {}

  // Feature flags
  get showEntraIdButton(): boolean {
    return this.configService.isFeatureEnabled('showEntraIdButton');
  }

  get showThemeToggle(): boolean {
    return this.configService.isFeatureEnabled('showThemeToggle');
  }

  get showEmailPasswordLogin(): boolean {
    return this.configService.isFeatureEnabled('showEmailPasswordLogin');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  setCredentials(username: string, password: string): void {
    this.username = username;
    this.password = password;
    this.errorMessage = '';
  }

  onLogin(form?: NgForm): void {
    if (form && form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.errorMessage = 'Por favor ingresa tu usuario y contraseña';
      return;
    }

    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor ingresa tu usuario y contraseña';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Attempting login with:', { username: this.username, password: this.password, dominio: this.dominio });

    this.authService.login({ email: this.username, password: this.password }).subscribe({
      next: (user: User | null) => {
        this.isLoading = false;
        console.log('Login result:', user);
        if (user) {
          console.log('Login successful:', user);
          this.router.navigate(['/dashboard']);
        } else {
          console.log('Login failed: user not found');
          this.errorMessage = 'Credenciales incorrectas. Por favor verifica tu correo y contraseña.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = 'Error al iniciar sesión. Por favor intenta nuevamente.';
      }
    });
  }

  async loginWithEntraId(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Intentar login con popup primero
      const result = await this.msalService.loginPopup();

      if (result && result.account) {
        console.log('MSAL Login successful:', result.account);
        // Navegar al dashboard después de autenticación exitosa
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      console.error('MSAL Login failed:', error);

      // Manejar diferentes tipos de errores
      if (error.errorCode === 'popup_window_error' || error.errorCode === 'user_cancelled') {
        // Si falla el popup, intentar con redirect
        try {
          await this.msalService.loginRedirect();
        } catch (redirectError) {
          console.error('Redirect login also failed:', redirectError);
          this.errorMessage = 'Error al autenticar con Entra ID. Por favor, verifica tu configuración.';
        }
      } else if (error.errorCode === 'invalid_client') {
        this.errorMessage = 'Configuración de cliente inválida. Por favor, contacta al administrador.';
      } else {
        this.errorMessage = 'Error de autenticación. Por favor, intenta nuevamente.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}

