import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// ✅ CORREÇÃO: Importando do arquivo irmão na pasta 'core'
import { AuthService } from '../auth'; 

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogado()) {
    return true;
  }

  console.warn('Acesso negado: Usuário não autenticado.');
  router.navigate(['/login']);
  return false;
};