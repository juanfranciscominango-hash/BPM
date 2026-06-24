import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender
  },
  // Excluir auth/callback del pre-renderizado
  {
    path: 'auth/callback',
    renderMode: RenderMode.Server
  },
  // Catch-all route
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
