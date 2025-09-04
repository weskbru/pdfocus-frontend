import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // A LINHA MAIS IMPORTANTE PARA O NOSSO DIAGNÓSTICO
  const token = authService.obterToken();
  console.log('AuthGuard está verificando. O token encontrado foi:', token);

  if (token) {
    console.log('Decisão do Guarda: Acesso PERMITIDO.');
    return true;
  }

  console.log('Decisão do Guarda: Acesso NEGADO. Redirecionando para /login.');
  router.navigate(['/login']);
  return false;
};