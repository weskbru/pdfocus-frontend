import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private readonly apiUrl = 'https://pdfocus.up.railway.app';

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