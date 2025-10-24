import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { Router } from '@angular/router'; // Para o redirecionamento

// Imports de Ícones
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faPencilAlt, faMagic, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// Imports do Serviço (confirme o caminho)
import { DisciplinaService, CriarDisciplinaCommand } from '../../../disciplinas/disciplina.service';

/**
 * Componente modal para a criação rápida de uma nova disciplina.
 * Chamado a partir do Dashboard, substituindo a rota de página inteira.
 * Em caso de sucesso, redireciona o usuário para a lista de disciplinas.
 */
@Component({
  selector: 'app-criar-disciplina-modal', // Seletor padrão
  standalone: true, // Componente standalone
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './criar-disciplina-modal.html',
  styleUrls: ['./criar-disciplina-modal.css']
})
export class CriarDisciplinaModalComponent implements OnChanges {

  // --- Ícones para o Template ---
  faTimes = faTimes;
  faPencilAlt = faPencilAlt; // Ícone do cabeçalho
  faMagic = faMagic;  // Ícone do "Gerar com IA"
  faSpinner = faSpinner;     // Ícone de loading
  faExclamationTriangle = faExclamationTriangle; // Ícone de erro

  // --- Inputs & Outputs ---
  @Input() isOpen = false;
  @Output() fecharModal = new EventEmitter<void>();

  // --- Estado do Formulário ---
  public nome = '';
  public descricao = '';

  // --- Estado da UI ---
  public isSubmitting = false;
  public errorMessage: string | null = null;

  constructor(
    private disciplinaService: DisciplinaService,
    private router: Router,
    private library: FaIconLibrary
  ) {
    // Registra os ícones que este componente usa
    this.library.addIcons(faTimes, faPencilAlt, faMagic, faSpinner, faExclamationTriangle);
  }

  /**
   * Hook que "escuta" mudanças.
   * Usamos para limpar o formulário toda vez que o modal é aberto.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      // Modal foi aberto, limpa o estado anterior
      this.resetarFormulario();
    }
  }

  /**
   * Chamado pelo botão "Criar Disciplina" (submit do formulário).
   * Valida os dados e chama o serviço.
   */
  onSubmit(): void {
    // Validação simples
    if (!this.nome || this.nome.trim() === '') {
      this.errorMessage = "O nome da disciplina é obrigatório.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    // Monta o payload para a API
    // Assumindo que a interface CriarDisciplinaCommand espera { nome, descricao }
    // (Baseado na sua página de "Atualizar Disciplina")
    const payload: any = { // Use 'any' se a interface estiver incorreta no serviço
      nome: this.nome,
      descricao: this.descricao
    };

    this.disciplinaService.criarDisciplina(payload).subscribe({
      next: (novaDisciplina) => {
        this.isSubmitting = false;

        // SUCESSO! Redireciona e fecha.
        this.router.navigate(['/disciplinas']); // Redireciona para a lista
        this.onFecharModal(); // Fecha o modal
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || "Ocorreu um erro ao criar a disciplina.";
        console.error("Erro ao criar disciplina:", err);
      }
    });
  }

  /**
   * Emite o evento de fechamento (chamado pelo "X" ou "Cancelar").
   * Só permite fechar se não estiver enviando.
   */
  onFecharModal(): void {
    if (!this.isSubmitting) {
      this.fecharModal.emit();
    }
  }

  /**
   * Limpa o estado do formulário e mensagens de erro.
   */
  private resetarFormulario(): void {
    this.nome = '';
    this.descricao = '';
    this.isSubmitting = false;
    this.errorMessage = null;
  }
}