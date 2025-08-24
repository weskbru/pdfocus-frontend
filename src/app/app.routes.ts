import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    // ANTES: loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
    // DEPOIS:
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];