import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faPencilAlt, faMagic, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// --- MUDANÇA: Importar interfaces para Criar e ATUALIZAR ---
import { DisciplinaService, CriarDisciplinaCommand, AtualizarDisciplinaCommand, DisciplinaResponse } from '../../../disciplinas/disciplina.service'; // Confirme o nome 'AtualizarDisciplinaCommand'

/**
 * Componente modal para CRIAÇÃO e EDIÇÃO rápida de disciplinas.
 * Chamado a partir de diferentes locais (Dashboard, Lista de Disciplinas).
 * - Em modo CRIAÇÃO: Redireciona para /disciplinas após sucesso.
 * - Em modo EDIÇÃO: Emite 'disciplinaAtualizada' após sucesso.
 */
@Component({
  selector: 'app-criar-disciplina-modal',
  standalone: true,
  imports: [ CommonModule, FormsModule, FontAwesomeModule ],
  templateUrl: './criar-disciplina-modal.html',
  styleUrls: ['./criar-disciplina-modal.css']
})
export class CriarDisciplinaModalComponent implements OnChanges {

  // --- Ícones ---
  faTimes = faTimes;
  faPencilAlt = faPencilAlt;
  faMagic = faMagic;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;

  // --- Inputs & Outputs ---
  @Input() isOpen = false;
  /** Opcional: ID da disciplina a ser editada. Se nulo, o modal opera em modo "Criar". */
  @Input() disciplinaIdParaEditar: string | null = null;

  @Output() fecharModal = new EventEmitter<void>();
  /** Emite quando uma disciplina é ATUALIZADA com sucesso. */
  @Output() disciplinaAtualizada = new EventEmitter<DisciplinaResponse>(); // Envia a disciplina atualizada
  @Output() disciplinaCriada = new EventEmitter<DisciplinaResponse>();
  // --- Estado do Formulário ---
  public nome = '';
  public descricao = '';

  // --- Estado da UI ---
  public modoEdicao = false; // Flag para controlar o modo
  public isLoadingDetalhes = false; // Loading ao buscar dados para edição
  public isSubmitting = false; // Loading ao salvar (criar ou editar)
  public errorMessage: string | null = null;
  public tituloModal = 'Nova Disciplina'; // Título dinâmico
  public textoBotaoSubmit = 'Criar Disciplina'; // Texto do botão dinâmico

  constructor(
    private disciplinaService: DisciplinaService,
    private router: Router,
    private library: FaIconLibrary
  ) {
    this.library.addIcons(faTimes, faPencilAlt, faMagic, faSpinner, faExclamationTriangle);
  }

  /**
   * Hook que detecta mudanças nos @Inputs.
   * Decide se o modal deve operar em modo "Criar" ou "Editar" e carrega dados se necessário.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Se 'isOpen' mudou E o modal está sendo aberto
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.resetarFormulario(); // Sempre reseta ao abrir

      // Verifica se um ID foi passado para edição
      if (this.disciplinaIdParaEditar) {
        this.modoEdicao = true;
        this.tituloModal = 'Editar Disciplina';
        this.textoBotaoSubmit = 'Salvar Alterações';
        this.carregarDetalhesDisciplina(); // Busca dados para preencher o form
      } else {
        // Modo Criação (padrão)
        this.modoEdicao = false;
        this.tituloModal = 'Nova Disciplina';
        this.textoBotaoSubmit = 'Criar Disciplina';
        // Não precisa carregar nada, apenas o formulário limpo.
      }
    }
    // Se o modal foi fechado (isOpen tornou-se false), o reset já aconteceu no resetarFormulario
     if (changes['isOpen'] && !changes['isOpen'].currentValue) {
        this.disciplinaIdParaEditar = null; // Garante limpar o ID ao fechar
        this.modoEdicao = false;
    }
  }

  /**
   * Busca os dados da disciplina existente para preencher o formulário no modo Edição.
   */
  private carregarDetalhesDisciplina(): void {
    if (!this.disciplinaIdParaEditar) return;

    this.isLoadingDetalhes = true;
    this.errorMessage = null;

    this.disciplinaService.buscarDisciplinaPorId(this.disciplinaIdParaEditar).subscribe({
      next: (disciplina) => {
        this.nome = disciplina.nome;
        this.descricao = disciplina.descricao;
        this.isLoadingDetalhes = false;
      },
      error: (err) => {
        console.error("Erro ao buscar detalhes da disciplina para edição:", err);
        this.errorMessage = "Não foi possível carregar os dados da disciplina. Tente fechar e abrir novamente.";
        this.isLoadingDetalhes = false;
      }
    });
  }

  /**
   * Chamado pelo submit do formulário.
   * Decide se chama o serviço de criar ou atualizar.
   */
  onSubmit(): void {
    if (!this.nome || this.nome.trim() === '') {
      this.errorMessage = "O nome da disciplina é obrigatório.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    if (this.modoEdicao && this.disciplinaIdParaEditar) {
      // --- LÓGICA DE ATUALIZAÇÃO ---
      const payload: AtualizarDisciplinaCommand = { // Use a interface correta
        nome: this.nome,
        descricao: this.descricao
      };
      this.disciplinaService.atualizarDisciplina(this.disciplinaIdParaEditar, payload).subscribe({
        next: (disciplinaAtualizada) => {
          this.isSubmitting = false;
          this.disciplinaAtualizada.emit(disciplinaAtualizada); // Emite o evento de sucesso
          this.onFecharModal(); // Fecha o modal
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || "Ocorreu um erro ao atualizar a disciplina.";
          console.error("Erro ao atualizar disciplina:", err);
        }
      });
    } else {// --- LÓGICA DE CRIAÇÃO---
      const payload: CriarDisciplinaCommand = { nome: this.nome, descricao: this.descricao };
      this.disciplinaService.criarDisciplina(payload).subscribe({
        next: (novaDisciplina) => {
          this.isSubmitting = false;
          // --- MUDANÇA: Emitir o evento ANTES de navegar ---
          this.disciplinaCriada.emit(novaDisciplina);
          // --- Fim da Mudança ---
          this.router.navigate(['/disciplinas']); // Mantém a navegação
          this.onFecharModal();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || "Ocorreu um erro ao criar a disciplina.";
          console.error("Erro ao criar disciplina:", err);
        }
      });
    }
  }

  /**
   * Emite o evento de fechamento (chamado pelo "X" ou "Cancelar").
   * Só permite fechar se não estiver enviando ou carregando detalhes.
   */
  onFecharModal(): void {
    if (!this.isSubmitting && !this.isLoadingDetalhes) {
      this.fecharModal.emit();
    }
  }

  /**
   * Limpa o estado do formulário e flags. Chamado ao abrir ou fechar.
   */
  private resetarFormulario(): void {
    this.nome = '';
    this.descricao = '';
    this.isSubmitting = false;
    this.errorMessage = null;
    this.isLoadingDetalhes = false;
    // Não reseta modoEdicao ou titulo/botao aqui, ngOnChanges cuida disso ao ABRIR.
    // this.disciplinaIdParaEditar = null; // Resetado ao FECHAR em ngOnChanges
  }
}