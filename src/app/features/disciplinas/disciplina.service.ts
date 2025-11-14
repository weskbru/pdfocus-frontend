import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../core/auth';

// Interfaces para melhor organização (normalmente em arquivos separados)
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

export interface MaterialResponse {
  id: string;
  nomeOriginal: string;
  tipoArquivo: string;
  tamanho: number;
}

export interface ResumoSimples {
  id: string;
  titulo: string;

  materialId: string | null;

  dataCriacao: string;
}

export interface CriarResumoDeMaterialCommand {
  materialId: string;
  disciplinaId: string; // ✅ Adicione esta linha
  titulo?: string;       // ✅ Adicione esta linha (opcional)
  conteudo?: string;     // ✅ Adicione esta linha (opcional)
}

export interface MaterialSimples {
  id: string;
  nomeArquivo: string;
}

export interface DetalheDisciplinaResponse {
  id: string;
  nome: string;
  descricao: string;
  resumos: ResumoSimples[];
  materiais: Page<MaterialSimples>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  progress: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface ResumoResponse {
  id: string;
  usuarioId: string; 
  titulo: string;
  conteudo: string;
  disciplina: {
    id: string;
    nome: string;

  };
  materialId: string | null;
  dataCriacao: string; // Data como string ISO 8601 (ex: "2025-10-25T03:59:01.123Z")

}

/**
 * Serviço responsável por todas as operações de CRUD relacionadas a Disciplinas e Materiais.
 * Encapsula a comunicação com a API RESTful do backend.
 */
@Injectable({
  providedIn: 'root'
})
export class DisciplinaService {

