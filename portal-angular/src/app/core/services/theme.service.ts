import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';

  // Signal para el tema actual
  private _currentTheme = signal<Theme>('light');

  // Computed para exponer el tema actual
  public currentTheme = computed(() => this._currentTheme());

  constructor() {
    this.initializeTheme();
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
}