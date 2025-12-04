import { Routes } from '@angular/router';
import { authGuard } from '../app/core/guards/auth-guard';
import { AssinaturaComponent } from './features/assinatura/assinatura';
import { ConfirmarEmailComponent } from './features/auth/pages/confirmar-email/confirmar-email';

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

  // 2. NOVA ROTA RAIZ (Landing Page)
  {
    path: '',
    loadComponent: () => import('./landing/landing')
      .then(m => m.LandingComponent)
  },

  // Rota da Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard] // Agora o nome bate com a const exportada
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
      .then(m => m.DetalheDisciplina),
    canActivate: [authGuard]
  },

  // --- ROTA DE MATERIAIS (Protegida) ---
  {
    // Rota de Upload
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

  // ✅ CORREÇÃO: A rota 'assinatura' deve vir ANTES do Wildcard (**)
  {
    path: 'assinatura', 
    component: AssinaturaComponent,
    canActivate: [authGuard] 
  },

  { path: 'confirmar-email', component: ConfirmarEmailComponent },

  // 🛑 IMPORTANTE: Rotas de redirecionamento (Wildcard) devem ficar SEMPRE POR ÚLTIMO
  { path: '**', redirectTo: '', pathMatch: 'full' }
];