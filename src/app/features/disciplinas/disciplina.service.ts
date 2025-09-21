import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth';

// --- DTOs existentes ---
export interface DisciplinaResponse {
  id: string;
  nome: string;
  descricao: string;
}
export interface CriarDisciplinaCommand {
  nome: string;
  descricao: string;
}
export interface AtualizarDisciplinaCommand {
  nome: string;
  descricao: string;
}


/**
 * DTO para a resposta da API ao adicionar um novo material.
 * Supondo que o backend retorna os detalhes do material criado.
 */
export interface MaterialResponse {
  id: string;
  nomeOriginal: string;
  tipoArquivo: string;
  tamanho: number;
}

/**
 * Representa um resumo na lista de detalhes da disciplina.
 * Corresponde ao ResumoSimples do backend.
 */
export interface ResumoSimples {
  id: string;
  titulo: string;
}

/**
 * Representa um material na lista de detalhes da disciplina.
 * Corresponde ao MaterialSimples do backend.
 */
export interface MaterialSimples {
  id: string;
  nomeArquivo: string;
}

/**
 * Representa a resposta completa do "dossier" da disciplina.
 * Corresponde ao DetalheDisciplinaResponse do backend.
 */
export interface DetalheDisciplinaResponse {
  id: string;
  nome: string;
  descricao: string;
  resumos: ResumoSimples[];
  materiais: MaterialSimples[];
}


/**
 * Serviço responsável por todas as operações de CRUD relacionadas a Disciplinas.
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
   * Busca os dados básicos de uma única disciplina (usado para edição).
   */
  buscarDisciplinaPorId(id: string): Observable<DisciplinaResponse> {
    const endpoint = `${this.apiUrl}/${id}`;
    return this.http.get<DisciplinaResponse>(endpoint, { headers: this.getAuthHeaders() });
  }

  /**
   * Busca o "dossier completo" de uma disciplina, incluindo seus resumos e materiais.
   * @param id O UUID da disciplina a ser buscada.
   */
  buscarDetalhesDisciplina(id: string): Observable<DetalheDisciplinaResponse> {
    const endpoint = `${this.apiUrl}/${id}`;
    return this.http.get<DetalheDisciplinaResponse>(endpoint, { headers: this.getAuthHeaders() });
  }

  /**
   * Envia os dados de uma nova disciplina para a API.
   */
  criarDisciplina(dadosDisciplina: CriarDisciplinaCommand): Observable<DisciplinaResponse> {
    return this.http.post<DisciplinaResponse>(this.apiUrl, dadosDisciplina, { headers: this.getAuthHeaders() });
  }

  /**
   * Envia os dados atualizados de uma disciplina para a API.
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

  /**
   * Envia um novo material (arquivo) para a API para ser associado a uma disciplina.
   *
   * @param disciplinaId O ID da disciplina à qual o material pertence.
   * @param arquivo O objeto de arquivo selecionado pelo utilizador.
   * @returns um Observable com os detalhes do material recém-criado.
   */
  adicionarMaterial(disciplinaId: string, arquivo: File): Observable<any> {
  // CORREÇÃO: Endpoint correto no plural
  const endpoint = `http://localhost:8080/materiais`;

  console.log('✅ DEBUG - Endpoint correto:', endpoint);
  console.log('✅ DEBUG - Disciplina ID:', disciplinaId);
  console.log('✅ DEBUG - Arquivo:', arquivo.name, arquivo.size, arquivo.type);

  // CORREÇÃO: Campos exatos que o backend espera
  const formData = new FormData();
  formData.append('arquivo', arquivo); // Campo "arquivo" (não "file")
  formData.append('disciplinaId', disciplinaId); // Campo "disciplinaId"

  // Debug: verificar se o FormData foi criado corretamente
  console.log('✅ DEBUG - Campos do FormData:');
  formData.forEach((value, key) => {
    console.log(`✅ ${key}:`, value);
  });

  return this.http.post(endpoint, formData, {
    headers: this.getAuthHeaders(),
    reportProgress: true,
    observe: 'events'
  });
}


}

