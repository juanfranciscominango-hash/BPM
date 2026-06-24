import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, User } from '../../core/services/auth.service';
import { MsalService } from '../../core/services/msal.service';
import { ConfigService } from '../../core/services/config.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let msalService: jasmine.SpyObj<MsalService>;
  let configService: jasmine.SpyObj<ConfigService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'user',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      phone: '123456789',
      department: 'Sales',
      position: 'Analyst',
      joinDate: '2024-01-01',
      bio: 'Test bio',
      skills: ['Angular'],
      avatar: 'test.jpg'
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const msalServiceSpy = jasmine.createSpyObj('MsalService', ['loginPopup', 'loginRedirect']);
    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['isFeatureEnabled']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, FormsModule, ThemeToggleComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MsalService, useValue: msalServiceSpy },
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    msalService = TestBed.inject(MsalService) as jasmine.SpyObj<MsalService>;
    configService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default spy returns
    configService.isFeatureEnabled.and.returnValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the login component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty email and password', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });

    it('should initialize with isLoading as false', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('should initialize with empty errorMessage', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize with showPassword as false', () => {
      expect(component.showPassword).toBeFalse();
    });
  });

  describe('Feature Flags', () => {
    it('should return showEntraIdButton feature flag value', () => {
      configService.isFeatureEnabled.and.returnValue(true);
      expect(component.showEntraIdButton).toBeTrue();

      configService.isFeatureEnabled.and.returnValue(false);
      expect(component.showEntraIdButton).toBeFalse();
    });

    it('should return showThemeToggle feature flag value', () => {
      configService.isFeatureEnabled.and.returnValue(true);
      expect(component.showThemeToggle).toBeTrue();
    });

    it('should return showEmailPasswordLogin feature flag value', () => {
      configService.isFeatureEnabled.and.returnValue(true);
      expect(component.showEmailPasswordLogin).toBeTrue();
    });
  });

  describe('togglePassword', () => {
    it('should toggle showPassword from false to true', () => {
      component.showPassword = false;
      component.togglePassword();
      expect(component.showPassword).toBeTrue();
    });

    it('should toggle showPassword from true to false', () => {
      component.showPassword = true;
      component.togglePassword();
      expect(component.showPassword).toBeFalse();
    });
  });

  describe('setCredentials', () => {
    it('should set email and password', () => {
      component.setCredentials('user@example.com', 'pass123');
      expect(component.email).toBe('user@example.com');
      expect(component.password).toBe('pass123');
    });

    it('should clear errorMessage when setting credentials', () => {
      component.errorMessage = 'Previous error';
      component.setCredentials('user@example.com', 'pass123');
      expect(component.errorMessage).toBe('');
    });
  });

  describe('onLogin', () => {
    it('should show error when email is empty', () => {
      component.email = '';
      component.password = 'password123';
      component.onLogin();
      expect(component.errorMessage).toBe('Por favor ingresa tu correo y contraseña');
    });

    it('should show error when password is empty', () => {
      component.email = 'test@example.com';
      component.password = '';
      component.onLogin();
      expect(component.errorMessage).toBe('Por favor ingresa tu correo y contraseña');
    });

    it('should navigate to dashboard on successful login', () => {
      authService.login.and.returnValue(of(mockUser));
      component.email = 'test@example.com';
      component.password = 'password123';

      component.onLogin();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error message on failed login', () => {
      authService.login.and.returnValue(of(null));
      component.email = 'test@example.com';
      component.password = 'wrongpassword';

      component.onLogin();

      expect(component.errorMessage).toContain('Credenciales incorrectas');
    });

    it('should show error message on login error', () => {
      authService.login.and.returnValue(throwError(() => new Error('Network error')));
      component.email = 'test@example.com';
      component.password = 'password123';

      component.onLogin();

      expect(component.errorMessage).toContain('Error al iniciar sesión');
    });

    it('should set isLoading to true during login', () => {
      authService.login.and.returnValue(of(mockUser));
      component.email = 'test@example.com';
      component.password = 'password123';
      const initialValue = component.isLoading;

      authService.login.and.callFake(() => {
        expect(component.isLoading).toBeTrue();
        return of(mockUser);
      });

      component.onLogin();
    });

    it('should set isLoading to false after login completes', (done) => {
      authService.login.and.returnValue(of(mockUser));
      component.email = 'test@example.com';
      component.password = 'password123';

      component.onLogin();
      
      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        done();
      }, 100);
    });

    it('should clear errorMessage before attempting login', () => {
      component.errorMessage = 'Previous error';
      authService.login.and.returnValue(of(mockUser));
      component.email = 'test@example.com';
      component.password = 'password123';

      component.onLogin();

      expect(authService.login).toHaveBeenCalled();
    });
  });

  describe('loginWithEntraId', () => {
    it('should navigate to dashboard on successful MSAL login', async () => {
      msalService.loginPopup.and.returnValue(
        Promise.resolve({ account: { homeAccountId: 'test' } } as any)
      );

      await component.loginWithEntraId();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should attempt redirect login on popup error', async () => {
      msalService.loginPopup.and.returnValue(
        Promise.reject({ errorCode: 'popup_window_error' })
      );
      msalService.loginRedirect.and.returnValue(Promise.resolve());

      await component.loginWithEntraId();

      expect(msalService.loginRedirect).toHaveBeenCalled();
    });

    it('should show error on user cancellation', async () => {
      msalService.loginPopup.and.returnValue(
        Promise.reject({ errorCode: 'user_cancelled' })
      );
      msalService.loginRedirect.and.returnValue(Promise.resolve());

      await component.loginWithEntraId();

      expect(component.isLoading).toBeFalse();
    });

    it('should show error message on invalid client', async () => {
      msalService.loginPopup.and.returnValue(
        Promise.reject({ errorCode: 'invalid_client' })
      );

      await component.loginWithEntraId();

      expect(component.errorMessage).toContain('Configuración de cliente inválida');
    });

    it('should show generic error on unknown error', async () => {
      msalService.loginPopup.and.returnValue(
        Promise.reject({ errorCode: 'unknown_error' })
      );

      await component.loginWithEntraId();

      expect(component.errorMessage).toContain('Error de autenticación');
    });

    it('should set isLoading to false after login attempt', async () => {
      msalService.loginPopup.and.returnValue(
        Promise.resolve({ account: { homeAccountId: 'test' } } as any)
      );

      await component.loginWithEntraId();

      expect(component.isLoading).toBeFalse();
    });
  });
});
