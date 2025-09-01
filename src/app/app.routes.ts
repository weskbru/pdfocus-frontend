// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'cadastro', 
    loadComponent: () => import('./features/auth/pages/cadastro/cadastro')
      .then(m => m.CadastroComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/pages/login/login')
      .then(m => m.LoginComponent)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];