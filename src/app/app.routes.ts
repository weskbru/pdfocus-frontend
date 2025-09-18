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
    path: 'disciplinas/nova',
    loadComponent: () => import('./features/disciplinas/pages/disciplina-form/disciplina-form')
      .then(m => m.DisciplinaForm),
    canActivate: [authGuard] // Protegemos a rota para que só utilizadores logados possam criar disciplinas
  },

  {
    // O `:id` é um parâmetro que conterá o UUID da disciplina.
    path: 'disciplinas/editar/:id', 
    loadComponent: () => import('./features/disciplinas/pages/disciplina-form/disciplina-form')
      .then(m => m.DisciplinaForm),
    canActivate: [authGuard]
  },

  // Rota para a página de listagem de disciplinas (também protegida)
   {
    path: 'disciplinas',
    loadComponent: () => import('./features/disciplinas/pages/listar-disciplinas/listar-disciplinas')
      .then(m => m.ListarDisciplinas),
    canActivate: [authGuard]
  },

  {
    // Rota para a página de detalhes de uma disciplina específica (protegida)
    path: 'disciplinas/detalhe/:id', 
    loadComponent: () => import('./features/disciplinas/pages/detalhe-disciplina/detalhe-disciplina')
      .then(m => m.DetalheDisciplina), // Supondo que o nome da classe seja DetalheDisciplina
    canActivate: [authGuard]
  },

  // Rotas de redirecionamento (devem ficar por último)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];