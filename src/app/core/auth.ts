import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces para Tipagem (DTOs do Frontend) ---
// Estas interfaces definem os "contratos" de dados entre o nosso frontend e o backend.

/** DTO para o corpo da requisição de REGISTRO */
export interface CadastrarUsuarioCommand {
  nome: string;
  email: string;
  senha: string;
}

/** DTO para a resposta do REGISTRO */
export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
}

/** DTO para o corpo da requisição de LOGIN */
export interface AutenticarUsuarioCommand {
  email: string;
  senha: string;
}

/** DTO para a resposta do LOGIN (contém o token) */
export interface AuthenticationResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:8080';
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE API ---

  register(dadosUsuario: CadastrarUsuarioCommand): Observable<UsuarioResponse> {
    const endpoint = `${this.apiUrl}/auth/register`;
    return this.http.post<UsuarioResponse>(endpoint, dadosUsuario);
  }

  login(credenciais: AutenticarUsuarioCommand): Observable<AuthenticationResponse> {
    const endpoint = `${this.apiUrl}/auth/login`;
    return this.http.post<AuthenticationResponse>(endpoint, credenciais);
  }

  // --- MÉTODOS DE GERENCIAMENTO DE TOKEN ---

  guardarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obterToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
  // Simplesmente remove a chave do token do localStorage
  localStorage.removeItem(this.TOKEN_KEY);
}
}