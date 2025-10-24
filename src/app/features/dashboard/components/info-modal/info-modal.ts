import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf

// Imports de Ícones
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTimes, faExclamationTriangle, faPlus } from '@fortawesome/free-solid-svg-icons'; // Ícones para aviso e ação

/**
 * Componente modal genérico para exibir mensagens informativas ou de aviso.
 * Recebe título e mensagem como @Inputs e emite eventos para fechamento
 * ou para uma ação principal.
 */
@Component({
  selector: 'app-info-modal', // Seletor padrão
  standalone: true, // Componente standalone
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './info-modal.html',
  styleUrls: ['./info-modal.css']
})
export class InfoModalComponent {

  // --- Ícones para o Template ---
  faTimes = faTimes;
  faExclamationTriangle = faExclamationTriangle; // Ícone de aviso
  faPlus = faPlus; // Ícone para o botão de ação (ex: Criar Disciplina)

  // --- Inputs (Recebidos do componente pai, ex: Dashboard) ---

  /** Controla se o modal está visível. */
  @Input() isOpen = false;
  /** O título exibido no cabeçalho do modal. */
  @Input() title = 'Atenção';
  /** A mensagem principal exibida no corpo do modal. */
  @Input() message = '';

  // --- Outputs (Emitidos para o componente pai) ---

  /** Emite quando o modal deve ser fechado (clique no 'X', 'Cancelar', ou overlay). */
  @Output() closeModal = new EventEmitter<void>();
  /** Emite quando o botão de ação principal (ex: "Criar Disciplina Agora") é clicado. */
  @Output() actionClicked = new EventEmitter<void>();

  constructor(library: FaIconLibrary) {
    // Registra os ícones usados por este modal
    library.addIcons(faTimes, faExclamationTriangle, faPlus);
  }

  /**
   * Chamado pelo botão 'Cancelar'/'Fechar' ou clique no overlay.
   * Emite o evento 'closeModal'.
   */
  onClose(): void {
    this.closeModal.emit();
  }

  /**
   * Chamado pelo botão de ação principal.
   * Emite o evento 'actionClicked'.
   */
  onAction(): void {
    this.actionClicked.emit();
  }
}