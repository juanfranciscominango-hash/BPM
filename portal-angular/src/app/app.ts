import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InactivityService } from './core/services/inactivity.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private inactivityService = inject(InactivityService);
  private themeService = inject(ThemeService);
  protected readonly title = signal('Portal InnovaConsulting');
}
