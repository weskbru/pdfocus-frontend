import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  DisciplinaService,
  DetalheDisciplinaResponse,
  ResumoSimples,
  MaterialSimples,
  MaterialResponse,
  ResumoResponse,
  CriarResumoDeMaterialCommand
} from '../../disciplina.service';

// IMPORTS DO FONT AWESOME
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faChevronDown, faFilePdf, faPlus, faUpload, faFileWord, faFilePowerpoint, faFile, faEye, faDownload, faTrash, faEdit, faExclamationTriangle, faSpinner, faPlusCircle, faCloudUploadAlt, faTimes, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';

// ✅ IMPORT DO NOVO MODAL
import { SelecionarMaterialModal } from '../../../resumos/components/selecionar-material-modal/selecionar-material-modal';
/**
 * Componente responsável por exibir os detalhes de uma única disciplina.
 */
@Component({
  selector: 'app-detalhe-disciplina',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, SelecionarMaterialModal],
  templateUrl: './detalhe-disciplina.html',
  styleUrls: ['./detalhe-disciplina.css']
})
export class DetalheDisciplina implements OnInit {

  // ÍCONES DISPONIBILIZADOS PARA O TEMPLATE HTML
  faUpload = faUpload;
  faPlus = faPlus;
  faChevronDown = faChevronDown;
  faCloudUploadAlt = faCloudUploadAlt;
  faTimes = faTimes;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faPlusCircle = faPlusCircle;
  faSearch = faSearch;
  faFilter = faFilter;
  faFilePdf = faFilePdf;
  faDownload = faDownload;
  faTrash = faTrash;
  faEye = faEye;

  disciplina: DetalheDisciplinaResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  // PROPRIEDADES DE PAGINAÇÃO (ADICIONAR)
  paginaAtual: number = 0;
  itensPorPagina: number = 10;
  totalPaginas: number = 0;
  totalItens: number = 0;

  // Propriedades para o modal de upload
  modalUploadAberto = false;
  isUploading = false;
  arquivoSelecionado: File | null = null;
  uploadErrorMessage: string | null = null;

  // Propriedades para o modal de confirmação de exclusão
  modalExclusaoAberto = false;
  materialParaExcluir: MaterialSimples | null = null;
  isExcluindo = false;
  exclusaoErrorMessage: string | null = null;

  private disciplinaId: string | null = null;

  //PROPRIEDADES PARA O MODAL DE SELEÇÃO DE MATERIAL
  modalSelecaoMaterialAberto = false;
  materialParaResumo: MaterialSimples | null = null;

  // GETTER PARA OS MATERIAIS (IMPORTANTE!)
  get materiais() {
    return this.disciplina?.materiais?.content || [];
  }

  // GETTER PARA OS RESUMOS
  get resumos() {
    return this.disciplina?.resumos || [];
  }

  // GETTER PARA VERIFICAR SE TEM MATERIAIS
  get temMateriais(): boolean {
    return this.materiais.length > 0;
  }

  // GETTER PARA VERIFICAR SE TEM RESUMOS
  get temResumos(): boolean {
    return this.resumos.length > 0;
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disciplinaService: DisciplinaService
  ) { }

  ngOnInit(): void {
    this.disciplinaId = this.route.snapshot.paramMap.get('id');
    if (this.disciplinaId) {
      this.carregarDetalhesDaDisciplina(this.disciplinaId);
    } else {
      this.isLoading = false;
      this.errorMessage = "ID da disciplina não fornecido na URL.";
    }
  }

  // ATUALIZAR ESTE MÉTODO PARA USAR PAGINAÇÃO
  carregarDetalhesDaDisciplina(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.disciplinaService.buscarDetalhesDisciplina(id, this.paginaAtual, this.itensPorPagina).subscribe({
      next: (dados) => {
        this.disciplina = dados;
        this.totalPaginas = dados.materiais.totalPages;
        this.totalItens = dados.materiais.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Não foi possível carregar os detalhes da disciplina.";
        console.error('Erro ao buscar detalhes da disciplina:', err);
      }
    });
  }

