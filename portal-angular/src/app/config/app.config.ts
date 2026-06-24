export interface AppConfig {
  features: {
    showThemeToggle: boolean;
    showEntraIdButton: boolean;
    showEmailPasswordLogin: boolean;
  };
}

export const APP_CONFIG: AppConfig = {
  features: {
    showThemeToggle: true, // Enable theme toggle button
    showEntraIdButton: true, // Mostrar Entra ID login b
    showEmailPasswordLogin: true, // Mostrar email/password login
  }
};