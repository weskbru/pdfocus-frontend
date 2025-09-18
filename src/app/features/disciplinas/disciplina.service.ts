import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth';

// --- DTOs para comunicação com a API de Disciplinas ---

export interface DisciplinaResponse {
  id: string;
  nome: string;
  descricao: string;
}

export interface CriarDisciplinaCommand {
  nome: string;
  descricao: string;
}

/**
 * DTO para o comando de atualização. É idêntico ao de criação,
 * mas o separamos por clareza e para futuras expansões.
 */
export interface AtualizarDisciplinaCommand {
  nome: string;
  descricao: string;
}


/**
 * Serviço responsável por todas as operações de CRUD relacionadas a Disciplinas.
 * Ele encapsula a comunicação com a API RESTful do backend.
 */
@Injectable({
  providedIn: 'root'
})
export class DisciplinaService {

  private readonly apiUrl = 'http://localhost:8080/disciplinas'; // Use a porta correta

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Método privado auxiliar para criar os cabeçalhos de autorização.
   * Ajuda a evitar a repetição de código (DRY).
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.obterToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  /**
   * Busca a lista completa de disciplinas do utilizador autenticado.
   */
  buscarDisciplinas(): Observable<DisciplinaResponse[]> {
    return this.http.get<DisciplinaResponse[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  /**
   * Busca uma única disciplina pelo seu ID.
   * Essencial para preencher o formulário de edição com os dados existentes.
   * @param id O UUID da disciplina a ser buscada.
   */
  buscarDisciplinaPorId(id: string): Observable<DisciplinaResponse> {
    const endpoint = `${this.apiUrl}/${id}`;
    return this.http.get<DisciplinaResponse>(endpoint, { headers: this.getAuthHeaders() });
  }

  /**
   * Envia os dados de uma nova disciplina para a API.
   */
  criarDisciplina(dadosDisciplina: CriarDisciplinaCommand): Observable<DisciplinaResponse> {
    return this.http.post<DisciplinaResponse>(this.apiUrl, dadosDisciplina, { headers: this.getAuthHeaders() });
  }

  /**
   * Envia os dados atualizados de uma disciplina para a API.
   * @param id O UUID da disciplina a ser atualizada.
   * @param dadosDisciplina O objeto com os novos dados.
   */
  atualizarDisciplina(id: string, dadosDisciplina: AtualizarDisciplinaCommand): Observable<DisciplinaResponse> {
    const endpoint = `${this.apiUrl}/${id}`;
    return this.http.put<DisciplinaResponse>(endpoint, dadosDisciplina, { headers: this.getAuthHeaders() });
  }

  /**
   * Envia uma requisição para apagar uma disciplina específica pelo seu ID.
   */
  deletarDisciplina(id: string): Observable<void> {
    const endpoint = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(endpoint, { headers: this.getAuthHeaders() });
  }
}

