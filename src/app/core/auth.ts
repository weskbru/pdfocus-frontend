import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

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

/**
 * DTO para enviar os dados a serem atualizados no perfil do usuário.
 * Corresponde ao comando esperado pela API PUT /usuarios/me (ou similar).
 */
export interface AtualizarPerfilCommand {
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // [--- CORREÇÃO AQUI ---]
  // Apontamos para a URL de produção na Railway
  private readonly apiUrl = 'https://pdfocus.up.railway.app/api';
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

  /**
   * Atualiza os dados do perfil do usuário autenticado (ex: nome).
   * @param dadosPerfil O objeto com os dados a serem atualizados.
   * @returns um Observable com os dados atualizados do usuário.
   */
  atualizarPerfil(dadosPerfil: AtualizarPerfilCommand): Observable<UsuarioDetalhesResponse> {
    // IMPORTANTE: Confirme se '/usuarios/me' é o endpoint correto no seu backend para ATUALIZAR (PUT ou PATCH)
    const endpoint = `${this.apiUrl}/usuarios/me`; 

    const token = this.obterToken();
    if (!token) {
      // Retorna um erro se não houver token, evitando chamada desnecessária
      return throwError(() => new Error('Usuário não autenticado.')); 
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Importante para PUT/POST com corpo
    });

    // Faz a chamada PUT, enviando os dados e esperando a resposta atualizada
    return this.http.put<UsuarioDetalhesResponse>(endpoint, dadosPerfil, { headers: headers })
      .pipe(
         // Opcional: Adicionar tratamento de erro específico se necessário, 
         // mas o handleError geral pode ser suficiente.
         // catchError(this.handleError) 
      );
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