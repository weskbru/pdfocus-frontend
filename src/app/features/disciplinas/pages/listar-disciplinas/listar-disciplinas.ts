import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { Router, RouterModule } from '@angular/router'; // Para navegação e routerLink
import { FormsModule } from '@angular/forms';

// --- Imports do FontAwesome ---
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCrown, faPlus, faFolderOpen, faFilter, faSortAlphaDown, faSearch, faBookOpen, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'; // Ícones usados no template

// --- Import do Modal (Ajuste o caminho se necessário) ---
// Assumindo que o modal está em 'features/dashboard/components/...' e esta página está em 'features/disciplinas/pages/...'
import { CriarDisciplinaModalComponent } from '../../../dashboard/components/criar-disciplina-modal/criar-disciplina-modal';

import { DisciplinaService, DisciplinaResponse } from '../../disciplina.service'; // Seu serviço

/**
 * Componente responsável por listar e gerir as disciplinas do utilizador.
 * Permite criar, visualizar, editar (via modal) e deletar disciplinas.
 */
@Component({
  selector: 'app-listar-disciplinas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FontAwesomeModule,             // Módulo do FontAwesome
    CriarDisciplinaModalComponent  // O modal que será usado para criar/editar
  ],
  templateUrl: './listar-disciplinas.html',
  styleUrls: ['./listar-disciplinas.css']
})
export class ListarDisciplinas implements OnInit {

  // --- Propriedades da Lista ---
  public disciplinas: DisciplinaResponse[] = [];
  public isLoading = false;
  public errorMessage: string | null = null;
  public disciplinasOriginais: DisciplinaResponse[] = []
  // --- MUDANÇA 3: Propriedades para Filtro/Ordenação ---
  public filtroSelecionado: string = 'todas'; // Para o dropdown de Filtro (futuro)
  public ordemSelecionada: string = 'nome-az'; // Valor inicial para ordenação
  public termoBusca: string = ''; // Valor inicial para o campo de busca

  // --- Propriedades do Modal de Deleção ---
  public disciplinaParaDeletar: DisciplinaResponse | null = null;
  public showDeleteModal = false;

  // --- Propriedades do Modal de Criação/Edição ---
  public isCriarDisciplinaModalOpen = false;
  /** Armazena o ID da disciplina sendo editada, ou null se estiver criando. */
  public disciplinaIdSendoEditada: string | null = null;

  // --- Propriedades para Ícones FontAwesome (Acessíveis no Template) ---
  faCrown = faCrown;
  faPlus = faPlus;
  faFolderOpen = faFolderOpen;
  faFilter = faFilter;
  faSortAlphaDown = faSortAlphaDown;
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faEdit = faEdit;
  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;

  constructor(
    private disciplinaService: DisciplinaService,
    private router: Router,
    library: FaIconLibrary // Injeta a biblioteca do FontAwesome
  ) {
    // Registra os ícones específicos usados neste componente
    library.addIcons(
      faCrown, faPlus, faFolderOpen, faFilter, faSortAlphaDown, faSearch,
      faBookOpen, faEdit, faTrash, faExclamationTriangle
    );
  }

  /**
   * Método de ciclo de vida do Angular. Executado na inicialização.
   * Carrega a lista inicial de disciplinas.
   */
  ngOnInit(): void {
    this.carregarDisciplinas();
  }

  /**
   * Busca a lista de disciplinas do utilizador através do serviço.
   * Atualiza as flags de loading e erro.
   */
  carregarDisciplinas(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.disciplinaService.buscarDisciplinas().subscribe({
      next: (data) => {
        this.disciplinasOriginais = data; // Armazena a lista original
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Falha ao carregar as disciplinas. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
        console.error('Erro ao buscar disciplinas:', err);
      }
    });
  }

