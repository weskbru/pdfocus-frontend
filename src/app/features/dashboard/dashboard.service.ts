import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth';

/**
 * DTO para a resposta do endpoint /dashboard/estatisticas.
 */
export interface DashboardEstatisticasResponse {
  totalDisciplinas: number;
  resumosCriados: number;
  totalMateriais: number;
}

/**
 * DTO para cada item na lista de materiais recentes.
 * Corresponde ao MaterialRecenteResponse do backend.
 */
export interface MaterialRecenteResponse {
  id: string;
  nome: string;
  nomeDisciplina: string;
  dataUploadFormatada: string;
  tamanhoFormatado: string;
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl = 'http://localhost:8080/dashboard';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Busca as estatísticas agregadas do utilizador logado.
   */
  buscarEstatisticas(): Observable<DashboardEstatisticasResponse> {
    const endpoint = `${this.apiUrl}/estatisticas`;
    const token = this.authService.obterToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<DashboardEstatisticasResponse>(endpoint, { headers });
  }

  /**
   * ADICIONE ESTE NOVO MÉTODO:
   * Busca a lista de materiais mais recentes do utilizador logado.
   */
  buscarMateriaisRecentes(): Observable<MaterialRecenteResponse[]> {
    const endpoint = `${this.apiUrl}/materiais/recentes`;
    const token = this.authService.obterToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // A única diferença é que esperamos receber um array de MaterialRecenteResponse
    return this.http.get<MaterialRecenteResponse[]>(endpoint, { headers });
  }
}
