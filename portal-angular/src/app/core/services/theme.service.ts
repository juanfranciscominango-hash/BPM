import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { ParametricService } from './parametric.service';
import { HttpClient } from '@angular/common/http';
import { CONSTANTES } from '../../constantes';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly PRIMARY_COLOR_KEY = 'corporate-primary';
  private readonly SECONDARY_COLOR_KEY = 'corporate-secondary';
  private readonly ACCENT_COLOR_KEY = 'corporate-accent';
  private readonly LOGO_PATH_KEY = 'corporate-logo';
  private readonly BRAND_NAME_KEY = 'corporate-brand-name';
  private readonly SLOGAN_KEY = 'corporate-slogan';
 
  private injector = inject(Injector);
 
  // Signal para el tema actual
  private _currentTheme = signal<Theme>('light');
  // Signal para la ruta del logo parametrizado
  private _logoPath = signal<string>('logo-InnovaConsulting-azul.png');
  // Signal para el nombre de marca parametrizado
  private _brandName = signal<string>('Hoptech');
  // Signal para el slogan parametrizado
  private _slogan = signal<string>('SOLUCIONES TECNOLÓGICAS');
 
  // Computed para exponer el tema actual y la ruta del logo
  public currentTheme = computed(() => this._currentTheme());
  public logoPath = computed(() => this._logoPath());
  public brandName = computed(() => this._brandName());
  public slogan = computed(() => this._slogan());
 
  constructor() {
    this.applyCachedColors();
    this.initializeTheme();
    // Si hay sesión iniciada, cargar colores directamente. Si no, llamar al endpoint público
    if (localStorage.getItem(CONSTANTES.STORAGE.USER)) {
      this.loadColorsFromDatabase();
    } else {
      this.loadPublicBrandInfo();
    }
  }
 
  private initializeTheme(): void {
    try {
      // Intentar cargar desde localStorage
      const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
 
      if (savedTheme && this.isValidTheme(savedTheme)) {
        this.setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
 
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          const hasManualTheme = localStorage.getItem(this.THEME_KEY) !== null;
          if (!hasManualTheme) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        });
    } catch (error) {
      console.error('Error initializing theme:', error);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }
 
  private isValidTheme(theme: string): theme is Theme {
    return theme === 'light' || theme === 'dark';
  }
 
  public setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }
 
  public toggleTheme(): void {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
 
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
 
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    }
  }
 
  public clearThemePreference(): void {
    localStorage.removeItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
  }
 
  // ─── COLORES CORPORATIVOS DINÁMICOS (PARAMÉTRICOS) ──────────────────────────
 
  private applyCachedColors(): void {
    const primary = localStorage.getItem(this.PRIMARY_COLOR_KEY) || '#e30613';
    const secondary = localStorage.getItem(this.SECONDARY_COLOR_KEY) || '#b30000';
    const accent = localStorage.getItem(this.ACCENT_COLOR_KEY) || '#D4AF37';
    const cachedLogo = localStorage.getItem(this.LOGO_PATH_KEY);
    const cachedBrand = localStorage.getItem(this.BRAND_NAME_KEY);
    const cachedSlogan = localStorage.getItem(this.SLOGAN_KEY);
    if (cachedLogo) {
      this._logoPath.set(cachedLogo);
    }
    if (cachedBrand) {
      this._brandName.set(cachedBrand);
    }
    if (cachedSlogan) {
      this._slogan.set(cachedSlogan);
    }
    this.applyCSSVariables(primary, secondary, accent);
  }
 
  public loadColorsFromDatabase(): void {
    try {
      const parametricService = this.injector.get(ParametricService);
      parametricService.getTables().subscribe({
        next: (tables) => {
          const table = tables.find(t => 
            (t.label && t.label.toLowerCase().includes('parametros generales')) || 
            (t.name && t.name.toLowerCase().includes('parametros_generales')) ||
            (t.name && t.name.toLowerCase().includes('parametros generales')) ||
            (t.name && t.name.toLowerCase().includes('paranmetros_generales'))
          );
          if (table && table.id) {
            parametricService.getTableData(table.id).subscribe({
              next: (data) => {
                const primaryRow = data.find(r => r.descripcion && r.descripcion.toLowerCase() === 'color_primario');
                const secondaryRow = data.find(r => r.descripcion && r.descripcion.toLowerCase() === 'color_secundario');
                const accentRow = data.find(r => r.descripcion && r.descripcion.toLowerCase() === 'color_acento');
                const logoRow = data.find(r => r.descripcion && (r.descripcion.toLowerCase() === 'ruta_logo' || r.descripcion.toLowerCase() === 'ruta logo'));
                const brandRow = data.find(r => r.descripcion && (r.descripcion.toLowerCase() === 'nombre_marca' || r.descripcion.toLowerCase() === 'nombre marca'));
                const sloganRow = data.find(r => r.descripcion && (r.descripcion.toLowerCase() === 'slogan_marca' || r.descripcion.toLowerCase() === 'slogan marca'));
 
                const primary = primaryRow ? primaryRow.valor : '#e30613';
                const secondary = secondaryRow ? secondaryRow.valor : '#b30000';
                const accent = accentRow ? accentRow.valor : '#D4AF37';
                const logo = logoRow && logoRow.valor ? logoRow.valor : 'logo-InnovaConsulting-azul.png';
                const brand = brandRow && brandRow.valor ? brandRow.valor : 'Hoptech';
                const slogan = sloganRow && sloganRow.valor ? sloganRow.valor : 'SOLUCIONES TECNOLÓGICAS';
 
                localStorage.setItem(this.PRIMARY_COLOR_KEY, primary);
                localStorage.setItem(this.SECONDARY_COLOR_KEY, secondary);
                localStorage.setItem(this.ACCENT_COLOR_KEY, accent);
                localStorage.setItem(this.LOGO_PATH_KEY, logo);
                localStorage.setItem(this.BRAND_NAME_KEY, brand);
                localStorage.setItem(this.SLOGAN_KEY, slogan);
 
                this._logoPath.set(logo);
                this._brandName.set(brand);
                this._slogan.set(slogan);
                this.applyCSSVariables(primary, secondary, accent);
              },
              error: (err) => {
                console.warn('Could not fetch parametric table data (unauthorized or network error):', err.status);
              }
            });
          }
        },
        error: (err) => {
          console.warn('Could not fetch parametric tables list (unauthorized or network error):', err.status);
        }
      });
    } catch (e) {
      console.warn('Could not lazy load ParametricService yet:', e);
    }
  }

  private hexToRgb(hex: string): string {
    if (!hex) return '227, 6, 19'; // Fallback to primary red RGB
    hex = hex.replace(/^#/, '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `${r}, ${g}, ${b}`;
  }

  public loadPublicBrandInfo(): void {
    try {
      const http = this.injector.get(HttpClient);
      // Asumimos la URL base del backend desde la configuración
      http.get<any>(`/api/v1/public/brand`).subscribe({
        next: (res) => {
          if (res) {
            const primary = res.primaryColor || '#e30613';
            const secondary = res.secondaryColor || '#b30000';
            const accent = res.accentColor || '#D4AF37';
            const logo = res.logoPath || 'logo-InnovaConsulting-azul.png';
            const brand = res.brandName || 'Hoptech';
            const slogan = res.slogan || 'SOLUCIONES TECNOLÓGICAS';

            localStorage.setItem(this.PRIMARY_COLOR_KEY, primary);
            localStorage.setItem(this.SECONDARY_COLOR_KEY, secondary);
            localStorage.setItem(this.ACCENT_COLOR_KEY, accent);
            localStorage.setItem(this.LOGO_PATH_KEY, logo);
            localStorage.setItem(this.BRAND_NAME_KEY, brand);
            localStorage.setItem(this.SLOGAN_KEY, slogan);

            this._logoPath.set(logo);
            this._brandName.set(brand);
            this._slogan.set(slogan);
            this.applyCSSVariables(primary, secondary, accent);
          }
        },
        error: (err) => {
          console.warn('Could not load public brand info, using local cache / defaults:', err);
        }
      });
    } catch (e) {
      console.warn('Could not retrieve HttpClient yet:', e);
    }
  }

  public applyCorporateColors(primary: string, secondary: string, accent: string): void {
    localStorage.setItem(this.PRIMARY_COLOR_KEY, primary);
    localStorage.setItem(this.SECONDARY_COLOR_KEY, secondary);
    localStorage.setItem(this.ACCENT_COLOR_KEY, accent);
    this.applyCSSVariables(primary, secondary, accent);
  }

  public applyCSSVariables(primary: string, secondary: string, accent: string): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-light', secondary);
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-accent', accent);

    try {
      const rgb = this.hexToRgb(primary);
      root.style.setProperty('--color-primary-rgb', rgb);
    } catch (e) {
      console.error('Error parsing primary hex to rgb:', e);
    }
    
    // Gradientes dinámicos
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`);
    root.style.setProperty('--gradient-bgr', `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`);
    root.style.setProperty('--gradient-login-bg', `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`);
  }
}