  // [--- CORREÇÃO AQUI ---]
  // Apontamos para a URL de produção na Railway
  private readonly apiBaseUrl = 'https://pdfocus.up.railway.app';
  private readonly disciplinasUrl = `${this.apiBaseUrl}/disciplinas`;
  private readonly materiaisUrl = `${this.apiBaseUrl}/materiais`;
  private readonly resumosUrl = `${this.apiBaseUrl}/resumos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Método privado auxiliar para criar os cabeçalhos de autorização.
   * @returns HttpHeaders com o token de autenticação
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.obterToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Tratamento centralizado de erros HTTP
   * @param error - Erro retornado pela requisição
   * @returns Observable com mensagem de erro
   */
  private handleError(error: any): Observable<never> {
    console.error('Erro na requisição:', error);

    let errorMessage = 'Ocorreu um erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = `Erro ${error.status}: ${error.message}`;

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // --- OPERAÇÕES DE DISCIPLINA ---

  /**
   * Busca a lista completa de disciplinas do utilizador autenticado.
   * @returns Observable com array de DisciplinaResponse
   */
  buscarDisciplinas(): Observable<DisciplinaResponse[]> {
    return this.http.get<DisciplinaResponse[]>(this.disciplinasUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca os dados básicos de uma única disciplina (usado para edição).
   * @param id - UUID da disciplina
   * @returns Observable com DisciplinaResponse
   */
  buscarDisciplinaPorId(id: string): Observable<DisciplinaResponse> {
    const endpoint = `${this.disciplinasUrl}/${id}`;

    return this.http.get<DisciplinaResponse>(endpoint, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
    * ✅ 5. MÉTODO ATUALIZADO PARA SUPORTAR PAGINAÇÃO
    * Busca o "dossier completo" de uma disciplina, incluindo uma página específica de materiais.
    * @param id - UUID da disciplina a ser buscada.
    * @param page - O número da página de materiais a ser buscada (base 0).
    * @param size - O número de itens por página.
    * @returns Observable com DetalheDisciplinaResponse.
    */
  buscarDetalhesDisciplina(id: string, page: number = 0, size: number = 10): Observable<DetalheDisciplinaResponse> {
    const endpoint = `${this.disciplinasUrl}/${id}`;

    // Cria os parâmetros de query para a paginação (ex: ?page=0&size=10)
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // A requisição agora inclui os parâmetros de paginação
    return this.http.get<DetalheDisciplinaResponse>(endpoint, {
      headers: this.getAuthHeaders(),
      params: params // Adiciona os parâmetros à requisição
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Envia os dados de uma nova disciplina para a API.
   * @param dadosDisciplina - Dados da disciplina a ser criada
   * @returns Observable com DisciplinaResponse da disciplina criada
   */
  criarDisciplina(dadosDisciplina: CriarDisciplinaCommand): Observable<DisciplinaResponse> {
    return this.http.post<DisciplinaResponse>(
      this.disciplinasUrl,
      dadosDisciplina,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
    * Envia os dados atualizados de uma disciplina para a API.
    * @param id - UUID da disciplina a ser atualizada
    * @param dadosDisciplina - Dados atualizados da disciplina
    * @returns Observable com DisciplinaResponse atualizada
    */
  atualizarDisciplina(id: string, dadosDisciplina: AtualizarDisciplinaCommand): Observable<DisciplinaResponse> {
    const endpoint = `${this.disciplinasUrl}/${id}`;

    return this.http.put<DisciplinaResponse>(
      endpoint,
      dadosDisciplina,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Envia uma requisição para apagar uma disciplina específica pelo seu ID.
   * @param id - UUID da disciplina a ser excluída
   * @returns Observable que completa quando a operação é bem-sucedida
   */
  deletarDisciplina(id: string): Observable<void> {
    const endpoint = `${this.disciplinasUrl}/${id}`;

    return this.http.delete<void>(endpoint, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // --- OPERAÇÕES DE MATERIAIS ---

  /**
   * Envia um novo material (arquivo) para a API para ser associado a uma disciplina.
   * @param disciplinaId - ID da disciplina à qual o material pertence
   * @param arquivo - Objeto de arquivo selecionado pelo utilizador
   * @returns Observable com eventos de progresso do upload
   */
  adicionarMaterial(disciplinaId: string, arquivo: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('disciplinaId', disciplinaId);

    return this.http.post(this.materiaisUrl, formData, {
      headers: this.getAuthHeaders(),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Envia uma requisição para apagar um material específico pelo seu ID.
   * @param id - UUID do material a ser apagado
   * @returns Observable que completa quando a operação é bem-sucedida
   */
  deletarMaterial(id: string): Observable<void> {
    const endpoint = `${this.materiaisUrl}/${id}`;

    return this.http.delete<void>(endpoint, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca os detalhes completos de um material específico.
   * @param id - UUID do material
   * @returns Observable com MaterialResponse
   */
  buscarMaterialPorId(id: string): Observable<MaterialResponse> {
    const endpoint = `${this.materiaisUrl}/${id}`;

    return this.http.get<MaterialResponse>(endpoint, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gera a URL para download de um material.
   * @param id - UUID do material
   * @returns URL completa para download do material
   */
  obterUrlDownloadMaterial(id: string): string {
    return `${this.materiaisUrl}/${id}/download`;
  }

  /**
   * Realiza o download de um material.
   * @param id - UUID do material
   * @returns Observable com o blob do arquivo
   */
  downloadMaterial(id: string): Observable<Blob> {
    const endpoint = `${this.materiaisUrl}/${id}/download`;

    return this.http.get(endpoint, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
    * Busca um arquivo de material para ser visualizado inline no navegador.
s   *
    * @param id - O UUID do material.
    * @returns um Observable com o blob do arquivo.
    */
  visualizarMaterial(id: string): Observable<Blob> {
    const endpoint = `${this.materiaisUrl}/${id}/visualizar`;

    // Cria headers com o token de autenticação
    const headers = this.getAuthHeaders();

    return this.http.get(endpoint, {
      headers: headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }


  /**
    * Gera um resumo automático a partir de um material.
    */
  gerarResumoAutomatico(comando: CriarResumoDeMaterialCommand): Observable<ResumoResponse> {
    const endpoint = `${this.resumosUrl}/gerar-automatico`; // Usando resumosUrl
    console.log('Enviando requisição para gerar resumo com o comando:', comando);
    return this.http.post<ResumoResponse>(endpoint, comando, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca os detalhes completos de um resumo específico pelo ID.
   * Utiliza a interface ResumoResponse atualizada.
   * @param id O UUID do resumo.
   * @returns Observable com os dados completos do ResumoResponse.
  D */
  buscarResumoPorId(id: string): Observable<ResumoResponse> { // (Verificação): Já usa ResumoResponse
    const endpoint = `${this.resumosUrl}/${id}`; // Usando resumosUrl
    return this.http.get<ResumoResponse>(endpoint, { headers: this.getAuthHeaders() }) // Usa a interface atualizada
      .pipe(catchError(this.handleError));

  }

  /**
   * Busca a lista completa de resumos do usuário autenticado.
   * A ordenação por data será feita no frontend.
   * @returns Observable com um array de ResumoResponse.
   */
  buscarTodosResumos(): Observable<ResumoResponse[]> {
    const endpoint = this.resumosUrl; // Chama GET /resumos
    return this.http.get<ResumoResponse[]>(endpoint, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}