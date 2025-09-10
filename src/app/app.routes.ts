import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Rota de Cadastro com Carregamento Preguiçoso (Lazy Loading)
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/pages/cadastro/cadastro')
      .then(m => m.CadastroComponent)
  },
  
  // Rota de Login com Carregamento Preguiçoso (Lazy Loading)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login')
      .then(m => m.LoginComponent)
  },

  // Rota da Dashboard,
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard')
      .then(m => m.Dashboard),
      canActivate: [authGuard]
  },

  // Rotas de redirecionamento (devem ficar por último para funcionar corretamente)
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  } // Qualquer outra rota não encontrada vai para o login
];