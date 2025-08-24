import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Nosso método de login
  login(email: string, password: string): Observable<{ token: string }> {
    console.log('AuthService: Tentando logar com', { email, password });

    // --- SIMULAÇÃO DE BACKEND ---
    // Verificamos se as credenciais são as esperadas (isso será feito no backend no futuro)
    if (email === 'teste@email.com' && password === '123456') {
      
      // Simula uma resposta de sucesso da API após 2 segundos
      return of({ token: 'jwt-token-de-exemplo-12345' }).pipe(
        delay(2000), // Simula a demora da rede
        tap(response => {
          console.log('AuthService: Login bem-sucedido!', response);
          // TODO: Salvar o token (ex: no localStorage)
        })
      );

    } else {
      
      // Simula um erro de "Credenciais Inválidas" da API após 1 segundo
      return throwError(() => new Error('E-mail ou senha inválidos.')).pipe(
        delay(1000)
      );
      
    }
    // --- FIM DA SIMULAÇÃO ---
  }
}