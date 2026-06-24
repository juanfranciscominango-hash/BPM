import { Injectable, signal, effect } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // ✨ Angular Signals - Estado reactivo
  private configSignal = signal<AppConfig>(APP_CONFIG);

  // 📖 Read-only signals expuestos al público
  readonly config = this.configSignal.asReadonly();

  constructor() {
    // 🔗 Effect - Reacciona a cambios en configuración
    effect(() => {
      const currentConfig = this.configSignal();
      console.log('🔄 Config updated:', currentConfig);
    });
  }

  /**
   * Get the entire configuration object
   */
  getConfig(): AppConfig {
    return this.configSignal();
  }

  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.configSignal().features[feature];
  }

  /**
   * Get all feature flags
   */
  getFeatures(): AppConfig['features'] {
    return this.configSignal().features;
  }

  /**
   * Update a specific feature flag (for runtime changes if needed)
   */
  setFeature(feature: keyof AppConfig['features'], enabled: boolean): void {
    const currentConfig = this.configSignal();
    this.configSignal.set({
      ...currentConfig,
      features: {
        ...currentConfig.features,
        [feature]: enabled
      }
    });
    console.log(`✅ Feature '${feature}' set to ${enabled}`);
  }
}