  /**
   * Retorna a lista de disciplinas filtrada pelo termo de busca e
   * ordenada conforme a opção selecionada.
   * Este getter é usado pelo *ngFor no template.
   */
  get disciplinasFiltradasEOrdenadas(): DisciplinaResponse[] {
    let items = [...this.disciplinasOriginais]; // Sempre começa com a lista completa

    // 1. Aplicar Filtro de Busca (case-insensitive no nome)
    if (this.termoBusca && this.termoBusca.trim() !== '') {
      const termoLower = this.termoBusca.toLowerCase().trim();
      items = items.filter(disciplina =>
        disciplina.nome.toLowerCase().includes(termoLower)
      );
    }

    // 2. Aplicar Ordenação
    if (this.ordemSelecionada === 'nome-az') {
      items.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (this.ordemSelecionada === 'nome-za') {
      items.sort((a, b) => b.nome.localeCompare(a.nome));
    }
    // TODO: Adicionar lógica para outros filtros (ex: 'Recentes') se/quando implementado

    return items;
  }

  // --- Métodos para o Modal de Criação/Edição ---

  /** Abre o modal no modo CRIAÇÃO (sem passar ID). */
  abrirModalCriarDisciplina(): void {
    this.disciplinaIdSendoEditada = null; // Garante que está no modo criação
    this.isCriarDisciplinaModalOpen = true;
  }

  /**
   * Abre o modal no modo EDIÇÃO, passando o ID da disciplina.
   * @param id O ID da disciplina a ser editada.
   */
  editarDisciplina(id: string): void {
    this.disciplinaIdSendoEditada = id; // Define o ID para o modo edição
    this.isCriarDisciplinaModalOpen = true; // Abre o mesmo modal
  }

  /** Fecha o modal de Criação/Edição e limpa o ID de edição. */
  fecharModalCriarDisciplina(): void {
    this.isCriarDisciplinaModalOpen = false;
    // Pequeno delay para garantir que a animação de fechar termine antes de limpar,
    // evitando que o modal pisque com dados antigos se reaberto rapidamente.
    setTimeout(() => {
      this.disciplinaIdSendoEditada = null;
    }, 300); // 300ms (ajuste conforme a duração da animação CSS)
  }

  /**
   * Chamado quando o modal emite o evento 'disciplinaAtualizada'.
   * Fecha o modal e recarrega a lista para mostrar a alteração.
   * @param disciplinaAtualizada Os dados atualizados da disciplina (opcionalmente usado para atualizar localmente).
   */
  onDisciplinaAtualizada(disciplinaAtualizada: DisciplinaResponse): void {
    this.fecharModalCriarDisciplina(); // Fecha o modal
    // Recarrega a lista inteira da API
    this.carregarDisciplinas();
    // TODO (Opcional): Em vez de recarregar tudo, encontrar e atualizar
    // 'disciplinaAtualizada' na array 'this.disciplinas' localmente para melhor performance.
  }

/**
   * Chamado quando o modal emite o evento 'disciplinaCriada'.
   * Recarrega a lista de disciplinas para exibir a nova entrada.
   * @param novaDisciplina A disciplina que acabou de ser criada (opcionalmente usada para UI otimista).
   */
  onDisciplinaCriada(novaDisciplina: DisciplinaResponse): void {
     // this.fecharModalCriarDisciplina(); // O modal já se fecha e navega
     console.log('Nova disciplina criada via modal, recarregando lista...', novaDisciplina); // Log para confirmar
     this.carregarDisciplinas(); // Recarrega a lista da API
  }

  /**
   * Navega para a página de upgrade (lógica futura).
   */
  navegarParaUpgrade(): void {
    console.log('Navegando para a página de upgrade...');
    // Exemplo: this.router.navigate(['/planos']);
  }

  // --- LÓGICA DO MODAL DE DELEÇÃO ---

  /**
   * Abre o modal de confirmação para apagar uma disciplina.
   * @param disciplina A disciplina a ser apagada.
   */
  abrirModalDelecao(disciplina: DisciplinaResponse): void {
    this.disciplinaParaDeletar = disciplina;
    this.showDeleteModal = true;
  }

  /**
   * Fecha o modal de confirmação de deleção.
   */
  fecharModalDelecao(): void {
    this.disciplinaParaDeletar = null;
    this.showDeleteModal = false;
  }

  /**
   * Confirma a exclusão, chama o serviço e atualiza a UI removendo o item localmente.
   */
  confirmarDelecao(): void {
    if (!this.disciplinaParaDeletar) return;
    const idParaDeletar = this.disciplinaParaDeletar.id;

    // TODO: Adicionar feedback de loading visual (desabilitar botões, spinner)
    this.disciplinaService.deletarDisciplina(idParaDeletar).subscribe({
      next: () => {
       // Atualiza a lista ORIGINAL na UI para remover a disciplina apagada.
       // O getter 'disciplinasFiltradasEOrdenadas' usará esta lista atualizada.
       this.disciplinasOriginais = this.disciplinasOriginais.filter(d => d.id !== idParaDeletar); // <-- Linha CORRIGIDA
       this.fecharModalDelecao();
       // TODO: Mostrar notificação de sucesso (toast)
     },
      error: (err) => {
        // Exibe erro na UI (idealmente seria um toast, não o errorMessage da lista)
        // this.errorMessage = 'Não foi possível apagar a disciplina. Tente novamente.';
        alert('Erro ao apagar disciplina: ' + (err.message || 'Erro desconhecido')); // Exemplo simples com alert
        console.error('Erro ao apagar disciplina:', err);
        this.fecharModalDelecao(); // Fecha o modal mesmo com erro
      }
    });
  }
}