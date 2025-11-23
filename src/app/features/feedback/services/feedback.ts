import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FeedbackData {
  tipo: 'BUG' | 'SUGGESTION' | 'FEATURE' | 'OTHER';
  rating: number | null;
  mensagem: string;
  emailUsuario?: string;
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

  // Apontamos para a URL do environment, que muda conforme o build (dev ou prod)
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Envia feedback para o backend
   */
  enviarFeedback(feedbackData: FeedbackData): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(
      `${this.apiUrl}/feedback`,
      feedbackData
    );
  }
}