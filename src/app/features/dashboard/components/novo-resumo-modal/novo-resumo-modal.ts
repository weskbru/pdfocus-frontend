import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { DisciplinaService, DisciplinaResponse, MaterialSimples } from '../../../disciplinas/disciplina.service';

/**
 * Componente modal "inteligente" para criação de um novo resumo a partir do Dashboard.
 *
 * Este modal é responsável por:
 * 1. Buscar e exibir a lista de disciplinas do usuário.
 * 2. Buscar e exibir a lista de materiais de uma disciplina selecionada.
 * 3. Lidar com o caso de uma disciplina não possuir materiais ("beco sem saída").
 * 4. Navegar o usuário para a página de criação de resumo com o material selecionado.
 */
@Component({
  selector: 'app-novo-resumo-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './novo-resumo-modal.html',
  styleUrls: ['./novo-resumo-modal.css']
})
export class NovoResumoDashboardModalComponent implements OnChanges {

  // --- Ícones para o Template ---
  faTimes = faTimes;
  faCheck = faCheck;
  faPlus = faPlus;

  // --- Inputs & Outputs ---

  /** Controla a visibilidade do modal. Recebido do componente pai (Dashboard). */
  @Input() isOpen = false;

  /** Emite um evento quando o modal solicita ser fechado (clique no 'X', 'Cancelar', ou overlay). */
  @Output() fecharModal = new EventEmitter<void>();

  // --- Estado Interno do Formulário ---
  public disciplinas: DisciplinaResponse[] = [];
  public materiais: MaterialSimples[] = [];

  public selectedDisciplinaId: string | null = null;
  public selectedMaterialId: string | null = null;

  // --- Flags de Estado da UI ---
  public isLoadingDisciplinas = false;
  public isLoadingMateriais = false;
  
  /** Flag para o caso de "beco sem saída" (disciplina sem materiais). */
  public semMateriais = false;

  // --- Injeção de Dependência ---
  constructor(
    private disciplinaService: DisciplinaService,
    private router: Router,
    private library: FaIconLibrary
  ) {
    // Registra os ícones usados especificamente neste componente standalone
    this.library.addIcons(faTimes, faCheck, faPlus);
  }

  // --- Métodos de Ciclo de Vida ---

  /**
   * Hook do ciclo de vida que detecta mudanças nos @Inputs.
   * Usado para disparar o carregamento de dados quando o modal é aberto
   * e limpar o estado quando é fechado.
   * @param changes Objeto contendo as mudanças de @Input.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (changes['isOpen'].currentValue === true) {
        // O modal acabou de ser aberto
        this.carregarDisciplinas();
      } else {
        // O modal acabou de ser fechado
        this.resetarEstado();
      }
    }
  }

  // --- Métodos de Ação (Chamados pelo Template) ---

  /**
   * Disparado quando o usuário seleciona uma disciplina (Passo 1).
   * Inicia a busca pelos materiais daquela disciplina (Passo 2).
   */
  onDisciplinaChange(): void {
    // Limpa estados anteriores
    this.materiais = [];
    this.selectedMaterialId = null;
    this.semMateriais = false;

    if (this.selectedDisciplinaId) {
      this.isLoadingMateriais = true;
      this.carregarMateriais(this.selectedDisciplinaId);
    }
  }

  /**
   * Disparado pelo botão "Iniciar Resumo".
   * Navega o usuário para a página de criação de resumo com o ID do material selecionado.
   */
  confirmarSelecao(): void {
    if (this.selectedMaterialId) {
      this.router.navigate(['/app/resumos/criar', this.selectedMaterialId]);
      this.onFecharModal();
    }
  }

  /**
   * Disparado pelo botão de ajuda "Adicionar Material" (no caso "sem materiais").
   * Leva o usuário à página de detalhes da disciplina selecionada.
   */
  irParaDisciplina(): void {
    if (!this.selectedDisciplinaId) return; // Guarda de segurança

    this.router.navigate(['/disciplinas/detalhe', this.selectedDisciplinaId]);
    this.onFecharModal();
  }

  /**
   * Emite o evento para fechar o modal.
   * Chamado pelo botão "Cancelar", "X", ou clique no overlay.
   */
  onFecharModal(): void {
    this.fecharModal.emit();
  }

  // --- Métodos Privados de Busca de Dados e Helpers ---

  /**
   * Busca a lista de todas as disciplinas do usuário.
   */
  private carregarDisciplinas(): void {
    this.isLoadingDisciplinas = true;
    this.disciplinaService.buscarDisciplinas().subscribe({
      next: (data) => {
        this.disciplinas = data;
        this.isLoadingDisciplinas = false;
      },
      error: (err) => {
        console.error("Erro ao buscar disciplinas", err);
        this.isLoadingDisciplinas = false;
      }
    });
  }

  /**
   * Busca os materiais de uma disciplina específica.
   * @param disciplinaId O ID da disciplina selecionada.
   */
  private carregarMateriais(disciplinaId: string): void {
    // Pede 'size: 1000' para garantir que todos os materiais
    // da disciplina sejam listados no dropdown (API é paginada).
    this.disciplinaService.buscarDetalhesDisciplina(disciplinaId, 0, 1000).subscribe({
      next: (detalhes) => {
        this.materiais = detalhes.materiais.content;
        this.isLoadingMateriais = false;

        // Ativa a flag do "beco sem saída" se a lista de materiais estiver vazia
        if (this.materiais.length === 0) {
          this.semMateriais = true;
        }
      },
      error: (err) => {
        console.error("Erro ao buscar materiais da disciplina", err);
        this.isLoadingMateriais = false;
        this.semMateriais = false;
      }
    });
  }

  /**
   * Limpa todo o estado interno do modal.
   * Chamado quando o modal é fechado (via ngOnChanges).
   */
  private resetarEstado(): void {
    this.disciplinas = [];
    this.materiais = [];
    this.selectedDisciplinaId = null;
    this.selectedMaterialId = null;
    this.isLoadingDisciplinas = false;
    this.isLoadingMateriais = false;
    this.semMateriais = false;
  }
}