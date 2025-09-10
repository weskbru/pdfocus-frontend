import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces para Tipagem (DTOs do Frontend) ---
export interface CadastrarUsuarioCommand {
  nome: string;
  email: string;
  senha: string;
}

export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
}

export interface AutenticarUsuarioCommand {
  email: string;
  senha: string;
}

export interface AuthenticationResponse {
  token: string;
}

/**
 * DTO para a resposta do endpoint /usuarios/me.
 * Corresponde ao UsuarioDetalhesResponse do backend.
 */
export interface UsuarioDetalhesResponse {
  nome: string;
  email: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:8080'; // Lembre-se de usar a porta correta!
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

  /**
   * Busca os detalhes do utilizador atualmente autenticado.
   *
   * @returns um Observable com os dados do utilizador.
   */
  buscarUsuarioLogado(): Observable<UsuarioDetalhesResponse> {
    const endpoint = `${this.apiUrl}/usuarios/me`;
    
    // Para endpoints protegidos, precisamos de enviar o token no cabeçalho.
    const token = this.obterToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Faz a chamada GET, passando os cabeçalhos de autorização.
    return this.http.get<UsuarioDetalhesResponse>(endpoint, { headers: headers });
  }


  // --- MÉTODOS DE GESTÃO DE TOKEN ---

  guardarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obterToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

