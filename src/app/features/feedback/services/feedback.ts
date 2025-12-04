import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <--- Adicione HttpHeaders
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FeedbackData {
  tipo: 'BUG' | 'SUGGESTION' | 'FEATURE' | 'OTHER';
  rating: number | null;
  mensagem: string;
  emailUsuario?: string | null; // Ajustei para aceitar null
  pagina: string;
  userAgent: string;
}

export interface FeedbackResponse {
  id: number;
  tipo: string;
  mensagemStatus: string;
  dataEnvioFormatada: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  // Aponta para a URL do environment (dev ou prod)
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Envia feedback para o backend com o Token de Autenticação
   */
  enviarFeedback(feedbackData: FeedbackData): Observable<FeedbackResponse> {
    
    // 1. Recupera o token (Verifique se a chave é 'auth_token' ou 'token')
    const token = localStorage.getItem('auth_token'); 

    // 2. Cria os headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // 3. Se tiver token, anexa o cabeçalho Authorization
    // Isso é o "crachá" que permite entrar no backend protegido
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // 4. Envia o POST passando as 'headers' como terceiro parâmetro
    return this.http.post<FeedbackResponse>(
      `${this.apiUrl}/feedback`,
      feedbackData,
      { headers } // <--- AQUI ESTAVA FALTANDO
    );
  }
}