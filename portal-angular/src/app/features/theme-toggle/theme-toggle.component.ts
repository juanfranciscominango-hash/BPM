import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'innova-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-toggle-container">
      <!-- Botón de toggle simple -->
      <button 
        type="button"
        class="btn-theme-toggle"
        (click)="toggleTheme()"
        [title]="getCurrentThemeLabel()">
        <i [class]="getCurrentThemeIcon()"></i>
        <span class="theme-text ms-1">{{ getCurrentThemeText() }}</span>
      </button>
    </div>
  `,
  styles: [`
    .theme-toggle-container {
      display: flex;
      align-items: center;
    }

    .btn-theme-toggle {
      background: var(--theme-toggle-bg);
      border: 1px solid var(--theme-toggle-border);
      color: var(--theme-toggle-text);
      border-radius: 0.25rem;
      padding: 0.125rem 0.375rem;
      transition: all 0.2s ease-in-out;
      display: flex;
      align-items: center;
      min-width: auto;
      font-size: 0.8rem;
      
      &:hover {
        background: var(--theme-toggle-hover-bg);
        border-color: var(--theme-toggle-hover-border);
        color: var(--theme-toggle-hover-text);
        transform: translateY(-1px);
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 0.15rem var(--theme-toggle-focus-shadow);
      }

      i {
        font-size: 0.75rem;
      }

      .theme-text {
        font-size: 0.75rem;
        font-weight: 500;
      }
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getCurrentThemeText(): string {
    const current = this.themeService.currentTheme();
    return current === 'light' ? 'Claro' : 'Oscuro';
  }

  getCurrentThemeIcon(): string {
    const current = this.themeService.currentTheme();
    return current === 'light' ? 'bi-sun' : 'bi-moon';
  }

  getCurrentThemeLabel(): string {
    const current = this.themeService.currentTheme();
    return current === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
  }
}