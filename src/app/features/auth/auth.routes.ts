import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

// Este é o conjunto de rotas para a funcionalidade de autenticação
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '', // Se o usuário navegar para /auth, redireciona para /auth/login
    redirectTo: 'login',
    pathMatch: 'full'
  }
];