  // MÉTODOS DE PAGINAÇÃO (ADICIONAR)
  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas - 1) {
      this.paginaAtual++;
      this.carregarDetalhesDaDisciplina(this.disciplinaId!);
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.carregarDetalhesDaDisciplina(this.disciplinaId!);
    }
  }

  mudarItensPorPagina(novoTamanho: number): void {
    this.itensPorPagina = novoTamanho;
    this.paginaAtual = 0;
    this.carregarDetalhesDaDisciplina(this.disciplinaId!);
  }

  // ✅ NOVOS MÉTODOS PARA O FLUXO DE CRIAÇÃO DE RESUMO

  /**
   * Abre o modal de seleção de material para criar resumo
   */
  abrirModalSelecaoMaterial(): void {
    this.modalSelecaoMaterialAberto = true;
    this.materialParaResumo = null;
  }


  /**
   * Fecha o modal de seleção de material
   */
  fecharModalSelecaoMaterial(): void {
    this.modalSelecaoMaterialAberto = false;
    this.materialParaResumo = null;
  }

  /**
   * Chamado quando um material é selecionado no modal
   * @param material Material selecionado pelo usuário
   */
  onMaterialSelecionado(material: MaterialSimples): void {
    this.materialParaResumo = material;
    this.modalSelecaoMaterialAberto = false;

    // ✅ AGORA GERAMOS O RESUMO AUTOMATICAMENTE
    this.gerarResumoAutomatico(material);
  }

  /**
   * Gera resumo automático usando o backend
   */
  // NO COMPONENTE, ADICIONE LOGS PARA DEBUG:
  gerarResumoAutomatico(material: MaterialSimples): void {
    this.isLoading = true;
    this.errorMessage = null;

    const comandoParaApi: CriarResumoDeMaterialCommand = {
      materialId: material.id,
      disciplinaId: this.disciplinaId!
    };

    // ✅ 1. CRIAR RESUMO OTIMISTA
    const resumoOptimista: ResumoSimples = {
      id: `temp-${Date.now()}`,
      titulo: `Gerando resumo para ${material.nomeArquivo}...`,
      materialId: material.id,
      dataCriacao: new Date().toISOString()
    };

    // ✅ 2. ATUALIZAÇÃO IMUTÁVEL DA LISTA
    this.atualizarListaResumosOptimista(resumoOptimista);

    // ✅ 3. CHAMADA PARA API
    this.disciplinaService.gerarResumoAutomatico(comandoParaApi).subscribe({
      next: (resumoReal: ResumoResponse) => {
        this.isLoading = false;

        // ✅ 4. SUBSTITUIR RESUMO OTIMISTA PELO REAL
        this.substituirResumoOptimista(resumoOptimista.id, resumoReal);

        this.mostrarMensagemSucesso(`Resumo para "${material.nomeArquivo}" criado com sucesso!`);
      },
      error: (err) => {
        this.isLoading = false;

        // ✅ 5. REMOVER RESUMO OTIMISTA EM CASO DE ERRO
        this.removerResumoOptimista(resumoOptimista.id);

        console.error('❌ ERRO DETALHADO:', err);
        this.errorMessage = 'Erro ao gerar resumo automático. Tente novamente.';
      }
    });
  }
  /**
   * Método auxiliar: Adiciona resumo otimista à lista
   */
  private atualizarListaResumosOptimista(resumoOptimista: ResumoSimples): void {
    if (!this.disciplina) return;

    // ✅ ATUALIZAÇÃO IMUTÁVEL - Angular detecta a mudança
    this.disciplina = {
      ...this.disciplina,
      resumos: [resumoOptimista, ...this.disciplina.resumos]
    };
  }

  /**
 * Navega para a página de detalhes do resumo
 */
  abrirResumo(resumo: ResumoSimples): void {
    // ✅ Verifica se é um resumo temporário (ainda gerando)
    if (resumo.id.startsWith('temp-')) {
      return;
    }

    // ✅ Navega para a página dedicada do resumo
    this.router.navigate(['/resumos', resumo.id]);
  }

  /**
     * Método auxiliar: Substitui resumo otimista pelo real
     */
  private substituirResumoOptimista(idTemporario: string, resumoReal: ResumoResponse): void {
    if (!this.disciplina) return;

    // ✅ CONVERTE ResumoResponse PARA ResumoSimples
    const resumoSimples: ResumoSimples = {
      id: resumoReal.id,
      titulo: resumoReal.titulo,
      materialId: resumoReal.materialId,
      dataCriacao: resumoReal.dataCriacao
    };

    // ✅ SUBSTITUI IMUTAVELMENTE
    this.disciplina = {
      ...this.disciplina,
      resumos: this.disciplina.resumos.map(resumo =>
        resumo.id === idTemporario ? resumoSimples : resumo
      )
    };
  }

  /**
  * Método auxiliar: Remove resumo otimista em caso de erro
  */
  private removerResumoOptimista(idTemporario: string): void {
    if (!this.disciplina) return;

    this.disciplina = {
      ...this.disciplina,
      resumos: this.disciplina.resumos.filter(resumo => resumo.id !== idTemporario)
    };
  }
  /**
   * Mostra mensagem de sucesso (simples por enquanto)
   */
  mostrarMensagemSucesso(mensagem: string): void {
    // Implementação simples - você pode melhorar com toast/snackbar depois
    alert(mensagem);
  }

  /**
   * Abre o modal de criação de resumo (próxima etapa)
   * @param material Material selecionado para criar o resumo
   */
  abrirModalCriacaoResumo(material: MaterialSimples): void {
    // ✅ Este método será implementado quando criarmos o GerarResumoModal
    console.log('Abrir modal de criação de resumo para:', material.nomeArquivo);
    // TODO: Implementar abertura do modal de criação de resumo
  }


  // MÉTODOS AUXILIARES PARA OS DADOS (ADICIONAR)
  getQuantidadeResumos(material: MaterialSimples): number {
    if (!this.disciplina?.resumos) return 0;
    return this.disciplina.resumos.filter(resumo => resumo.materialId === material.id).length;
  }

  getDataUltimoResumo(material: MaterialSimples): string {
    const resumosMaterial = this.getResumosDoMaterial(material);
    if (resumosMaterial.length === 0) {
      return 'Nenhum resumo';
    }

    const ultimoResumo = resumosMaterial.sort((a, b) =>
      new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
    )[0];

    return new Date(ultimoResumo.dataCriacao).toLocaleDateString('pt-BR');
  }

  getResumosDoMaterial(material: MaterialSimples): ResumoSimples[] {
    if (!this.disciplina?.resumos) return [];
    return this.disciplina.resumos.filter(resumo => resumo.materialId === material.id);
  }

  // --- LÓGICA DO MODAL DE UPLOAD ---

  abrirModalUpload(): void {
    this.modalUploadAberto = true;
  }

  fecharModalUpload(): void {
    this.modalUploadAberto = false;
    this.arquivoSelecionado = null;
    this.isUploading = false;
    this.uploadErrorMessage = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validação simples de tamanho (ex: 100MB)
      if (file.size > 100 * 1024 * 1024) {
        this.uploadErrorMessage = 'Arquivo muito grande. O máximo é 100MB.';
        return;
      }
      this.arquivoSelecionado = file;
      this.uploadErrorMessage = null;
    }
  }

  removerArquivoSelecionado(): void {
    this.arquivoSelecionado = null;
  }

  fazerUploadMaterial(): void {
    if (!this.disciplinaId || !this.arquivoSelecionado) return;

    this.isUploading = true;
    this.uploadErrorMessage = null;

    this.disciplinaService.adicionarMaterial(this.disciplinaId, this.arquivoSelecionado).subscribe({
      next: (materialCriado) => {
        this.isUploading = false;
        this.fecharModalUpload();
        this.carregarDetalhesDaDisciplina(this.disciplinaId!); // Recarrega os dados
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadErrorMessage = 'Ocorreu um erro ao enviar o material. Tente novamente.';
        console.error('Erro ao adicionar material:', err);
      }
    });
  }

  // --- LÓGICA DE EXCLUSÃO DE MATERIAL ---

  abrirModalExclusao(material: MaterialSimples): void {
    this.materialParaExcluir = material;
    this.modalExclusaoAberto = true;
    this.exclusaoErrorMessage = null;
  }

  fecharModalExclusao(): void {
    this.modalExclusaoAberto = false;
    this.materialParaExcluir = null;
    this.isExcluindo = false;
    this.exclusaoErrorMessage = null;
  }

  confirmarExclusao(): void {
    if (!this.materialParaExcluir || !this.disciplinaId) return;

    this.isExcluindo = true;
    this.exclusaoErrorMessage = null;

    this.disciplinaService.deletarMaterial(this.materialParaExcluir.id).subscribe({
      next: () => {
        this.isExcluindo = false;
        this.fecharModalExclusao();
        this.carregarDetalhesDaDisciplina(this.disciplinaId!); // Recarrega os dados
      },
      error: (err) => {
        this.isExcluindo = false;
        this.exclusaoErrorMessage = 'Ocorreu um erro ao excluir o material. Tente novamente.';
        console.error('Erro ao excluir material:', err);
      }
    });
  }

  /**
   * Inicia o processo de download de um ficheiro de material.
   * @param material O objeto MaterialSimples que o utilizador quer descarregar.
   */
  baixarMaterial(material: MaterialSimples): void {
    this.disciplinaService.downloadMaterial(material.id).subscribe({
      next: (blob) => {
        // Cria um URL temporário para o blob (os dados do ficheiro).
        const url = window.URL.createObjectURL(blob);

        // Cria um elemento de link <a> invisível.
        const a = document.createElement('a');
        a.href = url;
        a.download = material.nomeArquivo; // Define o nome original do ficheiro.

        // Adiciona o link ao corpo do documento, simula um clique e remove-o.
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Liberta a memória usada pelo URL temporário.
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage = "Não foi possível descarregar o material. Tente novamente.";
        console.error("Erro no download:", err);
      }
    });
  }

  /**
   * Abre o material em uma nova aba do navegador.
   * @param material O objeto MaterialSimples que o usuário quer visualizar.
   */
  visualizarMaterial(material: MaterialSimples): void {
    this.disciplinaService.visualizarMaterial(material.id).subscribe({
      next: (blob) => {
        // Cria um blob URL a partir do blob recebido
        const blobUrl = URL.createObjectURL(blob);

        // Abre o PDF em uma nova janela/aba
        const newWindow = window.open(blobUrl, '_blank');

        // Foca na nova janela (pode ser bloqueado pelo navegador)
        if (newWindow) {
          newWindow.focus();
        }

        // Limpa o blob URL após um tempo (opcional)
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = "Não foi possível visualizar o material. Tente novamente.";
        console.error("Erro ao visualizar material:", err);
      }
    });
  }

  // --- FUNÇÕES DE AJUDA ---
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getMaterialIcon(fileOrMaterial: File | MaterialSimples): IconDefinition {
    const name = 'name' in fileOrMaterial ? fileOrMaterial.name : fileOrMaterial.nomeArquivo;
    const extensao = name.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return faFilePdf;
      case 'pptx': case 'ppt': return faFilePowerpoint;
      case 'docx': case 'doc': return faFileWord;
      default: return faFile;
    }
  }

  getMaterialIconClass(fileOrMaterial: File | MaterialSimples): string {
    const name = 'name' in fileOrMaterial ? fileOrMaterial.name : fileOrMaterial.nomeArquivo;
    const extensao = name.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return 'text-red-500';
      case 'pptx': case 'ppt': return 'text-orange-500';
      case 'docx': case 'doc': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  }
}