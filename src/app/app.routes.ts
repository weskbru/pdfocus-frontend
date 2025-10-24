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

  // --- ROTA DE MATERIAIS (Protegida) ---
  {
    //  NOVA ROTA DE UPLOAD:
    // O :disciplinaId é um parâmetro que conterá o UUID da disciplina.
    path: 'disciplinas/detalhe/:disciplinaId/adicionar-material', 
    loadComponent: () => import('./features/materiais/pages/adicionar-material/adicionar-material')
      .then(m => m.AdicionarMaterial),
    canActivate: [authGuard]
  },

    {
    // Rota para visualização detalhada de um resumo
    path: 'resumos/:id', 
    loadComponent: () => import('./features/resumos/components/resumo-detalhe/resumo-detalhe')
      .then(m => m.ResumoDetalhe),
    canActivate: [authGuard]
  },

  // Rotas de redirecionamento (devem ficar por último)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];